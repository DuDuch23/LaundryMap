<?php

namespace App\Controller\Api;

use App\Entity\LaverieNote;
use App\Entity\Utilisateur;
use App\Entity\LaverieNoteSignalement;
use App\Enum\MotifEnum;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiLaverieNoteSignalementController extends AbstractController
{
    private const MAX_REPORTS_PER_USER_PER_WEEK = 10;
    private const AUTO_HIDE_THRESHOLD = 5;

    #[Route('/api/laverie-notes/{id}/signalement', name: 'api_laverie_note_signaler', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function signaler(
        int $id,
        Request $request,
        LaverieNoteRepository $noteRepo,
        LaverieNoteSignalementRepository $signalementRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        try {
            $utilisateur = $this->getUser();

            if (!$utilisateur instanceof Utilisateur) {
                return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
            }

            // Log incoming request for debugging
            try {
                $this->container->get('logger')->info('Signalement request', [
                    'user' => $utilisateur->getId(),
                    'noteId' => $id,
                    'content' => $request->getContent(),
                ]);
            } catch (\Throwable) {
            }

            $note = $noteRepo->find($id);
            if (!$note instanceof LaverieNote) {
                return $this->json(['message' => 'Commentaire introuvable.'], 404);
            }

            // Prevent duplicate reports from same user on same comment
            $existing = $signalementRepo->findOneByNoteAndUtilisateur($note, $utilisateur);
            if ($existing !== null) {
                return $this->json(['message' => 'Vous avez déjà signalé ce commentaire.'], 409);
            }

            // Rate limit per user: last 7 days
            $since = new \DateTimeImmutable('-7 days');
            $countRecent = $signalementRepo->countRecentByUtilisateur($utilisateur, $since);
            if ($countRecent >= self::MAX_REPORTS_PER_USER_PER_WEEK) {
                return $this->json(['message' => 'Nombre maximum de signalements (hebdomadaire) atteint. Réessayez plus tard.'], 429);
            }

            $payload = json_decode($request->getContent(), true);
            $motifInput = trim((string) ($payload['motif'] ?? ''));
            $commentaire = isset($payload['commentaire']) ? trim((string)$payload['commentaire']) : null;

            $motif = $this->resolveMotif($motifInput);
            if ($motif === null) {
                return $this->json(['message' => 'Motif invalide.'], 400);
            }

            $signalement = new LaverieNoteSignalement();
            $signalement->setLaverieNote($note);
            $signalement->setUtilisateur($utilisateur);
            $signalement->setDate(new \DateTime());
            $signalement->setMotif($motif);
            $signalement->setCommentaire($commentaire ?: null);

            $em->persist($signalement);

            // Try to flush and handle DB-related errors gracefully
            try {
                $em->flush();
            } catch (\Doctrine\DBAL\Exception\Exception $dbalEx) {
                try { $this->container->get('logger')->error('DBAL error during signalement flush', ['exception' => $dbalEx]); } catch (\Throwable) {}
                return $this->json(['message' => 'Service de base de données indisponible. Réessayez plus tard.'], 503);
            } catch (\PDOException $pdoEx) {
                try { $this->container->get('logger')->error('PDO error during signalement flush', ['exception' => $pdoEx]); } catch (\Throwable) {}
                return $this->json(['message' => 'Service de base de données indisponible. Réessayez plus tard.'], 503);
            }

            try {
                $total = $signalementRepo->countByNote($note);
            } catch (\Throwable $countEx) {
                try { $this->container->get('logger')->error('Error counting signalements', ['exception' => $countEx]); } catch (\Throwable) {}
                return $this->json(['message' => 'Impossible de comptabiliser les signalements pour le moment.'], 503);
            }
            if ($total >= self::AUTO_HIDE_THRESHOLD && $note->getCommentaireSupprimeeLe() === null) {
                $note->setCommentaireSupprimeMotif('Masquage automatique après ' . $total . ' signalements');
                $note->setCommentaireSupprimeeLe(new \DateTime());
                $em->persist($note);
                $em->flush();
            }

            return $this->json(['message' => 'Signalement enregistré', 'totalSignalements' => $total], 201);
        } catch (\Throwable $e) {
            try {
                $this->container->get('logger')->error('Signalement error: '.$e->getMessage(), ['exception' => $e]);
            } catch (\Throwable) {}

            return $this->json(['message' => 'Erreur serveur lors de l\'enregistrement du signalement.', 'detail' => $e->getMessage()], 500);
        }

    }

    private function resolveMotif(string $input): ?MotifEnum
    {
        if ($input === '') return null;
        foreach (MotifEnum::cases() as $case) {
            if (strcasecmp($case->value, $input) === 0 || strcasecmp($case->name, $input) === 0) {
                return $case;
            }
        }
        return null;
    }
}
