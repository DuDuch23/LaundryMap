<?php

namespace App\Repository;

use App\Entity\LaverieFavori;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieFavori>
 */
class LaverieFavoriRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieFavori::class);
    }

    //    /**
    //     * @return LaverieFavori[] Returns an array of LaverieFavori objects
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

    //    public function findOneBySomeField($value): ?LaverieFavori
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
