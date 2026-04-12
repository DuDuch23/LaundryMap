<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\LaverieFermeture;
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
                ],
                'stats' => $stats,
                'laveries' => array_map(function ($laverie) use ($request) {
                    $logo = $laverie->getLogo();
                    $logoEmplacement = $logo ? $this->toPublicMediaUrl($logo->getEmplacement(), $request) : null;

                    return [
                        'id' => $laverie->getId(),
                        'nom' => $laverie->getNomEtablissement(),
                        'adresse' => $laverie->getAdresse()->getAdresse(),
                        'codePostal' => $laverie->getAdresse()->getCodePostal(),
                        'ville' => $laverie->getAdresse()->getVille(),
                        'statut' => $laverie->getStatut()->value,
                        'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                        'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                        'image' => $logoEmplacement,
                        'imageAlt' => $logo ? $laverie->getNomEtablissement() : null,
                        'logo' => $logo ? [
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

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            $logo = $laverie->getLogo();
            $horaires = $this->buildHorairesResponse($laverie);

            return $this->json([
                'id' => $laverie->getId(),
                'nom' => $laverie->getNomEtablissement(),
                'adresse' => $laverie->getAdresse()->getAdresse(),
                'codePostal' => $laverie->getAdresse()->getCodePostal(),
                'ville' => $laverie->getAdresse()->getVille(),
                'pays' => $laverie->getAdresse()->getPays(),
                'email' => $laverie->getContactEmail(),
                'description' => $laverie->getDescription(),
                'statut' => $laverie->getStatut()->value,
                'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                'image' => $logo ? $this->toPublicMediaUrl($logo->getEmplacement(), $request) : null,
                'horaires' => $horaires,
            ], 200);

        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_update_laverie', methods: ['PUT'])]
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

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            $nom = trim((string) $request->request->get('nom', ''));
            $adresse = trim((string) $request->request->get('adresse', ''));
            $codePostal = trim((string) $request->request->get('codePostal', ''));
            $ville = trim((string) $request->request->get('ville', ''));
            $pays = trim((string) $request->request->get('pays', 'France'));
            $email = trim((string) $request->request->get('email', ''));
            $description = trim((string) $request->request->get('description', ''));
            $horairesJson = (string) $request->request->get('horaires', '[]');

            if ($nom === '' || $adresse === '' || $codePostal === '' || $ville === '') {
                return $this->json(['erreur' => 'Les champs nom, adresse, code postal et ville sont requis'], 400);
            }

            if (!preg_match('/^\d{5}$/', $codePostal)) {
                return $this->json(['erreur' => 'Le code postal doit contenir 5 chiffres'], 400);
            }

            if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['erreur' => 'Le format de l\'email est invalide'], 400);
            }

            $horaires = json_decode($horairesJson, true);
            if (!is_array($horaires)) {
                return $this->json(['erreur' => 'Format des horaires invalide'], 400);
            }

            $adresseEntity = $laverie->getAdresse();
            $adresseEntity->setAdresse($adresse);
            $adresseEntity->setRue($adresse);
            $adresseEntity->setCodePostal((int) $codePostal);
            $adresseEntity->setVille($ville);
            $adresseEntity->setPays($pays === '' ? 'France' : $pays);

            $laverie->setNomEtablissement($nom);
            $laverie->setContactEmail($email === '' ? null : $email);
            $laverie->setDescription($description === '' ? null : $description);
            $laverie->setDateModification(new \DateTime());

            foreach ($entityManager->getRepository(LaverieFermeture::class)->findBy(['laverie' => $laverie]) as $existingFermeture) {
                $entityManager->remove($existingFermeture);
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

            $uploadedLogo = $request->files->get('logo');
            if ($uploadedLogo instanceof UploadedFile) {
                if ($uploadedLogo->getSize() > 5 * 1024 * 1024) {
                    return $this->json(['erreur' => 'La taille maximale du logo est de 5 Mo'], 400);
                }

                $mimeType = (string) $uploadedLogo->getMimeType();
                if (!str_starts_with($mimeType, 'image/')) {
                    return $this->json(['erreur' => 'Le fichier doit être une image'], 400);
                }

                $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/laveries';
                if (!is_dir($uploadsDirectory)) {
                    mkdir($uploadsDirectory, 0775, true);
                }

                $originalFileName = pathinfo($uploadedLogo->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFileName = strtolower((string) $slugger->slug($originalFileName));
                $extension = $uploadedLogo->guessExtension() ?: 'bin';
                $storedFileName = $safeFileName . '-' . uniqid('', true) . '.' . $extension;

                $uploadedLogo->move($uploadsDirectory, $storedFileName);

                $media = new Media();
                $media->setEmplacement('/uploads/laveries/' . $storedFileName);
                $media->setNomOriginel($uploadedLogo->getClientOriginalName());
                $media->setPoids((int) $uploadedLogo->getSize());
                $media->setMimeType($mimeType);
                $entityManager->persist($media);

                $laverie->setLogo($media);
            }

            $entityManager->flush();

            return $this->json([
                'message' => 'Laverie mise à jour avec succès',
                'laverie' => [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'image' => $laverie->getLogo() ? $this->toPublicMediaUrl($laverie->getLogo()->getEmplacement(), $request) : null,
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

    private function isValidHourFormat(string $value): bool
    {
        return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) === 1;
    }
}