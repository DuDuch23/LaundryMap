<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\Media;
use App\Entity\LaverieMedia;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieMedia>
 */
class LaverieMediaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieMedia::class);
    }

    public function findOneByLaverieAndMedia(Laverie $laverie, Media $media): ?LaverieMedia
    {
        return $this->findOneBy([
            'laverie' => $laverie,
            'media' => $media,
        ]);
    }

    /**
     * @return LaverieMedia[]
     */
    public function findByLaverie(Laverie $laverie): array
    {
        return $this->findBy(['laverie' => $laverie]);
    }

    //    /**
    //     * @return LaverieMedia[] Returns an array of LaverieMedia objects
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

    //    public function findOneBySomeField($value): ?LaverieMedia
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
