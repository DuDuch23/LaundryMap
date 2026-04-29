<?php
namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Laverie;
use App\Enum\StatutGeoEnum;
use App\Entity\LaverieEquipement;
use App\Entity\LaverieFermeture;
use App\Entity\LaveriePaiement;
use App\Entity\LaverieService;
use App\Entity\LaverieMedia;
use App\Entity\Media;
use App\Entity\Utilisateur;
use App\Enum\JourEnum;
use App\Enum\StatutLaverieEnum;
use App\Repository\LaverieEquipementRepository;
use App\Repository\LaverieFermetureRepository;
use App\Repository\LaverieMediaRepository;
use App\Repository\LaverieRepository;
use App\Repository\MethodePaiementRepository;
use App\Repository\ProfessionnelRepository;
use App\Repository\ServiceRepository;
use App\Service\ApiWiLineService;
use App\Service\MediaService;
use App\Service\Professionnel\ProfessionnelLaverieFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class ApiLaverieController extends ApiProfilController
{
    private function getProfessionnelValide(): mixed
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Non authentifié.'], 401);
        }

        $professionnel = $utilisateur->getProfessionnel();

        if ($professionnel === null) {
            return $this->json(['message' => 'Accès réservé aux professionnels.'], 403);
        }

        if ($professionnel->getStatut()->value !== 'Validé') {
            return $this->json(['message' => 'Votre compte professionnel n\'est pas encore validé.'], 403);
        }

        return $professionnel;
    }


    #[Route('/api/laveries', name: 'api_laveries_liste', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function mesLaveries(LaverieRepository $laverieRepository): JsonResponse
    {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laveries = $laverieRepository->findByProfessionnel($professionnel);

        return $this->json(
            ['laveries' => $laveries],
            200,
            [],
            ['groups' => ['laverie:public', 'laverie:private']]
        );
    }

    #[Route('/api/wiline/centrales', name: 'api_wiline_centrales', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getCentralesWiLine(Request $request, ApiWiLineService $wiLine): JsonResponse
    {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $payload = json_decode($request->getContent(), true);
        $apiKey  = trim($payload['apiKey'] ?? '');

        if ($apiKey === '') {
            return $this->json(['message' => 'Le code client WI-LINE est requis.'], 400);
        }

        $centrales = $wiLine->getMachinesParCodeClient($apiKey);

        if ($centrales === null) {
            return $this->json(['message' => 'Code client WI-LINE invalide ou service indisponible.'], 422);
        }

        return $this->json(['centrales' => $centrales]);
    }


    #[Route('/api/laveries', name: 'api_laverie_creer', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function creerLaverie(
        Request $request,
        EntityManagerInterface $em,
        ServiceRepository $serviceRepository,
        MethodePaiementRepository $methodePaiementRepository,
        MediaService $mediaService,
    ): JsonResponse {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        // Lecture des champs texte (multipart/form-data)
        $get = fn(string $k): string => trim($request->request->get($k, ''));

        foreach (['nomEtablissement', 'rue', 'codePostal', 'ville', 'pays'] as $champ) {
            if ($get($champ) === '') {
                return $this->json(['message' => "Le champ '$champ' est obligatoire."], 400);
            }
        }

        // Champs complexes envoyés en JSON-string dans le FormData
        $horaires   = json_decode($request->request->get('horaires',   '{}'), true);
        $machines   = json_decode($request->request->get('machines',   '[]'), true);
        $equipements = json_decode($request->request->get('equipements', '[]'), true);
        $serviceIds = json_decode($request->request->get('serviceIds', '[]'), true);
        $paiementIds = json_decode($request->request->get('paiementIds', '[]'), true);

        if (empty($horaires) || !is_array($horaires)) {
            return $this->json(['message' => 'Les horaires sont obligatoires.'], 400);
        }

        // ── Adresse ──────────────────────────────────────────────────────────
        $adresse = new Adresse();
        $adresse->setAdresse($get('rue') . ', ' . $get('codePostal') . ' ' . $get('ville') . ', ' . $get('pays'));
        $adresse->setRue($get('rue'));
        $adresse->setCodePostal($get('codePostal'));
        $adresse->setVille($get('ville'));
        $adresse->setPays($get('pays'));

        $latRaw = $request->request->get('latitude');
        $lngRaw = $request->request->get('longitude');
        $latitude  = ($latRaw !== null && is_numeric($latRaw))  ? (float) $latRaw  : null;
        $longitude = ($lngRaw !== null && is_numeric($lngRaw)) ? (float) $lngRaw : null;
        $adresse->setLatitude($latitude);
        $adresse->setLongitude($longitude);
        $adresse->setStatutGeolocalisation(
            $latitude !== null && $longitude !== null
                ? StatutGeoEnum::GEOLOCALISEE
                : StatutGeoEnum::EN_ATTENTE
        );
        $em->persist($adresse);

        // ── Laverie ───────────────────────────────────────────────────────────
        $laverie = new Laverie();
        $laverie->setProfessionnel($professionnel);
        $laverie->setNomEtablissement($get('nomEtablissement'));
        $laverie->setContactEmail($get('contactEmail') !== '' ? $get('contactEmail') : null);
        $laverie->setDescription($get('description') !== '' ? $get('description') : null);
        $laverie->setAdresse($adresse);
        $laverie->setStatut(StatutLaverieEnum::STATUT_EN_ATTENTE);
        $laverie->setDateAjout(new \DateTime());
        $laverie->setDateModification(new \DateTime());

        $wiLineId = $request->request->get('wiLineCentraleId');
        if ($wiLineId !== null && $wiLineId !== '') {
            $laverie->setWiLineReference((int) $wiLineId);
        }

        $em->persist($laverie);

        // ── Horaires ──────────────────────────────────────────────────────────
        $jourMapping = [
            'Lundi'    => JourEnum::LUNDI,   'Mardi'    => JourEnum::MARDI,
            'Mercredi' => JourEnum::MERCREDI, 'Jeudi'    => JourEnum::JEUDI,
            'Vendredi' => JourEnum::VENDREDI, 'Samedi'   => JourEnum::SAMEDI,
            'Dimanche' => JourEnum::DIMANCHE,
        ];

        foreach ($horaires as $jourLabel => $horaire) {
            if (empty($horaire['ouvert'])) continue;
            $jourEnum = $jourMapping[$jourLabel] ?? null;
            if ($jourEnum === null) continue;

            $fermeture = new LaverieFermeture();
            $fermeture->setLaverie($laverie);
            $fermeture->setJour($jourEnum);
            $fermeture->setHeureDebut(new \DateTime($horaire['ouverture']));
            $fermeture->setHeureFin(new \DateTime($horaire['fermeture']));
            $fermeture->setDateAjout(new \DateTime());
            $fermeture->setDateModification(new \DateTime());
            $em->persist($fermeture);
        }

        // ── Machines ──────────────────────────────────────────────────────────
        if (is_array($machines)) {
            foreach ($machines as $machineData) {
                if (empty($machineData['type'])) continue;

                $equipement = new LaverieEquipement();
                $equipement->setLaverie($laverie);
                $equipement->setNom($machineData['nom'] ?? $machineData['type']);
                $equipement->setType($machineData['type']);
                $equipement->setCapacite((int) ($machineData['capacite'] ?? 0));
                $equipement->setTarif((float) ($machineData['tarif'] ?? 0));
                $equipement->setDuree((int) ($machineData['duree'] ?? 0));
                if (!empty($machineData['wiline_machine_id'])) {
                    $equipement->setEquipementReference((int) $machineData['wiline_machine_id']);
                }
                $em->persist($equipement);
            }
        }

        // ── Services ──────────────────────────────────────────────────────────
        if (is_array($serviceIds)) {
            foreach ($serviceIds as $serviceId) {
                $service = $serviceRepository->find((int) $serviceId);
                if ($service === null) continue;
                $laverieService = new LaverieService();
                $laverieService->setLaverie($laverie);
                $laverieService->setService($service);
                $em->persist($laverieService);
            }
        }

        // ── Paiements ─────────────────────────────────────────────────────────
        if (is_array($paiementIds)) {
            foreach ($paiementIds as $paiementId) {
                $paiement = $methodePaiementRepository->find((int) $paiementId);
                if ($paiement === null) continue;
                $laveriePaiement = new LaveriePaiement();
                $laveriePaiement->setLaverie($laverie);
                $laveriePaiement->setPaiement($paiement);
                $em->persist($laveriePaiement);
            }
        }

        // ── Médias (logo + photos dans la même requête) ───────────────────────
        $logoFile = $request->files->get('logo');
        if ($logoFile) {
            $erreur = $mediaService->validerFichier($logoFile);
            if ($erreur) return $this->json(['message' => "Logo : $erreur"], 400);
            $logo = $mediaService->creerMedia($logoFile);
            $laverie->setLogo($logo);
        }

        $photoFiles = $request->files->get('photos') ?? [];
        if (!is_array($photoFiles)) {
            $photoFiles = [$photoFiles];
        }
        foreach ($photoFiles as $photoFile) {
            if ($photoFile === null) continue;
            $erreur = $mediaService->validerFichier($photoFile);
            if ($erreur) return $this->json(['message' => "Photo : $erreur"], 400);
            $media = $mediaService->creerMedia($photoFile);
            $laverieMedia = new LaverieMedia();
            $laverieMedia->setLaverie($laverie);
            $laverieMedia->setMedia($media);
            $laverieMedia->setDescription('');
            $em->persist($laverieMedia);
        }

        $em->flush();

        return $this->json(['message' => 'Laverie créée et soumise à validation.', 'id' => $laverie->getId()], 201);
    }

    public function modifierLaverie()
    {
        
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_get_laverie', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function getLaverie(
        int $id,
        Request $request,
        ProfessionnelRepository $professionnelRepository,
        LaverieRepository $laverieRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $professionnel = $this->getValidatedProfessionnel($professionnelRepository);

        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laverie = $laverieRepository->findOneForProfessionnel($id, $professionnel);

        if (!$laverie) {
            return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
        }

        $logo = $laverie->getLogo();
        $horaires = $formatter->buildHorairesResponse($laverie);
        $equipements = $formatter->buildEquipementsResponse($laverie);
        $gallery = $formatter->buildGalleryResponse($laverie, $request);
        $primaryImage = $gallery[0]['image'] ?? (($logo && $formatter->isProjectManagedMediaPath($logo->getEmplacement()))
            ? $formatter->toPublicMediaUrl($logo->getEmplacement(), $request)
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
            'commentairesCount' => $formatter->countLaverieCommentaires($laverie),
            'noteMoyenne' => $formatter->getLaverieNoteMoyenne($laverie),
        ], 200);
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_update_laverie', methods: ['PUT', 'POST'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function updateLaverie(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        ProfessionnelRepository $professionnelRepository,
        LaverieRepository $laverieRepository,
        LaverieFermetureRepository $laverieFermetureRepository,
        LaverieEquipementRepository $laverieEquipementRepository,
        LaverieMediaRepository $laverieMediaRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $professionnel = $this->getValidatedProfessionnel($professionnelRepository);

        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laverie = $laverieRepository->findOneForProfessionnel($id, $professionnel);

        if (!$laverie) {
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
            && $formatter->isProjectManagedMediaPath($originalLogo->getEmplacement())
        ) {
            $logoLink = $laverieMediaRepository->findOneByLaverieAndMedia($laverie, $originalLogo);

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

        $laverieFermetureRepository->deleteByLaverie($laverie);
        $laverieEquipementRepository->deleteByLaverie($laverie);

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

            if (!$ferme && (!$formatter->isValidHourFormat($heureDebutValue) || !$formatter->isValidHourFormat($heureFinValue))) {
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

            $laverieMedia = $laverieMediaRepository->findOneByLaverieAndMedia($laverie, $media);

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

        $uploadedImages = $formatter->extractUploadedImages($request);
        $firstUploadedMedia = null;
        $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/laveries';

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
                && $formatter->isProjectManagedMediaPath($originalLogo->getEmplacement())
            ) {
                $laverie->setLogo($originalLogo);
            } else {
                $laverie->setLogo(null);
            }
        }

        $entityManager->flush();

        $gallery = $formatter->buildGalleryResponse($laverie, $request);
        $logo = $laverie->getLogo();
        $primaryImage = $gallery[0]['image'] ?? (($logo && $formatter->isProjectManagedMediaPath($logo->getEmplacement()))
            ? $formatter->toPublicMediaUrl($logo->getEmplacement(), $request)
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
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_delete_laverie', methods: ['DELETE'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function deleteLaverie(
        int $id,
        EntityManagerInterface $entityManager,
        ProfessionnelRepository $professionnelRepository,
        LaverieRepository $laverieRepository
    ): JsonResponse {
        $professionnel = $this->getValidatedProfessionnel($professionnelRepository);

        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laverie = $laverieRepository->findOneForProfessionnel($id, $professionnel);

        if (!$laverie) {
            return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
        }

        $laverie->setSupprimee_le(new \DateTime());
        $entityManager->flush();

        return $this->json(['message' => 'Laverie supprimée avec succès'], 200);
    }
}