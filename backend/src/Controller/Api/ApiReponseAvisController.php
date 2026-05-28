<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Repository\LaverieNoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Réponse aux avis par le professionnel.
 * Seul le professionnel validé, propriétaire de la laverie concernée, peut répondre.
 */
class ApiReponseAvisController extends AbstractController
{
    public function __construct(
        private readonly MailerInterface $mailer,
    ) {}

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function getProfessionnelValide(): mixed
    {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(['message' => 'Non authentifié.'], 401);
        }

        $professionnel = $user->getProfessionnel();
        if ($professionnel === null) {
            return $this->json(['message' => 'Accès réservé aux professionnels validés.'], 403);
        }

        if ($professionnel->getStatut()->value !== 'Validé') {
            return $this->json(['message' => 'Votre compte professionnel n\'est pas encore validé.'], 403);
        }

        return $professionnel;
    }

    private function envoyerNotification(
        \App\Entity\LaverieNote $laverieNote,
        string $reponse,
        bool $isNew,
    ): void {
        $auteur = $laverieNote->getUtilisateur();
        $sujet  = $isNew
            ? 'Un professionnel a répondu à votre avis sur LaundryMap'
            : 'Un professionnel a modifié sa réponse à votre avis sur LaundryMap';

        $email = (new TemplatedEmail())
            ->from($_ENV['MAILER_FROM'] ?? 'noreply@laundrymap.fr')
            ->to($auteur->getEmail())
            ->subject($sujet)
            ->htmlTemplate('emails/reponse_avis.html.twig')
            ->context([
                'user'        => $auteur,
                'nomLaverie'  => $laverieNote->getLaverie()->getNomEtablissement(),
                'commentaire' => $laverieNote->getCommentaire(),
                'reponse'     => $reponse,
                'isNew'       => $isNew,
            ]);

        $this->mailer->send($email);
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    /**
     * Publier ou modifier la réponse à un commentaire.
     * POST /api/professionnel/avis/{id}/reponse
     */
    #[Route(
        '/api/professionnel/avis/{id}/reponse',
        name: 'api_professionnel_reponse_avis_upsert',
        methods: ['POST'],
        requirements: ['id' => '\\d+'],
    )]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function upsertReponse(
        int $id,
        Request $request,
        LaverieNoteRepository $noteRepo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laverieNote = $noteRepo->find($id);
        if (!$laverieNote || empty($laverieNote->getCommentaire())) {
            return $this->json(['message' => 'Commentaire introuvable.'], 404);
        }

        // Vérifier que la laverie appartient à ce professionnel
        if ($laverieNote->getLaverie()->getProfessionnel()?->getId() !== $professionnel->getId()) {
            return $this->json(['message' => 'Non autorisé.'], 403);
        }

        $data    = json_decode($request->getContent(), true) ?? [];
        $reponse = isset($data['reponse']) && is_string($data['reponse']) ? trim($data['reponse']) : null;

        if ($reponse === null || $reponse === '') {
            return $this->json(['message' => 'La réponse ne peut pas être vide.'], 400);
        }

        if (mb_strlen($reponse) > 500) {
            return $this->json(['message' => 'La réponse est trop longue (500 caractères maximum).'], 400);
        }

        $isNew = ($laverieNote->getReponse() === null);

        $laverieNote->setReponse($reponse)->setReponduLe(new \DateTime());
        $em->flush();

        // Notification email (non bloquante)
        try {
            $this->envoyerNotification($laverieNote, $reponse, $isNew);
        } catch (\Throwable) {
            // L'échec d'envoi d'email ne doit pas faire échouer la réponse HTTP
        }

        return $this->json([
            'message'   => $isNew ? 'Réponse publiée.' : 'Réponse modifiée.',
            'reponse'   => $reponse,
            'reponduLe' => $laverieNote->getReponduLe()?->format('c'),
        ], $isNew ? 201 : 200);
    }

    /**
     * Supprimer la réponse à un commentaire.
     * DELETE /api/professionnel/avis/{id}/reponse
     */
    #[Route(
        '/api/professionnel/avis/{id}/reponse',
        name: 'api_professionnel_reponse_avis_supprimer',
        methods: ['DELETE'],
        requirements: ['id' => '\\d+'],
    )]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function supprimerReponse(
        int $id,
        LaverieNoteRepository $noteRepo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laverieNote = $noteRepo->find($id);
        if (!$laverieNote) {
            return $this->json(['message' => 'Commentaire introuvable.'], 404);
        }

        if ($laverieNote->getLaverie()->getProfessionnel()?->getId() !== $professionnel->getId()) {
            return $this->json(['message' => 'Non autorisé.'], 403);
        }

        if ($laverieNote->getReponse() === null) {
            return $this->json(['message' => 'Aucune réponse à supprimer.'], 404);
        }

        $laverieNote->setReponse(null)->setReponduLe(null);
        $em->flush();

        return $this->json(['message' => 'Réponse supprimée.']);
    }
}
