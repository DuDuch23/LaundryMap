<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieNote;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieNote>
 */
class LaverieNoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieNote::class);
    }

    public function countCommentairesByLaverie(Laverie $laverie): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->join('n.utilisateur', 'u')
            ->where('n.laverie = :laverie')
            ->andWhere('n.commentaire IS NOT NULL')
            ->andWhere('n.commentaire <> :empty')
            ->andWhere('u.utilisateurSupprimeLe IS NULL')
            ->setParameter('laverie', $laverie)
            ->setParameter('empty', '')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getMoyenneByLaverie(Laverie $laverie): ?float
    {
        $result = $this->createQueryBuilder('n')
            ->select('AVG(n.note)')
            ->join('n.utilisateur', 'u')
            ->where('n.laverie = :laverie')
            ->andWhere('n.note IS NOT NULL')
            ->andWhere('u.utilisateurSupprimeLe IS NULL')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->getSingleScalarResult();

        if ($result === null) {
            return null;
        }

        return round((float) $result, 1);
    }

    /** @return LaverieNote[] */
    public function findByUtilisateur(Utilisateur $utilisateur): array
    {
        return $this->createByUtilisateurQueryBuilder($utilisateur)
            ->getQuery()
            ->getResult();
    }

    public function createByUtilisateurQueryBuilder(Utilisateur $utilisateur): QueryBuilder
    {
        return $this->createQueryBuilder('n')
            ->join('n.laverie', 'l')
            ->where('n.utilisateur = :user')
            ->andWhere('l.supprimee_le IS NULL')
            ->setParameter('user', $utilisateur)
            ->orderBy('n.noteLe', 'DESC');
    }

    //    /**
    //     * @return LaverieNote[] Returns an array of LaverieNote objects
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

    //    public function findOneBySomeField($value): ?LaverieNote
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
