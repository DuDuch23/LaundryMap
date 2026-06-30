<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieReseauSocial;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieReseauSocial>
 */
class LaverieReseauSocialRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieReseauSocial::class);
    }

    /**
     * @return LaverieReseauSocial[]
     */
    public function findByLaverie(Laverie $laverie): array
    {
        return $this->findBy(['laverie' => $laverie]);
    }

    public function deleteByLaverie(Laverie $laverie): void
    {
        $this->createQueryBuilder('lrs')
            ->delete()
            ->where('lrs.laverie = :laverie')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->execute();
    }
}
