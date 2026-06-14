<?php

namespace App\Controller\Api;

use App\Entity\Langue;
use App\Entity\Media;
use App\Entity\Laverie;
use App\Entity\LaverieFavori;
use App\Entity\Utilisateur;
use App\Entity\UtilisateurPreference;
use App\Enum\StatutUtilisateurEnum;
use App\Enum\ThemePreferenceEnum;
use App\Repository\LangueRepository;
use App\Repository\LaverieFavoriRepository;
use App\Entity\Professionnel;
use App\Enum\StatutProfessionnelEnum;
use App\Repository\ProfessionnelRepository;
use App\Service\Professionnel\ProfessionnelLaverieFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Throwable;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class ApiProfilController extends AbstractController
{
    protected function getValidatedProfessionnel(ProfessionnelRepository $professionnelRepository): Professionnel|JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof Utilisateur) {
            return $this->json(['erreur' => 'Utilisateur non authentifié'], 401);
        }

        $professionnel = $professionnelRepository->findOneByUtilisateur($user);

        if (!$professionnel) {
            return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
        }

        if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
            return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
        }

        return $professionnel;
    }

    #[Route('/api/profil/photo-profil', name: 'api_profil_photo_upload', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadPhotoProfil(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        ProfessionnelRepository $professionnelRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['erreur' => 'Utilisateur non authentifié'], 401);
        }

        $professionnel = $professionnelRepository->findOneByUtilisateur($utilisateur);
        if (!$professionnel) {
            return $this->json(['erreur' => 'Aucun profil professionnel lié à ce compte'], 403);
        }

        $photo = $request->files->get('photoProfil');
        if (!$photo instanceof UploadedFile) {
            return $this->json(['erreur' => 'Aucun fichier fourni'], 400);
        }

        $photoSize = (int) $photo->getSize();
        if ($photoSize > 5 * 1024 * 1024) {
            return $this->json(['erreur' => 'La photo de profil doit faire au maximum 5 Mo'], 400);
        }

        $mimeType = strtolower((string) $photo->getMimeType());
        $clientExtension = strtolower((string) $photo->getClientOriginalExtension());
        $allowedMimeTypes = [
            'image/png',
            'image/x-png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
            'image/gif',
        ];
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

        $isAllowedByMime = in_array($mimeType, $allowedMimeTypes, true);
        $isAllowedByGenericMimeWithExtension = $mimeType === 'application/octet-stream'
            && in_array($clientExtension, $allowedExtensions, true);

        if (!$isAllowedByMime && !$isAllowedByGenericMimeWithExtension) {
            return $this->json(['erreur' => 'Format de photo non supporté'], 400);
        }

        $normalizedMimeByExtension = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
        ];

        $resolvedMimeType = $mimeType;
        if ($isAllowedByGenericMimeWithExtension) {
            $resolvedMimeType = $normalizedMimeByExtension[$clientExtension] ?? 'image/png';
        }

        $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/professionnels';
        if (!is_dir($uploadsDirectory)) {
            mkdir($uploadsDirectory, 0775, true);
        }

        $originalFileName = pathinfo($photo->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFileName = strtolower((string) $slugger->slug($originalFileName));
        $guessedExtension = strtolower((string) $photo->guessExtension());
        $extension = $guessedExtension !== '' && $guessedExtension !== 'bin'
            ? $guessedExtension
            : ($clientExtension !== '' ? $clientExtension : 'bin');
        $storedFileName = $safeFileName . '-' . uniqid('', true) . '.' . $extension;

        $photo->move($uploadsDirectory, $storedFileName);

        $media = new Media();
        $media->setEmplacement('/uploads/professionnels/' . $storedFileName);
        $media->setNomOriginel($photo->getClientOriginalName());
        $media->setPoids($photoSize);
        $media->setMimeType($resolvedMimeType);
        $entityManager->persist($media);

        $anciennePhoto = $professionnel->getPhotoProfil();
        $professionnel->setPhotoProfil($media);
        $entityManager->flush();

        if ($anciennePhoto && $formatter->isProjectManagedMediaPath($anciennePhoto->getEmplacement())) {
            $absoluteOldPath = $this->getParameter('kernel.project_dir') . '/public' . $anciennePhoto->getEmplacement();
            if (is_string($absoluteOldPath) && file_exists($absoluteOldPath)) {
                @unlink($absoluteOldPath);
            }
            $entityManager->remove($anciennePhoto);
            $entityManager->flush();
        }

        return $this->json([
            'message' => 'Photo de profil mise à jour avec succès',
            'photoProfil' => $formatter->toPublicMediaUrl($media->getEmplacement(), $request),
        ], 200);
    }

    #[Route('/api/profil/photo-profil', name: 'api_profil_photo_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deletePhotoProfil(
        EntityManagerInterface $entityManager,
        ProfessionnelRepository $professionnelRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['erreur' => 'Utilisateur non authentifié'], 401);
        }

        $professionnel = $professionnelRepository->findOneByUtilisateur($utilisateur);
        if (!$professionnel) {
            return $this->json(['erreur' => 'Aucun profil professionnel lié à ce compte'], 403);
        }

        $photo = $professionnel->getPhotoProfil();
        if (!$photo) {
            return $this->json(['message' => 'Aucune photo de profil à supprimer'], 200);
        }

        $professionnel->setPhotoProfil(null);
        $entityManager->flush();

        if ($formatter->isProjectManagedMediaPath($photo->getEmplacement())) {
            $absolutePath = $this->getParameter('kernel.project_dir') . '/public' . $photo->getEmplacement();
            if (is_string($absolutePath) && file_exists($absolutePath)) {
                @unlink($absolutePath);
            }
        }

        $entityManager->remove($photo);
        $entityManager->flush();

        return $this->json(['message' => 'Photo de profil supprimée avec succès'], 200);
    }
    
    #[Route('/api/profil/favoris', name: 'api_profil_favoris', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getFavoris(Request $request, LaverieFavoriRepository $favoriRepository): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        if ($utilisateur->isProfessionnel()) {
            return $this->json(['message' => 'Accès réservé aux utilisateurs non professionnels.'], 403);
        }

        $favoris = array_map(
            function (LaverieFavori $favori) use ($request): array {
                $laverie = $favori->getLaverie();
                $logo = $laverie->getLogo();
                $logoEmplacement = $logo?->getEmplacement();
                $image = is_string($logoEmplacement) && str_starts_with($logoEmplacement, '/uploads/')
                    ? $request->getSchemeAndHttpHost() . $logoEmplacement
                    : null;

                return [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'adresse' => $laverie->getAdresse()->getAdresse(),
                    'codePostal' => $laverie->getAdresse()->getCodePostal(),
                    'ville' => $laverie->getAdresse()->getVille(),
                    'statut' => $laverie->getStatut()->value,
                    'description' => $laverie->getDescription(),
                    'dateAjout' => $laverie->getDateAjout()?->format('d/m/Y'),
                    'dateModification' => $laverie->getDateModification()?->format('d/m/Y'),
                    'image' => $image,
                    'imageAlt' => $laverie->getNomEtablissement(),
                ];
            },
            $favoriRepository->findVisibleFavorisByUtilisateur($utilisateur)
        );

        return $this->json([
            'favoris' => $favoris,
            'total' => count($favoris),
        ]);
    }

    #[Route('/api/profil/favoris/{laverieId}', name: 'api_profil_favoris_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteFavori(int $laverieId, EntityManagerInterface $entityManager): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        if ($utilisateur->isProfessionnel()) {
            return $this->json(['message' => 'Accès réservé aux utilisateurs non professionnels.'], 403);
        }

        $laverie = $entityManager->getRepository(Laverie::class)->find($laverieId);
        if (!$laverie instanceof Laverie) {
            return $this->json(['message' => 'Laverie introuvable.'], 404);
        }

        $favori = $entityManager->getRepository(LaverieFavori::class)->findOneBy([
            'utilisateur' => $utilisateur,
            'laverie' => $laverie,
        ]);

        if (!$favori instanceof LaverieFavori) {
            return $this->json(['message' => 'Ce favori est introuvable.'], 404);
        }

        $utilisateur->removeFavori($favori);
        $laverie->removeFavori($favori);

        $entityManager->remove($favori);
        $entityManager->flush();

        return $this->json(['message' => 'Favori supprimé avec succès.'], 200);
    }

    #[Route('/api/profil/favoris/{laverieId}', name: 'api_profil_favoris_add', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function addFavori(int $laverieId, EntityManagerInterface $entityManager, LoggerInterface $logger): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        if ($utilisateur->isProfessionnel()) {
            return $this->json(['message' => 'Accès réservé aux utilisateurs non professionnels.'], 403);
        }

        $laverie = $entityManager->getRepository(Laverie::class)->find($laverieId);
        if (!$laverie instanceof Laverie) {
            return $this->json(['message' => 'Laverie introuvable.'], 404);
        }

        // Vérifier que la laverie n'est pas supprimée
        if ($laverie->getSupprimee_le() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], 404);
        }

        // Vérifier que la laverie n'est déjà pas en favoris
        $favoriExistant = $entityManager->getRepository(LaverieFavori::class)->findOneBy([
            'utilisateur' => $utilisateur,
            'laverie' => $laverie,
        ]);

        if ($favoriExistant instanceof LaverieFavori) {
            return $this->json(['message' => 'Cette laverie est déjà en favoris.'], 200);
        }

        // Ajouter aux favoris
        try {
            $favori = new LaverieFavori();
            $utilisateur->addFavori($favori);
            $laverie->addFavori($favori);

            $entityManager->persist($favori);
            $entityManager->flush();
        } catch (Throwable $e) {
            $logger->error('Echec ajout favori', [
                'utilisateur_id' => $utilisateur->getId(),
                'laverie_id' => $laverie->getId(),
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ]);
            return $this->json(['message' => 'Erreur lors de l\'ajout aux favoris : ' . $e->getMessage()], 500);
        }

        $logger->info('Favori ajouté', [
            'utilisateur_id' => $utilisateur->getId(),
            'laverie_id' => $laverie->getId(),
        ]);

        return $this->json([
            'message' => 'Favori ajouté avec succès.',
            'favori' => [
                'utilisateur_id' => $utilisateur->getId(),
                'laverie_id' => $laverie->getId(),
            ],
        ], 201);
    }

    #[Route('/api/profil', name: 'api_profil', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getProfil(): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        $preference = $utilisateur->getPreference();

        return $this->json([
            'id' => $utilisateur->getId(),
            'email' => $utilisateur->getEmail(),
            'prenom' => $utilisateur->getPrenom(),
            'nom' => $utilisateur->getNom(),
            'statut' => $utilisateur->getStatut()->value,
            'dateCreation' => $utilisateur->getDateCreation()?->format(DATE_ATOM),
            'dateDerniereConnexion' => $utilisateur->getDateDerniereConnexion()?->format(DATE_ATOM),
            'utilisateurSupprimeLe' => $utilisateur->getUtilisateurSupprimeLe()?->format(DATE_ATOM),
            'preference' => $preference ? [
                'langueId' => $preference->getLangue()->getId(),
                'langueCode' => $preference->getLangue()->getCode(),
                'theme' => $preference->getTheme()->value,
                'notifications' => $preference->isNotifications(),
            ] : null,
            'isProfessionnel' => $utilisateur->isProfessionnel(),
        ]);
    }

    #[Route('/api/profil', name: 'api_profil_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateProfil(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        LangueRepository $langueRepository,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        $payload = json_decode($request->getContent(), true);

        if (!is_array($payload)) {
            return $this->json(['message' => 'Corps de requête invalide.'], 400);
        }

        $nom = array_key_exists('nom', $payload) ? trim((string) $payload['nom']) : null;
        $prenom = array_key_exists('prenom', $payload) ? trim((string) $payload['prenom']) : null;
        $nouveauMotDePasse = array_key_exists('nouveauMotDePasse', $payload) ? (string) $payload['nouveauMotDePasse'] : '';
        $preferencePayload = array_key_exists('preference', $payload) && is_array($payload['preference'])
            ? $payload['preference']
            : null;

        if ($nom !== null && $nom === '') {
            return $this->json(['message' => 'Le nom ne peut pas être vide.'], 400);
        }

        if ($prenom !== null && $prenom === '') {
            return $this->json(['message' => 'Le prénom ne peut pas être vide.'], 400);
        }

        if ($nom !== null) {
            $utilisateur->setNom($nom);
        }

        if ($prenom !== null) {
            $utilisateur->setPrenom($prenom);
        }

        if ($nouveauMotDePasse !== '') {
            if (mb_strlen($nouveauMotDePasse) < 8) {
                return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
            }

            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $nouveauMotDePasse));
        }

        if ($preferencePayload !== null) {
            $preference = $utilisateur->getPreference();

            if (!$preference instanceof UtilisateurPreference) {
                $preference = new UtilisateurPreference();
                $preference->setUtilisateur($utilisateur);

                $langueParDefaut = $langueRepository->findOneBy(['code' => 'fr']);
                if (!$langueParDefaut instanceof Langue) {
                    $langueParDefaut = $langueRepository->findOneBy([]);
                }

                if (!$langueParDefaut instanceof Langue) {
                    return $this->json(['message' => 'Aucune langue disponible pour créer les préférences.'], 500);
                }

                $preference->setLangue($langueParDefaut);
                $preference->setTheme(ThemePreferenceEnum::THEME_CLAIR);
                $preference->setNotifications(true);
                $entityManager->persist($preference);
            }

            if (array_key_exists('langueId', $preferencePayload)) {
                $langueId = (int) $preferencePayload['langueId'];
                $langue = $langueRepository->find($langueId);

                if (!$langue instanceof Langue) {
                    return $this->json(['message' => 'La langue sélectionnée est invalide.'], 400);
                }

                $preference->setLangue($langue);
            } elseif (array_key_exists('langueCode', $preferencePayload)) {
                $langueCode = strtolower(trim((string) $preferencePayload['langueCode']));
                $langue = $langueRepository->findOneBy(['code' => $langueCode]);

                if (!$langue instanceof Langue) {
                    return $this->json(['message' => 'Le code langue sélectionné est invalide.'], 400);
                }

                $preference->setLangue($langue);
            }

            if (array_key_exists('theme', $preferencePayload)) {
                $theme = ThemePreferenceEnum::tryFrom((string) $preferencePayload['theme']);

                if (!$theme instanceof ThemePreferenceEnum) {
                    return $this->json(['message' => 'Le thème sélectionné est invalide.'], 400);
                }

                $preference->setTheme($theme);
            }

            if (array_key_exists('notifications', $preferencePayload)) {
                if (!is_bool($preferencePayload['notifications'])) {
                    return $this->json(['message' => 'Le paramètre notifications doit être un booléen.'], 400);
                }

                $preference->setNotifications($preferencePayload['notifications']);
            }
        }

        $entityManager->flush();

        $preference = $utilisateur->getPreference();

        return $this->json([
            'message' => 'Profil mis à jour avec succès.',
            'utilisateur' => [
                'id' => $utilisateur->getId(),
                'email' => $utilisateur->getEmail(),
                'prenom' => $utilisateur->getPrenom(),
                'nom' => $utilisateur->getNom(),
                'statut' => $utilisateur->getStatut()->value,
                'dateCreation' => $utilisateur->getDateCreation()?->format(DATE_ATOM),
                'dateDerniereConnexion' => $utilisateur->getDateDerniereConnexion()?->format(DATE_ATOM),
                'utilisateurSupprimeLe' => $utilisateur->getUtilisateurSupprimeLe()?->format(DATE_ATOM),
                'preference' => $preference ? [
                    'langueId' => $preference->getLangue()->getId(),
                    'langueCode' => $preference->getLangue()->getCode(),
                    'theme' => $preference->getTheme()->value,
                    'notifications' => $preference->isNotifications(),
                ] : null,
                'isProfessionnel' => $utilisateur->isProfessionnel(),
            ],
        ]);
    }

    #[Route('/api/profil', name: 'api_profil_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deleteProfil(EntityManagerInterface $entityManager): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        $dateSuppression = new \DateTime();

        $utilisateur
            ->setStatut(StatutUtilisateurEnum::STATUT_SUPPRIME)
            ->setUtilisateurSupprimeLe($dateSuppression);

        $professionnel = $utilisateur->getProfessionnel();
        if ($professionnel !== null) {
            foreach ($professionnel->getLaveries() as $laverie) {
                if ($laverie->getSupprimee_le() === null) {
                    $laverie->setSupprimee_le($dateSuppression);
                }
            }
        }

        // Suppression RGPD : supprime toutes les notes/avis de l'utilisateur
        foreach ($utilisateur->getNotes() as $note) {
            $entityManager->remove($note);
        }

        $entityManager->flush();

        return $this->json(['message' => 'Votre compte a bien été supprimé.']);
    }
}
