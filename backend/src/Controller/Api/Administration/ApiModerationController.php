<?php

namespace App\Controller\Api\Administration;

use App\Entity\LaverieNote;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiModerationController extends AbstractController
{
    private const PAR_PAGE = 10;

    #[Route('/api/admin/moderation/commentaires', name: 'api_admin_moderation_commentaires', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function liste(Request $request, LaverieNoteRepository $noteRepo): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $statut = $request->query->get('statut');
        $ordre = $request->query->get('ordre');

        $qb = $noteRepo->createModerationQueryBuilder($statut, $ordre);
        $adapter = new QueryAdapter($qb);
        $pagerfanta = new Pagerfanta($adapter);
        $pagerfanta->setMaxPerPage(self::PAR_PAGE);

        if ($page > max(1, $pagerfanta->getNbPages())) {
            $page = max(1, $pagerfanta->getNbPages());
        }
        $pagerfanta->setCurrentPage($page);

        $items = [];
        foreach ($pagerfanta->getCurrentPageResults() as $note) {
            /** @var LaverieNote $note */
            $items[] = $this->formatNote($note);
        }

        return $this->json([
            'items' => $items,
            'totalSignalesEnAttente' => $noteRepo->countSignalesEnAttente(),
            'pagination' => [
                'pageCourante' => $pagerfanta->getCurrentPage(),
                'totalPages' => $pagerfanta->getNbPages(),
                'totalResultats' => $pagerfanta->getNbResults(),
                'parPage' => self::PAR_PAGE,
                'aPageSuivante' => $pagerfanta->hasNextPage(),
                'aPagePrecedente' => $pagerfanta->hasPreviousPage(),
            ],
        ]);
    }

    private function formatNote(LaverieNote $note): array
    {
        $auteur = $note->getUtilisateur();
        $laverie = $note->getLaverie();
        $adresse = $laverie->getAdresse();
        $adresseTexte = 'Adresse non renseignée';
        if ($adresse) {
            $adresseTexte = sprintf('%s, %s %s', $adresse->getAdresse(), $adresse->getCodePostal(), $adresse->getVille());
        }

        $signalements = [];
        foreach ($note->getSignalements() as $s) {
            $signaleur = $s->getUtilisateur();
            $signalements[] = [
                'date' => $s->getDate()->format('c'),
                'motif' => $s->getMotif()->value,
                'commentaire' => $s->getCommentaire(),
                'utilisateur' => $signaleur ? [
                    'id' => $signaleur->getId(),
                    'prenom' => $signaleur->getPrenom(),
                    'nom' => $signaleur->getNom(),
                    'email' => $signaleur->getEmail(),
                ] : null,
            ];
        }

        // Tri antichronologique
        usort($signalements, fn($a, $b) => strcmp($b['date'], $a['date']));

        $nbSignalements = count($signalements);
        $estModere = $note->getCommentaireSupprimeeLe() !== null;

        return [
            'noteId' => $note->getId(),
            'note' => $note->getNote(),
            'commentaire' => $note->getCommentaire(),
            'commenteLe' => $note->getCommenteLe()?->format('c'),
            'noteLe' => $note->getNoteLe()?->format('c'),
            'estSignale' => $nbSignalements > 0,
            'estModere' => $estModere,
            'nbSignalements' => $nbSignalements,
            'commentaireSupprimeMotif' => $note->getCommentaireSupprimeMotif(),
            'commentaireSupprimeeLe' => $note->getCommentaireSupprimeeLe()?->format('c'),
            'auteur' => [
                'id' => $auteur->getId(),
                'prenom' => $auteur->getPrenom(),
                'nom' => $auteur->getNom(),
                'email' => $auteur->getEmail(),
            ],
            'laverie' => [
                'id' => $laverie->getId(),
                'nomEtablissement' => $laverie->getNomEtablissement(),
                'adresse' => $adresseTexte,
            ],
            'signalements' => $signalements,
        ];
    }

    #[Route('/api/admin/moderation/commentaires/{noteId}/decision', name: 'api_admin_moderation_commentaire_decision', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function decision(
        int $noteId,
        Request $request,
        LaverieNoteRepository $noteRepo,
        LaverieNoteSignalementRepository $signalementRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $note = $noteRepo->find($noteId);
        if (!$note instanceof LaverieNote) {
            return $this->json(['message' => 'Commentaire introuvable.'], 404);
        }

        $payload = json_decode($request->getContent(), true);
        $action = $payload['action'] ?? null; // 'keep'|'delete'
        $adminMotif = isset($payload['motif']) ? trim((string)$payload['motif']) : null;

        if ($action === 'delete') {
            $note->setCommentaireSupprimeMotif($adminMotif ?: 'Supprimé par un administrateur');
            $note->setCommentaireSupprimeeLe(new \DateTime());
            $em->persist($note);
            $em->flush();

            return $this->json(['message' => 'Commentaire masqué/supprimé par l\'administrateur.']);
        }

        if ($action === 'keep') {
            // Remove suppression flags and delete associated signalements
            $note->setCommentaireSupprimeMotif(null);
            $note->setCommentaireSupprimeeLe(null);

            foreach ($note->getSignalements() as $s) {
                $em->remove($s);
            }

            $em->persist($note);
            $em->flush();

            return $this->json(['message' => 'Signalements supprimés et commentaire rétabli.']);
        }

        return $this->json(['message' => 'Action inconnue.'], 400);
    }
}
