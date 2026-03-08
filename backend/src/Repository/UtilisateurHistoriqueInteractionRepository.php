<?php

namespace App\Repository;

use App\Entity\UtilisateurHistoriqueInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UtilisateurHistoriqueInteraction>
 */
class UtilisateurHistoriqueInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UtilisateurHistoriqueInteraction::class);
    }

    //    /**
    //     * @return UtilisateurHistoriqueInteraction[] Returns an array of UtilisateurHistoriqueInteraction objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?UtilisateurHistoriqueInteraction
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
