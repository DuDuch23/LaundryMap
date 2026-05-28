<?php

namespace App\Repository;

use App\Entity\MotInjurieux;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MotInjurieux>
 */
class MotInjurieuxRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MotInjurieux::class);
    }

    /**
     * Retourne un QueryBuilder trié alphabétiquement,
     * avec un filtre LIKE optionnel sur le label.
     */
    public function createSearchQueryBuilder(?string $recherche = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('m')
            ->orderBy('m.label', 'ASC');

        if ($recherche !== null && $recherche !== '') {
            $qb->andWhere('m.label LIKE :q')
               ->setParameter('q', '%' . mb_strtolower($recherche, 'UTF-8') . '%');
        }

        return $qb;
    }
}
