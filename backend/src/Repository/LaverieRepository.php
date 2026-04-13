<?php

namespace App\Repository;

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
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Laverie::class);
    }

    public function createFilteredQueryBuilder(
        ?string $statut = null,
        ?string $ordre = null
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('l')
            ->andWhere('l.supprimee_le IS NULL');

        if ($statut) {
            $statutEnum = match($statut) {
                'Validée' => StatutLaverieEnum::STATUT_VALIDEE,
                'Refusée' => StatutLaverieEnum::STATUT_REFUSEE,
                'En attente' => StatutLaverieEnum::STATUT_EN_ATTENTE,
                default => null,
            };

            if ($statutEnum) {
                $qb->andWhere('l.statut = :statut')
                   ->setParameter('statut', $statutEnum);
            }
        }

        if ($ordre === 'croissant') {
            $qb->orderBy('l.id', 'ASC');
        } elseif ($ordre === 'decroissant') {
            $qb->orderBy('l.id', 'DESC');
        } else {
            $qb->orderBy('l.id', 'ASC');
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

    /**
     * @return Laverie[]
     */
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

        $stats = [
            'total' => 0,
            'validees' => 0,
            'en_attente' => 0,
            'refusees' => 0,
        ];

        foreach ($rows as $row) {
            $count = (int) ($row['total'] ?? 0);
            $stats['total'] += $count;

            $statut = $row['statut'] instanceof StatutLaverieEnum
                ? $row['statut']->value
                : (string) $row['statut'];

            if ($statut === StatutLaverieEnum::STATUT_VALIDEE->value) {
                $stats['validees'] += $count;
            } elseif ($statut === StatutLaverieEnum::STATUT_EN_ATTENTE->value) {
                $stats['en_attente'] += $count;
            } elseif ($statut === StatutLaverieEnum::STATUT_REFUSEE->value) {
                $stats['refusees'] += $count;
            }
        }

        return $stats;
    }
}
