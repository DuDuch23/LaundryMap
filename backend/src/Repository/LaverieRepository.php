<?php

namespace App\Repository;

use App\DTO\LaverieRechercheResultat;
use App\Entity\Laverie;
use App\Entity\Professionnel;
use App\Enum\StatutLaverieEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Laverie>
 */
class LaverieRepository extends ServiceEntityRepository
{
    private const RAYON_MAX_KM     = 50;
    private const LIMITE_RESULTATS = 30;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Laverie::class);
    }


    public function createFilteredQueryBuilder(?string $statut = null, ?string $ordre = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('l')->andWhere('l.supprimee_le IS NULL');

        if ($statut) {
            $statutEnum = match ($statut) {
                'Validée' => StatutLaverieEnum::STATUT_VALIDEE,
                'Refusée' => StatutLaverieEnum::STATUT_REFUSEE,
                'En attente' => StatutLaverieEnum::STATUT_EN_ATTENTE,
                default => null,
            };
            if ($statutEnum) {
                $qb->andWhere('l.statut = :statut')->setParameter('statut', $statutEnum);
            }
        }

        if (!$statut) {
            $qb->addSelect("CASE WHEN l.statut = :statutEnAttente THEN 0 ELSE 1 END AS HIDDEN priorite_statut")
               ->setParameter('statutEnAttente', StatutLaverieEnum::STATUT_EN_ATTENTE)
               ->orderBy('priorite_statut', 'ASC');
        }

        if ($ordre === 'croissant') {
            $qb->addOrderBy('l.nomEtablissement', 'ASC');
        } elseif ($ordre === 'decroissant') {
            $qb->addOrderBy('l.nomEtablissement', 'DESC');
        } else {
            $qb->addOrderBy('l.id', 'DESC');
        }

        return $qb;
    }

    public function countEnAttente(): int
    {
        return (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->where('l.statut = :statut')
            ->andWhere('l.supprimee_le IS NULL')
            ->setParameter('statut', StatutLaverieEnum::STATUT_EN_ATTENTE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** @return Laverie[] */
    public function findByProfessionnel(Professionnel $professionnel): array
    {
        return $this->createQueryBuilder('l')
            ->innerJoin('l.professionnel', 'p')
            ->where('p = :professionnel')
            ->andWhere('l.supprimee_le IS NULL')
            ->setParameter('professionnel', $professionnel)
            ->orderBy('l.dateModification', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneForProfessionnel(int $id, Professionnel $professionnel): ?Laverie
    {
        return $this->createQueryBuilder('l')
            ->innerJoin('l.professionnel', 'p')
            ->where('l.id = :id')
            ->andWhere('p = :professionnel')
            ->andWhere('l.supprimee_le IS NULL')
            ->setParameter('id', $id)
            ->setParameter('professionnel', $professionnel)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countByProfessionnelAndStatut(Professionnel $professionnel): array
    {
        $rows = $this->createQueryBuilder('l')
            ->select('l.statut AS statut, COUNT(l.id) AS total')
            ->innerJoin('l.professionnel', 'p')
            ->where('p = :professionnel')
            ->andWhere('l.supprimee_le IS NULL')
            ->groupBy('l.statut')
            ->setParameter('professionnel', $professionnel)
            ->getQuery()
            ->getArrayResult();

        $stats = ['total' => 0, 'validees' => 0, 'en_attente' => 0, 'refusees' => 0];

        foreach ($rows as $row) {
            $count  = (int) ($row['total'] ?? 0);
            $stats['total'] += $count;
            $statut = $row['statut'] instanceof StatutLaverieEnum ? $row['statut']->value : (string) $row['statut'];
            match ($statut) {
                StatutLaverieEnum::STATUT_VALIDEE->value    => $stats['validees']   += $count,
                StatutLaverieEnum::STATUT_EN_ATTENTE->value => $stats['en_attente'] += $count,
                StatutLaverieEnum::STATUT_REFUSEE->value    => $stats['refusees']   += $count,
                default => null,
            };
        }

        return $stats;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Recherche publique (F-01 CDC)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Recherche les laveries validées pour la page d'accueil publique.
     *
     * Filtres par services et paiements : comparaison par **ID** (pas par nom),
     * cohérent avec ce que le frontend envoie (serviceIds, paiementIds).
     *
     * @param array{
     *     lat?:         float|null,
     *     lng?:         float|null,
     *     q?:           string,
     *     rayon?:       int,
     *     horaire?:     string,
     *     serviceIds?:  int[],
     *     paiementIds?: int[],
     * } $params
     * @return LaverieRechercheResultat[]
     */
    public function findForPublicSearch(array $params): array
    {
        $lat       = isset($params['lat']) && $params['lat'] !== null ? (float) $params['lat'] : null;
        $lng       = isset($params['lng']) && $params['lng'] !== null ? (float) $params['lng'] : null;
        $q         = trim((string) ($params['q'] ?? ''));
        $rayon     = min((int) ($params['rayon'] ?? 10), self::RAYON_MAX_KM);
        $geoFourni = ($lat !== null && $lng !== null);

        // ── Requête DQL ───────────────────────────────────────────────────────
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.adresse', 'a')
            ->where('l.statut = :statut')
            ->andWhere('l.supprimee_le IS NULL')
            ->setParameter('statut', StatutLaverieEnum::STATUT_VALIDEE);

        if ($geoFourni) {
            $deltaLat = $rayon / 111.0;
            $deltaLng = $rayon / (111.0 * max(cos(deg2rad($lat)), 0.01));
            $qb->andWhere('a.latitude IS NOT NULL AND a.longitude IS NOT NULL')
               ->andWhere('a.latitude  BETWEEN :latMin AND :latMax')
               ->andWhere('a.longitude BETWEEN :lngMin AND :lngMax')
               ->setParameter('latMin', $lat - $deltaLat)->setParameter('latMax', $lat + $deltaLat)
               ->setParameter('lngMin', $lng - $deltaLng)->setParameter('lngMax', $lng + $deltaLng);
        }

        /** @var Laverie[] $candidates */
        $candidates = $qb->getQuery()->getResult();

        // ── Filtre textuel PHP (tolérant aux accents) ─────────────────────────
        if ($q !== '') {
            $qNorm = $this->normaliserTexte($q);
            $candidates = array_values(array_filter($candidates, function (Laverie $l) use ($qNorm): bool {
                $adresse = $l->getAdresse();
                foreach ([
                    $l->getNomEtablissement(),
                    $adresse?->getVille(),
                    $adresse?->getAdresse(),
                    $adresse?->getCodePostal(),
                ] as $champ) {
                    if ($champ !== null && str_contains($this->normaliserTexte($champ), $qNorm)) {
                        return true;
                    }
                }
                return false;
            }));
        }

        // ── Post-traitement PHP ───────────────────────────────────────────────
        $horaire          = trim((string) ($params['horaire']    ?? ''));
        // IDs entiers — le frontend envoie serviceIds et paiementIds
        $filtreServiceIds  = array_map('intval', array_filter((array) ($params['serviceIds']  ?? [])));
        $filtrePaiementIds = array_map('intval', array_filter((array) ($params['paiementIds'] ?? [])));

        $maintenant     = new \DateTime();
        $jourCourant    = (int) $maintenant->format('N');
        $minutesCourant = (int) $maintenant->format('H') * 60 + (int) $maintenant->format('i');

        $resultats = [];

        foreach ($candidates as $laverie) {
            $adresse = $laverie->getAdresse();

            // Distance haversine exacte
            $distance = null;
            if ($geoFourni && $adresse?->getLatitude() !== null) {
                $distance = $this->haversine($lat, $lng, (float) $adresse->getLatitude(), (float) $adresse->getLongitude());
                if ($distance > $rayon) continue;
            }

            // Filtre horaire
            if ($horaire !== '' && !$this->matchHoraire($laverie, $horaire, $jourCourant, $minutesCourant)) continue;

            // Filtre services — par ID
            if (!empty($filtreServiceIds) && !$this->matchServiceIds($laverie, $filtreServiceIds)) continue;

            // Filtre paiements — par ID
            if (!empty($filtrePaiementIds) && !$this->matchPaiementIds($laverie, $filtrePaiementIds)) continue;

            $estOuvert = $this->isOuvertMaintenant($laverie, $jourCourant, $minutesCourant);

            $resultats[] = new LaverieRechercheResultat(
                laverie:             $laverie,
                distanceKm:          $distance,
                estOuvert:           $estOuvert,
                prochaineFermeture:  $estOuvert  ? $this->getProchaineFermeture($laverie, $jourCourant, $minutesCourant) : null,
                prochaineOuverture:  !$estOuvert ? $this->getProchaineOuverture($laverie, $jourCourant, $minutesCourant) : null,
                horairesAujourdhui:  $this->getHorairesAujourdhui($laverie, $jourCourant),
            );
        }

        // Tri
        if ($geoFourni) {
            usort($resultats, static fn (LaverieRechercheResultat $a, LaverieRechercheResultat $b)
                => ($a->distanceKm ?? PHP_INT_MAX) <=> ($b->distanceKm ?? PHP_INT_MAX));
        } else {
            usort($resultats, static fn (LaverieRechercheResultat $a, LaverieRechercheResultat $b)
                => strcmp((string) $a->laverie->getNomEtablissement(), (string) $b->laverie->getNomEtablissement()));
        }

        return array_slice($resultats, 0, self::LIMITE_RESULTATS);
    }

    // ─── Helpers privés ───────────────────────────────────────────────────────

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function matchHoraire(Laverie $laverie, string $horaire, int $jourCourant, int $minutesCourant): bool
    {
        if ($horaire === 'ouvert_maintenant') {
            return $this->isOuvertMaintenant($laverie, $jourCourant, $minutesCourant);
        }

        $iso = match (ucfirst(strtolower($horaire))) {
            'Lundi' => 1, 'Mardi' => 2, 'Mercredi' => 3,
            'Jeudi' => 4, 'Vendredi' => 5, 'Samedi' => 6, 'Dimanche' => 7,
            default => null,
        };

        if ($iso === null) return true;

        foreach ($laverie->getFermetures() as $f) {
            if ($f->getJour()->toIsoNumber() === $iso) return true;
        }

        return false;
    }

    private function isOuvertMaintenant(Laverie $laverie, int $jourCourant, int $minutesCourant): bool
    {
        foreach ($laverie->getFermetures() as $f) {
            if ($f->getJour()->toIsoNumber() !== $jourCourant) continue;
            $debut = (int) $f->getHeureDebut()->format('H') * 60 + (int) $f->getHeureDebut()->format('i');
            $fin   = (int) $f->getHeureFin()->format('H')   * 60 + (int) $f->getHeureFin()->format('i');
            if ($minutesCourant >= $debut && $minutesCourant <= $fin) return true;
        }
        return false;
    }

    private function getHorairesAujourdhui(Laverie $laverie, int $jourCourant): array
    {
        $plages = [];
        foreach ($laverie->getFermetures() as $f) {
            if ($f->getJour()->toIsoNumber() !== $jourCourant) continue;
            $debut = (int) $f->getHeureDebut()->format('H') * 60 + (int) $f->getHeureDebut()->format('i');
            $plages[] = ['debut' => $debut, 'label' => $f->getHeureDebut()->format('H:i') . ' - ' . $f->getHeureFin()->format('H:i')];
        }
        usort($plages, static fn ($a, $b) => $a['debut'] <=> $b['debut']);
        return array_column($plages, 'label');
    }

    private function getProchaineFermeture(Laverie $laverie, int $jourCourant, int $minutesCourant): ?string
    {
        foreach ($laverie->getFermetures() as $f) {
            if ($f->getJour()->toIsoNumber() !== $jourCourant) continue;
            $debut = (int) $f->getHeureDebut()->format('H') * 60 + (int) $f->getHeureDebut()->format('i');
            $fin   = (int) $f->getHeureFin()->format('H')   * 60 + (int) $f->getHeureFin()->format('i');
            if ($minutesCourant >= $debut && $minutesCourant <= $fin) {
                return $f->getHeureFin()->format('H:i');
            }
        }
        return null;
    }

    private function getProchaineOuverture(Laverie $laverie, int $jourCourant, int $minutesCourant): ?string
    {
        $fermetures = $laverie->getFermetures()->toArray();
        for ($offset = 0; $offset < 7; $offset++) {
            $jour    = (($jourCourant - 1 + $offset) % 7) + 1;
            $minSeuil = $offset === 0 ? $minutesCourant : -1;

            $candidats = [];
            foreach ($fermetures as $f) {
                if ($f->getJour()->toIsoNumber() !== $jour) continue;
                $debut = (int) $f->getHeureDebut()->format('H') * 60 + (int) $f->getHeureDebut()->format('i');
                if ($debut > $minSeuil) {
                    $candidats[] = ['debut' => $debut, 'heure' => $f->getHeureDebut()->format('H:i')];
                }
            }

            if (!empty($candidats)) {
                usort($candidats, static fn ($a, $b) => $a['debut'] <=> $b['debut']);
                return $candidats[0]['heure'];
            }
        }
        return null;
    }

    /**
     * Vérifie que la laverie possède TOUS les services demandés (par ID).
     * On compare $ls->getService()->getId() — pas le nom — pour éviter
     * tout problème de casse ou de caractères accentués.
     *
     * @param int[] $ids
     */
    private function matchServiceIds(Laverie $laverie, array $ids): bool
    {
        $disponibles = array_map(
            static fn ($ls) => $ls->getService()->getId(),
            $laverie->getServices()->toArray()
        );
        foreach ($ids as $id) {
            if (!in_array($id, $disponibles, true)) return false;
        }
        return true;
    }

    /**
     * Vérifie que la laverie accepte TOUS les modes de paiement demandés (par ID).
     *
     * @param int[] $ids
     */
    private function matchPaiementIds(Laverie $laverie, array $ids): bool
    {
        $disponibles = array_map(
            static fn ($lp) => $lp->getPaiement()->getId(),
            $laverie->getPaiements()->toArray()
        );
        foreach ($ids as $id) {
            if (!in_array($id, $disponibles, true)) return false;
        }
        return true;
    }

    private function normaliserTexte(string $s): string
    {
        if (function_exists('transliterator_transliterate')) {
            $result = transliterator_transliterate('Any-Latin; Latin-ASCII', $s);
            if ($result !== false) {
                return mb_strtolower($result);
            }
        }
        // Fallback manuel pour les accents français courants
        $from = ['à','â','ä','é','è','ê','ë','î','ï','ô','ö','ù','û','ü','ç','æ','œ',
                 'À','Â','Ä','É','È','Ê','Ë','Î','Ï','Ô','Ö','Ù','Û','Ü','Ç','Æ','Œ'];
        $to   = ['a','a','a','e','e','e','e','i','i','o','o','u','u','u','c','ae','oe',
                 'a','a','a','e','e','e','e','i','i','o','o','u','u','u','c','ae','oe'];
        return mb_strtolower(str_replace($from, $to, $s));
    }
}