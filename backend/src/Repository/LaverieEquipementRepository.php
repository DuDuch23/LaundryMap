<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieEquipement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieEquipement>
 */
class LaverieEquipementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieEquipement::class);
    }

    /**
     * @return LaverieEquipement[]
     */
    public function findByLaverie(Laverie $laverie): array
    {
        return $this->findBy(['laverie' => $laverie]);
    }

    public function deleteByLaverie(Laverie $laverie): void
    {
        $this->createQueryBuilder('le')
            ->delete()
            ->where('le.laverie = :laverie')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->execute();
    }

    //    /**
    //     * @return LaverieEquipement[] Returns an array of LaverieEquipement objects
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

    //    public function findOneBySomeField($value): ?LaverieEquipement
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
