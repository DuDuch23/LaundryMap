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

    /**
     * QueryBuilder de modération (admin) : retourne les commentaires avec un compteur
     * de signalements, filtrable par statut (signales / non_signales / modere / tous)
     * et triable. Par défaut, on met les commentaires signalés non modérés en haut.
     *
     * @param string|null $statut signales|non_signales|modere|tous
     * @param string|null $ordre  recent|ancien|plus_signale
     */
    public function createModerationQueryBuilder(?string $statut, ?string $ordre): QueryBuilder
    {
        $signalementClass = \App\Entity\LaverieNoteSignalement::class;

        $qb = $this->createQueryBuilder('n')
            ->select('n')
            ->addSelect("(SELECT COUNT(s2.utilisateur) FROM {$signalementClass} s2 WHERE s2.laverieNote = n) AS HIDDEN nbSignalements")
            ->join('n.laverie', 'l')
            ->join('n.utilisateur', 'auteur')
            ->andWhere('l.supprimee_le IS NULL')
            ->andWhere('n.commentaire IS NOT NULL')
            ->andWhere("n.commentaire <> ''");

        switch ($statut) {
            case 'signales':
                $qb->andWhere("EXISTS (SELECT 1 FROM {$signalementClass} sf WHERE sf.laverieNote = n)")
                   ->andWhere('n.commentaireSupprimeeLe IS NULL');
                break;
            case 'non_signales':
                $qb->andWhere("NOT EXISTS (SELECT 1 FROM {$signalementClass} sf WHERE sf.laverieNote = n)")
                   ->andWhere('n.commentaireSupprimeeLe IS NULL');
                break;
            case 'modere':
                $qb->andWhere('n.commentaireSupprimeeLe IS NOT NULL');
                break;
            case 'tous':
            default:
                break;
        }

        // Tri
        switch ($ordre) {
            case 'ancien':
                $qb->orderBy('n.commenteLe', 'ASC');
                break;
            case 'plus_signale':
                $qb->orderBy('nbSignalements', 'DESC')
                   ->addOrderBy('n.commenteLe', 'DESC');
                break;
            case 'recent':
            default:
                $qb->orderBy('nbSignalements', 'DESC')
                   ->addOrderBy('n.commenteLe', 'DESC');
                break;
        }

        return $qb;
    }

    /**
     * Nombre de commentaires signalés non encore modérés (pour l'encart admin).
     */
    public function countSignalesEnAttente(): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(DISTINCT n.id)')
            ->join('n.signalements', 's')
            ->join('n.laverie', 'l')
            ->andWhere('l.supprimee_le IS NULL')
            ->andWhere('n.commentaireSupprimeeLe IS NULL')
            ->andWhere('n.commentaire IS NOT NULL')
            ->andWhere("n.commentaire <> ''")
            ->getQuery()
            ->getSingleScalarResult();
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
