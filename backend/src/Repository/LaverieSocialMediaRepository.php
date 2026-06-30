<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieSocialMedia;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class LaverieSocialMediaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieSocialMedia::class);
    }

    public function deleteByLaverie(Laverie $laverie): void
    {
        $this->createQueryBuilder('s')
            ->delete()
            ->where('s.laverie = :laverie')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->execute();
    }
}
