<?php

namespace App\Repository;

use App\Entity\LaverieHistoriqueInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieHistoriqueInteraction>
 */
class LaverieHistoriqueInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieHistoriqueInteraction::class);
    }

    //    /**
    //     * @return LaverieHistoriqueInteraction[] Returns an array of LaverieHistoriqueInteraction objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('l.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?LaverieHistoriqueInteraction
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
