<?php

namespace App\Repository;

use App\Entity\MotInjurieux;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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

    //    /**
    //     * @return MotInjurieux[] Returns an array of MotInjurieux objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('m.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?MotInjurieux
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
