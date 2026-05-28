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

    public function findOneByNoteAndUtilisateur($laverieNote, $utilisateur): ?LaverieNoteSignalement
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.laverieNote = :note')
            ->andWhere('s.utilisateur = :user')
            ->setParameter('note', $laverieNote)
            ->setParameter('user', $utilisateur)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countRecentByUtilisateur($utilisateur, \DateTimeInterface $since): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.utilisateur)')
            ->andWhere('s.utilisateur = :user')
            ->andWhere('s.date >= :since')
            ->setParameter('user', $utilisateur)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countByNote($laverieNote): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.utilisateur)')
            ->andWhere('s.laverieNote = :note')
            ->setParameter('note', $laverieNote)
            ->getQuery()
            ->getSingleScalarResult();
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
            ->setParameter('noteIds', $noteIds)
            ->setParameter('user', $utilisateur)
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

    //    /**
    //     * @return LaverieNoteSignalement[] Returns an array of LaverieNoteSignalement objects
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

    //    public function findOneBySomeField($value): ?LaverieNoteSignalement
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
