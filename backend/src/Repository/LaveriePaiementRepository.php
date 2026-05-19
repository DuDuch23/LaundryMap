<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaveriePaiement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaveriePaiement>
 */
class LaveriePaiementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaveriePaiement::class);
    }

    public function deleteByLaverie(Laverie $laverie): void
    {
        foreach ($this->findBy(['laverie' => $laverie]) as $item) {
            $this->getEntityManager()->remove($item);
        }
    }

    //    /**
    //     * @return LaveriePaiement[] Returns an array of LaveriePaiement objects
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

    //    public function findOneBySomeField($value): ?LaveriePaiement
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
