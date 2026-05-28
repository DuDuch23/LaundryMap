<?php

namespace App\Controller\Api\Administration;

use App\Entity\LaverieNote;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiModerationController extends AbstractController
{
    #[Route('/api/admin/moderation/commentaires', name: 'api_admin_moderation_commentaires', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function liste(LaverieNoteSignalementRepository $signalementRepo, Request $request): JsonResponse
    {
        $rows = $signalementRepo->findForModeration();

        $result = [];
        foreach ($rows as $s) {
            $note = $s->getLaverieNote();
            $nid = $note->getId();
            if (!isset($result[$nid])) {
                $result[$nid] = [
                    'noteId' => $nid,
                    'laverieId' => $note->getLaverie()->getId(),
                    'commentaire' => $note->getCommentaire(),
                    'auteurId' => $note->getUtilisateur()->getId(),
                    'commentaireSupprimeMotif' => $note->getCommentaireSupprimeMotif(),
                    'commentaireSupprimeeLe' => $note->getCommentaireSupprimeeLe()?->format('c'),
                    'signalements' => [],
                ];
            }

            $result[$nid]['signalements'][] = [
                'date' => $s->getDate()->format('c'),
                'motif' => $s->getMotif()->value,
                'commentaire' => $s->getCommentaire(),
                'utilisateurId' => $s->getUtilisateur()->getId(),
            ];
        }

        // Reindex
        $payload = array_values($result);

        return $this->json(['items' => $payload]);
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
