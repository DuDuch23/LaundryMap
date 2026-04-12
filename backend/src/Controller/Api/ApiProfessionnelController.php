<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\LaverieEquipement;
use App\Entity\LaverieFermeture;
use App\Entity\LaverieMedia;
use App\Entity\LaverieNote;
use App\Entity\Media;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Entity\Laverie;
use App\Enum\JourEnum;
use App\Enum\StatutProfessionnelEnum;
use App\Enum\StatutUtilisateurEnum;
use App\Service\ApiSirenSiretService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiProfessionnelController extends AbstractController
{
    #[Route('/api/professionnel/tableau-bord', name: 'api_tableau_bord_pro', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function tableauBordProfessionnel(
        Request $request,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ): JsonResponse {
        try {
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json(['erreur' => 'Utilisateur non authentifié'], 401);
            }

            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            // Vérifier que le professionnel est validé
            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            // Récupérer uniquement les laveries du compte connecté
            $laveries = $entityManager->getRepository(Laverie::class)
                ->createQueryBuilder('l')
                ->innerJoin('l.professionnel', 'p')
                ->innerJoin('p.utilisateur', 'u')
                ->where('p = :professionnel')
                ->andWhere('u = :utilisateur')
                ->andWhere('l.supprimee_le IS NULL')
                ->setParameter('professionnel', $professionnel)
                ->setParameter('utilisateur', $user)
                ->orderBy('l.dateModification', 'DESC')
                ->getQuery()
                ->getResult();

            // Compter les laveries par statut
            $stats = [
                'total' => count($laveries),
                'validees' => 0,
                'en_attente' => 0,
                'refusees' => 0,
            ];

            foreach ($laveries as $laverie) {
                $statut = $laverie->getStatut()->value;
                if ($statut === 'Validée') {
                    $stats['validees']++;
                } elseif ($statut === 'En attente') {
                    $stats['en_attente']++;
                } elseif ($statut === 'Refusée') {
                    $stats['refusees']++;
                }
            }

            return $this->json([
                'professionnel' => [
                    'id' => $professionnel->getId(),
                    'prenom' => $professionnel->getUtilisateur()->getPrenom(),
                    'nom' => $professionnel->getUtilisateur()->getNom(),
                    'email' => $professionnel->getUtilisateur()->getEmail(),
                    'siren' => $professionnel->getSiren(),
                    'photoProfil' => ($professionnel->getPhotoProfil() && $this->isProjectManagedMediaPath($professionnel->getPhotoProfil()->getEmplacement()))
                        ? $this->toPublicMediaUrl($professionnel->getPhotoProfil()->getEmplacement(), $request)
                        : null,
                ],
                'stats' => $stats,
                'laveries' => array_map(function ($laverie) use ($request, $entityManager) {
                    $logo = $laverie->getLogo();
                    $logoEmplacement = ($logo && $this->isProjectManagedMediaPath($logo->getEmplacement()))
                        ? $this->toPublicMediaUrl($logo->getEmplacement(), $request)
                        : null;
                    $gallery = $this->buildGalleryResponse($laverie, $request);
                    $primaryImage = $gallery[0]['image'] ?? $logoEmplacement;

                    return [
                        'id' => $laverie->getId(),
                        'nom' => $laverie->getNomEtablissement(),
                        'adresse' => $laverie->getAdresse()->getAdresse(),
                        'codePostal' => $laverie->getAdresse()->getCodePostal(),
                        'ville' => $laverie->getAdresse()->getVille(),
                        'statut' => $laverie->getStatut()->value,
                        'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                        'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                        'image' => $primaryImage,
                        'imageAlt' => $primaryImage ? $laverie->getNomEtablissement() : null,
                        'images' => $gallery,
                        'commentairesCount' => $this->countLaverieCommentaires($laverie, $entityManager),
                        'noteMoyenne' => $this->getLaverieNoteMoyenne($laverie, $entityManager),
                        'logo' => $logoEmplacement ? [
                            'id' => $logo->getId(),
                            'image' => $logoEmplacement,
                            'alt' => $laverie->getNomEtablissement(),
                        ] : null,
                    ];
                }, $laveries),
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'erreur' => $e->getMessage(),
                'fichier' => $e->getFile(),
                'ligne' => $e->getLine(),
            ], 500);
        }
    }

    #[Route('/api/professionnel/photo-profil', name: 'api_upload_photo_profil_pro', methods: ['POST'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function uploadPhotoProfil(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
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

            if ($anciennePhoto && $this->isProjectManagedMediaPath($anciennePhoto->getEmplacement())) {
                $absoluteOldPath = $this->getParameter('kernel.project_dir') . '/public' . $anciennePhoto->getEmplacement();
                if (is_string($absoluteOldPath) && file_exists($absoluteOldPath)) {
                    @unlink($absoluteOldPath);
                }
                $entityManager->remove($anciennePhoto);
                $entityManager->flush();
            }

            return $this->json([
                'message' => 'Photo de profil mise à jour avec succès',
                'photoProfil' => $this->toPublicMediaUrl($media->getEmplacement(), $request),
            ], 200);
        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/professionnel/photo-profil', name: 'api_delete_photo_profil_pro', methods: ['DELETE'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function deletePhotoProfil(
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            $photo = $professionnel->getPhotoProfil();
            if (!$photo) {
                return $this->json(['message' => 'Aucune photo de profil à supprimer'], 200);
            }

            $professionnel->setPhotoProfil(null);
            $entityManager->flush();

            if ($this->isProjectManagedMediaPath($photo->getEmplacement())) {
                $absolutePath = $this->getParameter('kernel.project_dir') . '/public' . $photo->getEmplacement();
                if (is_string($absolutePath) && file_exists($absolutePath)) {
                    @unlink($absolutePath);
                }
            }

            $entityManager->remove($photo);
            $entityManager->flush();

            return $this->json(['message' => 'Photo de profil supprimée avec succès'], 200);
        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/inscription-professionnel', name: 'api_inscription-professionnel', methods: ['POST'])]
    public function inscription(
        Request $request,
        SerializerInterface $serializer,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ApiSirenSiretService $sirenService
    ): JsonResponse {
        try{

            $donnees = json_decode($request->getContent(), true);
    
            if (!$donnees) {
                return $this->json(['erreurs' => ['global' => 'Données invalides']], 400);
            }
    
            $erreursFront = [];
    
            $sirenOuSiret = trim($donnees['sirenOrSiret'] ?? '');
    
            $resultat = null;
            $existeSiren = $entityManager->getRepository(Professionnel::class)->findOneBy(['siren' => $sirenOuSiret]);
            $existeUtilisateur = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $donnees['email'] ?? null]);

            if($existeUtilisateur){
                $erreursFront['email'] = 'Cet email est déjà utilisé';
            }
    
            if(empty($sirenOuSiret)){
                $erreursFront['sirenOrSiret'] = 'Le numéro SIREN ou SIRET est requis';
            } elseif (!preg_match('/^\d{9}$/', $sirenOuSiret) && !preg_match('/^\d{14}$/', $sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Format invalide';
            }else if($existeSiren){
                $erreursFront['sirenOrSiret'] = 'Ce numéro SIREN/SIRET est déjà utilisé';
            }else {
                $resultat = $sirenService->verify($sirenOuSiret);
                if (!$resultat['valide']) {
                    $erreursFront['sirenOrSiret'] = 'Numéro SIREN/SIRET introuvable ou entreprise inactive';
                }
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $utilisateur = new Utilisateur();
            $utilisateur->setEmail($donnees['email'] ?? '');
            $utilisateur->setNom(!empty($donnees['nom']) ? $donnees['nom'] : null);
            $utilisateur->setPrenom(!empty($donnees['prenom']) ? $donnees['prenom'] : null);
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $donnees['password'] ?? ''));
            $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_EN_ATTENTE);
    
            $erreurs = $validator->validate($utilisateur, null, ['utilisateur:write']);
            foreach ($erreurs as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $entityManager->persist($utilisateur);
    
            $professionnel = new Professionnel();
            $professionnel->setUtilisateur($utilisateur);
            $professionnel->setStatut(StatutProfessionnelEnum::STATUT_EN_ATTENTE);
            $professionnel->setSiren((int) $resultat['siren']);
    
            $adresse = new Adresse();
            $adresse->setAdresse($donnees['adresse'] ?? '');
            $adresse->setRue($donnees['rue'] ?? '');
            $adresse->setCodePostal((int) ($donnees['codePostal'] ?? 0));
            $adresse->setVille($donnees['ville'] ?? '');
            $adresse->setPays($donnees['pays'] ?? 'France');
    
            $erreursAdresse = $validator->validate($adresse);
            foreach ($erreursAdresse as $erreur) {
                $erreursFront['adresse_' . $erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            $erreursPro = $validator->validate($professionnel);
            foreach ($erreursPro as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $entityManager->persist($adresse);
            $professionnel->setAdresse($adresse);
            $entityManager->persist($professionnel);
            $entityManager->flush();
    
            return $this->json(
                ['message' => 'Inscription réussie avec succès !'],
                201,
                [],
                ['groups' => ['professionnel:read']]
            );
        } catch (\Exception $e) {
            return $this->json([
                'erreur' => $e->getMessage(),
                'fichier' => $e->getFile(),
                'ligne' => $e->getLine(),
            ], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_get_laverie', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function getLaverie(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            $logo = $laverie->getLogo();
            $horaires = $this->buildHorairesResponse($laverie);
            $equipements = $this->buildEquipementsResponse($laverie, $entityManager);
            $gallery = $this->buildGalleryResponse($laverie, $request);
            $primaryImage = $gallery[0]['image'] ?? (($logo && $this->isProjectManagedMediaPath($logo->getEmplacement()))
                ? $this->toPublicMediaUrl($logo->getEmplacement(), $request)
                : null);

            return $this->json([
                'id' => $laverie->getId(),
                'nom' => $laverie->getNomEtablissement(),
                'adresse' => $laverie->getAdresse()->getAdresse(),
                'codePostal' => $laverie->getAdresse()->getCodePostal(),
                'ville' => $laverie->getAdresse()->getVille(),
                'pays' => $laverie->getAdresse()->getPays(),
                'email' => $laverie->getContactEmail(),
                'description' => $laverie->getDescription(),
                'wiLineReference' => $laverie->getWiLineReference(),
                'statut' => $laverie->getStatut()->value,
                'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                'image' => $primaryImage,
                'images' => $gallery,
                'horaires' => $horaires,
                'equipements' => $equipements,
                'commentairesCount' => $this->countLaverieCommentaires($laverie, $entityManager),
                'noteMoyenne' => $this->getLaverieNoteMoyenne($laverie, $entityManager),
            ], 200);

        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_update_laverie', methods: ['PUT', 'POST'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function updateLaverie(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            $adresseEntity = $laverie->getAdresse();

            $nom = trim((string) $request->request->get('nom', $laverie->getNomEtablissement()));
            $adresse = trim((string) $request->request->get('adresse', $adresseEntity->getAdresse()));
            $codePostal = trim((string) $request->request->get('codePostal', (string) $adresseEntity->getCodePostal()));
            $ville = trim((string) $request->request->get('ville', $adresseEntity->getVille()));
            $pays = trim((string) $request->request->get('pays', $adresseEntity->getPays() ?: 'France'));
            $email = trim((string) $request->request->get('email', $laverie->getContactEmail() ?? ''));
            $description = trim((string) $request->request->get('description', $laverie->getDescription() ?? ''));
            $wiLineReferenceRaw = trim((string) $request->request->get('wiLineReference', ''));
            $horairesJson = (string) $request->request->get('horaires', '[]');
            $equipementsJson = (string) $request->request->get('equipements', '[]');
            $removeImageIdsJson = (string) $request->request->get('removeImageIds', '[]');

            $codePostal = preg_replace('/\D+/', '', $codePostal) ?? '';

            if ($nom === '' || $adresse === '' || $codePostal === '' || $ville === '') {
                return $this->json(['erreur' => 'Les champs nom, adresse, code postal et ville sont requis'], 400);
            }

            if (strlen($codePostal) !== 5) {
                return $this->json(['erreur' => 'Le code postal doit contenir 5 chiffres'], 400);
            }

            if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['erreur' => 'Le format de l\'email est invalide'], 400);
            }

            if ($wiLineReferenceRaw !== '' && (!ctype_digit($wiLineReferenceRaw) || (int) $wiLineReferenceRaw <= 0)) {
                return $this->json(['erreur' => 'La référence API WI-LINE doit être un entier positif'], 400);
            }

            $horaires = json_decode($horairesJson, true);
            if (!is_array($horaires)) {
                return $this->json(['erreur' => 'Format des horaires invalide'], 400);
            }

            $equipements = json_decode($equipementsJson, true);
            if (!is_array($equipements)) {
                return $this->json(['erreur' => 'Format des équipements invalide'], 400);
            }

            $removeImageIds = json_decode($removeImageIdsJson, true);
            if (!is_array($removeImageIds)) {
                return $this->json(['erreur' => 'Format des images à supprimer invalide'], 400);
            }

            $removeImageIds = array_values(array_unique(array_map(
                static fn (mixed $value): int => (int) $value,
                array_filter($removeImageIds, static fn (mixed $value): bool => is_numeric($value))
            )));
            $removeImageIdsLookup = array_fill_keys($removeImageIds, true);

            $originalLogo = $laverie->getLogo();

            if (
                $originalLogo
                && !isset($removeImageIdsLookup[$originalLogo->getId()])
                && $this->isProjectManagedMediaPath($originalLogo->getEmplacement())
            ) {
                $logoLink = $entityManager->getRepository(LaverieMedia::class)
                    ->findOneBy([
                        'laverie' => $laverie,
                        'media' => $originalLogo,
                    ]);

                if (!$logoLink) {
                    $logoLink = new LaverieMedia();
                    $logoLink->setLaverie($laverie);
                    $logoLink->setMedia($originalLogo);
                    $logoLink->setDescription('Image principale de la laverie');
                    $entityManager->persist($logoLink);
                    $laverie->getMedias()->add($logoLink);
                }
            }

            $adresseEntity->setAdresse($adresse);
            $adresseEntity->setRue($adresse);
            $adresseEntity->setCodePostal((int) $codePostal);
            $adresseEntity->setVille($ville);
            $adresseEntity->setPays($pays === '' ? 'France' : $pays);

            $laverie->setNomEtablissement($nom);
            $laverie->setContactEmail($email === '' ? null : $email);
            $laverie->setDescription($description === '' ? null : $description);
            $laverie->setWiLineReference($wiLineReferenceRaw === '' ? null : (int) $wiLineReferenceRaw);
            $laverie->setDateModification(new \DateTime());

            foreach ($entityManager->getRepository(LaverieFermeture::class)->findBy(['laverie' => $laverie]) as $existingFermeture) {
                $entityManager->remove($existingFermeture);
            }

            foreach ($entityManager->getRepository(LaverieEquipement::class)->findBy(['laverie' => $laverie]) as $existingEquipement) {
                $entityManager->remove($existingEquipement);
            }

            foreach ($horaires as $horaireData) {
                if (!is_array($horaireData)) {
                    continue;
                }

                $jourValue = $horaireData['jour'] ?? null;
                if (!is_string($jourValue)) {
                    continue;
                }

                $jour = JourEnum::tryFrom($jourValue);
                if (!$jour) {
                    continue;
                }

                $ferme = (bool) ($horaireData['ferme'] ?? false);
                $heureDebutValue = (string) ($horaireData['debut'] ?? '10:00');
                $heureFinValue = (string) ($horaireData['fin'] ?? '22:00');

                if (!$ferme && (!$this->isValidHourFormat($heureDebutValue) || !$this->isValidHourFormat($heureFinValue))) {
                    return $this->json(['erreur' => 'Format des horaires invalide (HH:MM attendu)'], 400);
                }

                $fermeture = new LaverieFermeture();
                $fermeture->setLaverie($laverie);
                $fermeture->setJour($jour);
                $fermeture->setDateAjout(new \DateTime());
                $fermeture->setDateModification(new \DateTime());

                if ($ferme) {
                    $fermeture->setHeureDebut(new \DateTime('00:00:00'));
                    $fermeture->setHeureFin(new \DateTime('23:59:59'));
                } else {
                    $fermeture->setHeureDebut(new \DateTime($heureDebutValue . ':00'));
                    $fermeture->setHeureFin(new \DateTime($heureFinValue . ':00'));
                }

                $entityManager->persist($fermeture);
            }

            foreach ($equipements as $equipementData) {
                if (!is_array($equipementData)) {
                    continue;
                }

                $nomEquipement = trim((string) ($equipementData['nom'] ?? ''));
                $typeEquipement = trim((string) ($equipementData['type'] ?? ''));
                $capaciteEquipement = (int) ($equipementData['capacite'] ?? 0);
                $tarifEquipement = (float) ($equipementData['tarif'] ?? 0);
                $dureeEquipement = (int) ($equipementData['duree'] ?? 0);
                $equipementReference = $equipementData['equipementReference'] ?? null;

                if ($nomEquipement === '' || $typeEquipement === '') {
                    continue;
                }

                if ($capaciteEquipement <= 0 || $tarifEquipement < 0 || $dureeEquipement <= 0) {
                    continue;
                }

                $equipement = new LaverieEquipement();
                $equipement->setLaverie($laverie);
                $equipement->setNom($nomEquipement);
                $equipement->setType($typeEquipement);
                $equipement->setCapacite($capaciteEquipement);
                $equipement->setTarif($tarifEquipement);
                $equipement->setDuree($dureeEquipement);
                $equipement->setEquipementReference(is_numeric($equipementReference) ? (int) $equipementReference : null);
                $entityManager->persist($equipement);
            }

            foreach ($removeImageIds as $removeImageId) {
                $media = $entityManager->getRepository(Media::class)->find((int) $removeImageId);
                if (!$media) {
                    continue;
                }

                $laverieMedia = $entityManager->getRepository(LaverieMedia::class)
                    ->findOneBy([
                        'laverie' => $laverie,
                        'media' => $media,
                    ]);

                if (!$laverieMedia) {
                    continue;
                }

                if ($laverie->getLogo()?->getId() === $media->getId()) {
                    $laverie->setLogo(null);
                }

                $laverie->getMedias()->removeElement($laverieMedia);
                $entityManager->remove($laverieMedia);

                $absolutePath = $this->getParameter('kernel.project_dir') . '/public' . $media->getEmplacement();
                if (is_string($absolutePath) && file_exists($absolutePath)) {
                    @unlink($absolutePath);
                }

                $entityManager->remove($media);
            }

            $uploadedImages = $this->extractUploadedImages($request);
            $firstUploadedMedia = null;

            foreach ($uploadedImages as $uploadedImage) {
                $uploadedImageSize = (int) $uploadedImage->getSize();

                if ($uploadedImageSize > 5 * 1024 * 1024) {
                    return $this->json(['erreur' => 'Chaque image doit faire au maximum 5 Mo'], 400);
                }

                $mimeType = strtolower((string) $uploadedImage->getMimeType());
                $clientExtension = strtolower((string) $uploadedImage->getClientOriginalExtension());
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
                    return $this->json(['erreur' => 'Tous les fichiers doivent être des images'], 400);
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

                // $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/laveries';
                // if (!is_dir($uploadsDirectory)) {
                //     mkdir($uploadsDirectory, 0775, true);
                // }

                $originalFileName = pathinfo($uploadedImage->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFileName = strtolower((string) $slugger->slug($originalFileName));
                $guessedExtension = strtolower((string) $uploadedImage->guessExtension());
                $extension = $guessedExtension !== '' && $guessedExtension !== 'bin'
                    ? $guessedExtension
                    : ($clientExtension !== '' ? $clientExtension : 'bin');
                $storedFileName = $safeFileName . '-' . uniqid('', true) . '.' . $extension;

                $uploadedImage->move($uploadsDirectory, $storedFileName);

                $media = new Media();
                $media->setEmplacement('/uploads/laveries/' . $storedFileName);
                $media->setNomOriginel($uploadedImage->getClientOriginalName());
                $media->setPoids($uploadedImageSize);
                $media->setMimeType($resolvedMimeType);
                $entityManager->persist($media);

                $laverieMedia = new LaverieMedia();
                $laverieMedia->setLaverie($laverie);
                $laverieMedia->setMedia($media);
                $laverieMedia->setDescription('Image galerie laverie');
                $entityManager->persist($laverieMedia);
                $laverie->getMedias()->add($laverieMedia);

                if ($firstUploadedMedia === null) {
                    $firstUploadedMedia = $media;
                }
            }

            if ($firstUploadedMedia !== null) {
                $laverie->setLogo($firstUploadedMedia);
            } else {
                $remainingGalleryMedia = null;
                foreach ($laverie->getMedias() as $galleryItem) {
                    if ($galleryItem->getMedia()) {
                        $remainingGalleryMedia = $galleryItem->getMedia();
                        break;
                    }
                }

                if ($remainingGalleryMedia !== null) {
                    $laverie->setLogo($remainingGalleryMedia);
                } elseif (
                    $originalLogo
                    && !isset($removeImageIdsLookup[$originalLogo->getId()])
                    && $this->isProjectManagedMediaPath($originalLogo->getEmplacement())
                ) {
                    $laverie->setLogo($originalLogo);
                } else {
                    $laverie->setLogo(null);
                }
            }

            $entityManager->flush();

            $gallery = $this->buildGalleryResponse($laverie, $request);
            $logo = $laverie->getLogo();
            $primaryImage = $gallery[0]['image'] ?? (($logo && $this->isProjectManagedMediaPath($logo->getEmplacement()))
                ? $this->toPublicMediaUrl($logo->getEmplacement(), $request)
                : null);

            return $this->json([
                'message' => 'Laverie mise à jour avec succès',
                'laverie' => [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'wiLineReference' => $laverie->getWiLineReference(),
                    'image' => $primaryImage,
                    'images' => $gallery,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_delete_laverie', methods: ['DELETE'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function deleteLaverie(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            // Marquer comme supprimée au lieu de la supprimer vraiment
            $laverie->setSupprimee_le(new \DateTime());
            $entityManager->flush();

            return $this->json(['message' => 'Laverie supprimée avec succès'], 200);

        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    private function toPublicMediaUrl(string $emplacement, Request $request): string
    {
        if (str_starts_with($emplacement, 'http://') || str_starts_with($emplacement, 'https://')) {
            return $emplacement;
        }

        if (str_starts_with($emplacement, '/')) {
            return $request->getSchemeAndHttpHost() . $emplacement;
        }

        return $request->getSchemeAndHttpHost() . '/' . ltrim($emplacement, '/');
    }

    private function buildHorairesResponse(Laverie $laverie): array
    {
        $orderedDays = [
            JourEnum::LUNDI,
            JourEnum::MARDI,
            JourEnum::MERCREDI,
            JourEnum::JEUDI,
            JourEnum::VENDREDI,
            JourEnum::SAMEDI,
            JourEnum::DIMANCHE,
        ];

        $fermeturesByDay = [];
        foreach ($laverie->getFermetures() as $fermeture) {
            $fermeturesByDay[$fermeture->getJour()->value] = $fermeture;
        }

        $horaires = [];
        foreach ($orderedDays as $day) {
            $fermeture = $fermeturesByDay[$day->value] ?? null;
            $isClosedAllDay = $fermeture
                && $fermeture->getHeureDebut()->format('H:i:s') === '00:00:00'
                && $fermeture->getHeureFin()->format('H:i:s') === '23:59:59';

            $horaires[] = [
                'jour' => $day->value,
                'debut' => $isClosedAllDay ? '10:00' : ($fermeture ? $fermeture->getHeureDebut()->format('H:i') : '10:00'),
                'fin' => $isClosedAllDay ? '22:00' : ($fermeture ? $fermeture->getHeureFin()->format('H:i') : '22:00'),
                'ferme' => $isClosedAllDay,
            ];
        }

        return $horaires;
    }

    private function buildGalleryResponse(Laverie $laverie, Request $request): array
    {
        $gallery = [];

        foreach ($laverie->getMedias() as $laverieMedia) {
            $media = $laverieMedia->getMedia();

            if (!$media) {
                continue;
            }

            if (!$this->isProjectManagedMediaPath($media->getEmplacement())) {
                continue;
            }

            $gallery[] = [
                'id' => $media->getId(),
                'image' => $this->toPublicMediaUrl($media->getEmplacement(), $request),
                'alt' => $laverie->getNomEtablissement(),
            ];
        }

        return $gallery;
    }

    private function buildEquipementsResponse(Laverie $laverie, EntityManagerInterface $entityManager): array
    {
        $equipements = [];

        $equipementsDb = $entityManager->getRepository(LaverieEquipement::class)->findBy(
            ['laverie' => $laverie],
            ['id' => 'ASC']
        );

        foreach ($equipementsDb as $equipement) {
            $equipements[] = [
                'id' => $equipement->getId(),
                'equipementReference' => $equipement->getEquipementReference(),
                'nom' => $equipement->getNom(),
                'type' => $equipement->getType(),
                'capacite' => $equipement->getCapacite(),
                'tarif' => $equipement->getTarif(),
                'duree' => $equipement->getDuree(),
            ];
        }

        return $equipements;
    }

    private function isProjectManagedMediaPath(string $emplacement): bool
    {
        return str_starts_with($emplacement, '/uploads/');
    }

    /**
     * @return UploadedFile[]
     */
    private function extractUploadedImages(Request $request): array
    {
        $uploaded = [];
        $seen = [];

        $addFiles = function (mixed $candidate) use (&$uploaded, &$seen, &$addFiles): void {
            if ($candidate instanceof UploadedFile) {
                $id = spl_object_id($candidate);
                if (!isset($seen[$id])) {
                    $seen[$id] = true;
                    $uploaded[] = $candidate;
                }
                return;
            }

            if (is_array($candidate)) {
                foreach ($candidate as $nested) {
                    $addFiles($nested);
                }
            }
        };

        $allFiles = $request->files->all();
        $addFiles($allFiles['images'] ?? null);
        $addFiles($allFiles['images[]'] ?? null);
        $addFiles($allFiles['gallery'] ?? null);
        $addFiles($allFiles['gallery[]'] ?? null);
        $addFiles($allFiles['logo'] ?? null);

        return $uploaded;
    }

    private function isValidHourFormat(string $value): bool
    {
        return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) === 1;
    }

    private function countLaverieCommentaires(Laverie $laverie, EntityManagerInterface $entityManager): int
    {
        $result = $entityManager->createQueryBuilder()
            ->select('COUNT(n.id)')
            ->from(LaverieNote::class, 'n')
            ->where('n.laverie = :laverie')
            ->andWhere('n.commentaire IS NOT NULL')
            ->andWhere('n.commentaire <> :empty')
            ->setParameter('laverie', $laverie)
            ->setParameter('empty', '')
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }

    private function getLaverieNoteMoyenne(Laverie $laverie, EntityManagerInterface $entityManager): ?float
    {
        $result = $entityManager->createQueryBuilder()
            ->select('AVG(n.note)')
            ->from(LaverieNote::class, 'n')
            ->where('n.laverie = :laverie')
            ->andWhere('n.note IS NOT NULL')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->getSingleScalarResult();

        if ($result === null) {
            return null;
        }

        return round((float) $result, 1);
    }
}