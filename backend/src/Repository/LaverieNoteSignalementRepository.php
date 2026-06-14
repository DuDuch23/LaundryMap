<?php

namespace App\Repository;

use App\Entity\LaverieNoteSignalement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieNoteSignalement>
 */
class LaverieNoteSignalementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieNoteSignalement::class);
    }

    public function findOneByNoteAndUtilisateur($laverieNote, $utilisateur, string $cible = LaverieNoteSignalement::CIBLE_COMMENTAIRE): ?LaverieNoteSignalement
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.laverieNote = :note')
            ->andWhere('s.utilisateur = :user')
            ->andWhere('s.cible = :cible')
            ->setParameter('note', $laverieNote)
            ->setParameter('user', $utilisateur)
            ->setParameter('cible', $cible)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countRecentByUtilisateur($utilisateur, \DateTimeInterface $since): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.cible)')
            ->andWhere('s.utilisateur = :user')
            ->andWhere('s.date >= :since')
            ->setParameter('user', $utilisateur)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countByNoteAndCible($laverieNote, string $cible): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.cible)')
            ->andWhere('s.laverieNote = :note')
            ->andWhere('s.cible = :cible')
            ->setParameter('note', $laverieNote)
            ->setParameter('cible', $cible)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** @deprecated Utiliser countByNoteAndCible() */
    public function countByNote($laverieNote): int
    {
        return $this->countByNoteAndCible($laverieNote, LaverieNoteSignalement::CIBLE_COMMENTAIRE);
    }

    public function findSignaledNoteIdsByUtilisateur(array $noteIds, $utilisateur): array
    {
        if (empty($noteIds)) {
            return [];
        }

        $results = $this->createQueryBuilder('s')
            ->select('IDENTITY(s.laverieNote) as noteId')
            ->andWhere('s.laverieNote IN (:noteIds)')
            ->andWhere('s.utilisateur = :user')
            ->andWhere('s.cible = :cible')
            ->setParameter('noteIds', $noteIds)
            ->setParameter('user', $utilisateur)
            ->setParameter('cible', LaverieNoteSignalement::CIBLE_COMMENTAIRE)
            ->getQuery()
            ->getResult();

        return array_map('intval', array_column($results, 'noteId'));
    }

    public function findSignaledReponseIdsByUtilisateur(array $noteIds, $utilisateur): array
    {
        if (empty($noteIds)) {
            return [];
        }

        $results = $this->createQueryBuilder('s')
            ->select('IDENTITY(s.laverieNote) as noteId')
            ->andWhere('s.laverieNote IN (:noteIds)')
            ->andWhere('s.utilisateur = :user')
            ->andWhere('s.cible = :cible')
            ->setParameter('noteIds', $noteIds)
            ->setParameter('user', $utilisateur)
            ->setParameter('cible', LaverieNoteSignalement::CIBLE_REPONSE)
            ->getQuery()
            ->getResult();

        return array_map('intval', array_column($results, 'noteId'));
    }

    public function findForModeration(): array
    {
        return $this->createQueryBuilder('s')
            ->addSelect('n')
            ->addSelect('u')
            ->join('s.laverieNote', 'n')
            ->join('s.utilisateur', 'u')
            ->orderBy('s.date', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
