<?php

namespace App\Repository;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Utilisateur>
 */
class UtilisateurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Utilisateur::class);
    }

    public function createFilteredQueryBuilder(
        ?string $statut = null,
        ?string $type = null,
        ?string $proprietaire = null,
        ?string $ordre = null
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('u.professionnel', 'p');

        // Filtre par statut
        if ($statut) {
            $statutEnum = match($statut) {
                'Validée' => StatutUtilisateurEnum::STATUT_VALIDE,
                'Refusée' => StatutUtilisateurEnum::STATUT_REFUSE,
                'En attente' => StatutUtilisateurEnum::STATUT_EN_ATTENTE,
                'Banni' => StatutUtilisateurEnum::STATUT_BANNI,
                'Supprimée' => StatutUtilisateurEnum::STATUT_SUPPRIME,
                default => null,
            };

            if ($statutEnum) {
                $qb->andWhere('(p.id IS NULL AND u.statut = :statut) OR (p.id IS NOT NULL AND p.statut = :statut)')
                   ->setParameter('statut', $statutEnum);
            }
        }

        // Filtre par type
        if ($type) {
            match($type) {
                'professionnels' => $qb->andWhere('p.id IS NOT NULL'),
                'clients' => $qb->andWhere('p.id IS NULL'),
                default => null,
            };
        }

        // Filtre par propriétaire (a des laveries ou non)
        if ($proprietaire) {
            $qb->leftJoin('p.laveries', 'l');
            if ($proprietaire === 'oui') {
                $qb->andWhere('l.id IS NOT NULL');
            } elseif ($proprietaire === 'non') {
                $qb->andWhere('l.id IS NULL');
            }
        }

        // Ordre
        if ($ordre === 'croissant') {
            $qb->orderBy('u.id', 'ASC');
        } elseif ($ordre === 'decroissant') {
            $qb->orderBy('u.id', 'DESC');
        } else {
            $qb->orderBy('u.id', 'ASC');
        }

        return $qb;
    }

    public function countEnAttente(): int
    {
        return (int) $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->leftJoin('u.professionnel', 'p')
            ->where(
                '(p.id IS NOT NULL AND p.statut = :statutAttente) OR (p.id IS NULL AND u.statut = :statutAttente)'
            )
            ->setParameter('statutAttente', StatutUtilisateurEnum::STATUT_EN_ATTENTE)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
