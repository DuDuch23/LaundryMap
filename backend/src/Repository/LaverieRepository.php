<?php

namespace App\Repository;

use App\Entity\Laverie;
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
}
