<?php

namespace App\Service\Professionnel;

use App\Entity\Laverie;
use App\Enum\JourEnum;
use App\Repository\LaverieEquipementRepository;
use App\Repository\LaverieNoteRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class ProfessionnelLaverieFormatterService
{
    public function __construct(
        private readonly LaverieNoteRepository $laverieNoteRepository,
        private readonly LaverieEquipementRepository $laverieEquipementRepository,
    ) {
    }

    public function toPublicMediaUrl(string $emplacement, Request $request): string
    {
        if (str_starts_with($emplacement, 'http://') || str_starts_with($emplacement, 'https://')) {
            return $emplacement;
        }

        if (str_starts_with($emplacement, '/')) {
            return $request->getSchemeAndHttpHost() . $emplacement;
        }

        return $request->getSchemeAndHttpHost() . '/' . ltrim($emplacement, '/');
    }

    public function isProjectManagedMediaPath(string $emplacement): bool
    {
        return str_starts_with($emplacement, '/uploads/');
    }

    public function buildHorairesResponse(Laverie $laverie): array
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
            $fermeturesByDay[$fermeture->getJour()->value][] = $fermeture;
        }

        $horaires = [];
        foreach ($orderedDays as $day) {
            $dayFermetures = $fermeturesByDay[$day->value] ?? [];

            if (empty($dayFermetures)) {
                $horaires[] = ['jour' => $day->value, 'debut' => '10:00', 'fin' => '22:00', 'ferme' => false];
                continue;
            }

            // Single entry that covers 00:00-23:59 = closed all day convention
            if (count($dayFermetures) === 1) {
                $f = $dayFermetures[0];
                if ($f->getHeureDebut()->format('H:i:s') === '00:00:00' && $f->getHeureFin()->format('H:i:s') === '23:59:59') {
                    $horaires[] = ['jour' => $day->value, 'debut' => '10:00', 'fin' => '22:00', 'ferme' => true];
                    continue;
                }
            }

            foreach ($dayFermetures as $fermeture) {
                $horaires[] = [
                    'jour'  => $day->value,
                    'debut' => $fermeture->getHeureDebut()->format('H:i'),
                    'fin'   => $fermeture->getHeureFin()->format('H:i'),
                    'ferme' => false,
                ];
            }
        }

        return $horaires;
    }

    public function buildGalleryResponse(Laverie $laverie, Request $request): array
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

    public function buildEquipementsResponse(Laverie $laverie): array
    {
        $equipements = [];

        $equipementsDb = $this->laverieEquipementRepository->findByLaverie($laverie);

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

    public function buildServicesResponse(Laverie $laverie): array
    {
        $services = [];
        foreach ($laverie->getServices() as $laverieService) {
            $service = $laverieService->getService();
            $services[] = [
                'id' => $service->getId(),
                'nom' => $service->getNom(),
            ];
        }
        return $services;
    }

    public function buildPaiementsResponse(Laverie $laverie): array
    {
        $paiements = [];
        foreach ($laverie->getPaiements() as $laveriePaiement) {
            $paiement = $laveriePaiement->getPaiement();
            $paiements[] = [
                'id' => $paiement->getId(),
                'nom' => $paiement->getNom(),
            ];
        }
        return $paiements;
    }

    public function buildCommentairesResponse(Laverie $laverie): array
    {
        $commentaires = [];
        foreach ($laverie->getNotes() as $laverieNote) {
            if ($laverieNote->getCommentaireSupprimeeLe() !== null || empty($laverieNote->getCommentaire())) {
                continue;
            }
            
            $utilisateur = $laverieNote->getUtilisateur();
            $nom = $utilisateur->getNom();
            $nomAbrege = $nom ? mb_substr($nom, 0, 1) . '.' : '';
            
            $commentaires[] = [
                'id' => $laverieNote->getId(),
                'note' => $laverieNote->getNote(),
                'commentaire' => $laverieNote->getCommentaire(),
                'date' => $laverieNote->getCommenteLe() ? $laverieNote->getCommenteLe()->format('c') : ($laverieNote->getNoteLe() ? $laverieNote->getNoteLe()->format('c') : null),
                'utilisateur' => [
                    'prenom' => $utilisateur->getPrenom(),
                    'nom' => $nomAbrege,
                ]
            ];
        }
        return $commentaires;
    }

    public function countLaverieCommentaires(Laverie $laverie): int
    {
        return $this->laverieNoteRepository->countCommentairesByLaverie($laverie);
    }

    public function getLaverieNoteMoyenne(Laverie $laverie): ?float
    {
        return $this->laverieNoteRepository->getMoyenneByLaverie($laverie);
    }

    /**
     * @return UploadedFile[]
     */
    public function extractUploadedImages(Request $request): array
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

    public function isValidHourFormat(string $value): bool
    {
        return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) === 1;
    }
}
