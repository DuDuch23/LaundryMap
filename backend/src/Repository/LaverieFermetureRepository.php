<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieFermeture;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieFermeture>
 */
class LaverieFermetureRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieFermeture::class);
    }

    /**
     * @return LaverieFermeture[]
     */
    public function findByLaverie(Laverie $laverie): array
    {
        return $this->findBy(['laverie' => $laverie]);
    }

    public function deleteByLaverie(Laverie $laverie): void
    {
        $this->createQueryBuilder('lf')
            ->delete()
            ->where('lf.laverie = :laverie')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->execute();
    }

    //    /**
    //     * @return LaverieFermeture[] Returns an array of LaverieFermeture objects
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

    //    public function findOneBySomeField($value): ?LaverieFermeture
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
