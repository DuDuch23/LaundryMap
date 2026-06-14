<?php

namespace App\Controller\Api;

use App\Entity\LaverieNote;
use App\Entity\Utilisateur;
use App\Entity\LaverieNoteSignalement;
use App\Enum\MotifEnum;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\DBAL\Exception as DBALException;
use Doctrine\ORM\EntityManagerInterface;
use PDOException;
use Throwable;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiLaverieNoteSignalementController extends AbstractController
{
    private const MAX_REPORTS_PER_USER_PER_WEEK = 10;
    private const AUTO_HIDE_THRESHOLD = 5;

    private const CIBLES_VALIDES = [
        LaverieNoteSignalement::CIBLE_COMMENTAIRE,
        LaverieNoteSignalement::CIBLE_REPONSE,
    ];

    #[Route('/api/laverie-notes/{id}/signalement', name: 'api_laverie_note_signaler', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
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

            $note = $noteRepo->find($id);
            if (!$note instanceof LaverieNote) {
                return $this->json(['message' => 'Commentaire introuvable.'], 404);
            }

            $payload = json_decode($request->getContent(), true);
            $motifInput = trim((string) ($payload['motif'] ?? ''));
            $commentaire = isset($payload['commentaire']) ? trim((string) $payload['commentaire']) : null;
            $cible = trim((string) ($payload['cible'] ?? LaverieNoteSignalement::CIBLE_COMMENTAIRE));

            if (!in_array($cible, self::CIBLES_VALIDES, true)) {
                return $this->json(['message' => 'Cible invalide. Valeurs acceptées : commentaire, reponse.'], 400);
            }

            // Empêcher de signaler une réponse inexistante
            if ($cible === LaverieNoteSignalement::CIBLE_REPONSE && $note->getReponse() === null) {
                return $this->json(['message' => 'Aucune réponse à signaler pour ce commentaire.'], 404);
            }

            // Prévenir les doublons (par note + utilisateur + cible)
            $existing = $signalementRepo->findOneByNoteAndUtilisateur($note, $utilisateur, $cible);
            if ($existing !== null) {
                $label = $cible === LaverieNoteSignalement::CIBLE_REPONSE ? 'cette réponse' : 'ce commentaire';
                return $this->json(['message' => "Vous avez déjà signalé $label."], 409);
            }

            // Rate limit par utilisateur : 7 derniers jours (toutes cibles confondues)
            $since = new \DateTimeImmutable('-7 days');
            $countRecent = $signalementRepo->countRecentByUtilisateur($utilisateur, $since);
            if ($countRecent >= self::MAX_REPORTS_PER_USER_PER_WEEK) {
                return $this->json(['message' => 'Nombre maximum de signalements (hebdomadaire) atteint. Réessayez plus tard.'], 429);
            }

            $motif = $this->resolveMotif($motifInput);
            if ($motif === null) {
                return $this->json(['message' => 'Motif invalide.'], 400);
            }

            $signalement = new LaverieNoteSignalement();
            $signalement->setLaverieNote($note);
            $signalement->setUtilisateur($utilisateur);
            $signalement->setCible($cible);
            $signalement->setDate(new \DateTime());
            $signalement->setMotif($motif);
            $signalement->setCommentaire($commentaire ?: null);

            $em->persist($signalement);

            try {
                $em->flush();
            } catch (DBALException) {
                return $this->json(['message' => 'Service de base de données indisponible. Réessayez plus tard.'], 503);
            } catch (PDOException) {
                return $this->json(['message' => 'Service de base de données indisponible. Réessayez plus tard.'], 503);
            }

            $total = $signalementRepo->countByNoteAndCible($note, $cible);

            if ($total >= self::AUTO_HIDE_THRESHOLD) {
                if ($cible === LaverieNoteSignalement::CIBLE_COMMENTAIRE && $note->getCommentaireSupprimeeLe() === null) {
                    $note->setCommentaireSupprimeMotif('Masquage automatique après ' . $total . ' signalements');
                    $note->setCommentaireSupprimeeLe(new \DateTime());
                    $em->persist($note);
                    $em->flush();
                } elseif ($cible === LaverieNoteSignalement::CIBLE_REPONSE && $note->getReponse() !== null) {
                    $note->setReponse(null);
                    $note->setReponduLe(null);
                    $em->persist($note);
                    $em->flush();
                }
            }

            return $this->json(['message' => 'Signalement enregistré', 'totalSignalements' => $total], 201);
        } catch (Throwable $e) {
            try {
                $this->container->get('logger')->error('Signalement error: ' . $e->getMessage(), ['exception' => $e]);
            } catch (Throwable) {}

            return $this->json(['message' => 'Erreur serveur lors de l\'enregistrement du signalement.'], 500);
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
