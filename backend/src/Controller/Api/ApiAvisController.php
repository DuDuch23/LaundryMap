<?php

namespace App\Controller\Api;

use App\Entity\LaverieNote;
use App\Entity\Utilisateur;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiAvisController extends AbstractController
{
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/api/profil/avis', name: 'api_profil_avis_liste', methods: ['GET'])]
    public function getMesAvis(LaverieNoteRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $notes = $repo->findByUtilisateur($user);
        $result = [];

        foreach ($notes as $note) {
            $laverie = $note->getLaverie();
            $adresse = $laverie->getAdresse();
            $result[] = [
                'id'          => $note->getId(),
                'note'        => $note->getNote(),
                'commentaire' => $note->getCommentaire(),
                'noteLe'      => $note->getNoteLe()?->format('Y-m-d H:i:s'),
                'commenteLe'  => $note->getCommenteLe()?->format('Y-m-d H:i:s'),
                'laverie'     => [
                    'id'         => $laverie->getId(),
                    'nom'        => $laverie->getNomEtablissement(),
                    'adresse'    => $adresse?->getAdresse(),
                    'codePostal' => $adresse?->getCodePostal(),
                    'ville'      => $adresse?->getVille(),
                ],
            ];
        }

        return $this->json(['avis' => $result]);
    }

    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/api/profil/avis', name: 'api_profil_avis_creer', methods: ['POST'])]
    public function creerAvis(
        Request $request,
        LaverieNoteRepository $noteRepo,
        LaverieRepository $laverieRepo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $data      = json_decode($request->getContent(), true) ?? [];
        $laverieId = $data['laverieId'] ?? null;
        $note      = $data['note'] ?? null;

        if (!$laverieId || $note === null) {
            return $this->json(['message' => 'laverieId et note sont requis'], 400);
        }

        if ((int) $note < 1 || (int) $note > 5) {
            return $this->json(['message' => 'La note doit être comprise entre 1 et 5'], 400);
        }

        $laverie = $laverieRepo->find((int) $laverieId);
        if (!$laverie || $laverie->getSupprimee_le() !== null) {
            return $this->json(['message' => 'Laverie introuvable'], 404);
        }

        if ($noteRepo->findOneBy(['laverie' => $laverie, 'utilisateur' => $user])) {
            return $this->json(['message' => 'Vous avez déjà laissé un avis pour cette laverie'], 409);
        }

        $laverieNote = new LaverieNote();
        $laverieNote->setLaverie($laverie)
                    ->setUtilisateur($user)
                    ->setNote((int) $note)
                    ->setNoteLe(new \DateTime());

        $em->persist($laverieNote);
        $em->flush();

        return $this->json([
            'message' => 'Note créée avec succès',
            'avis' => [
                'id'     => $laverieNote->getId(),
                'note'   => $laverieNote->getNote(),
                'noteLe' => $laverieNote->getNoteLe()?->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }

    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/api/profil/avis/{id}', name: 'api_profil_avis_modifier', methods: ['PUT'], requirements: ['id' => '\\d+'])]
    public function modifierAvis(
        int $id,
        Request $request,
        LaverieNoteRepository $noteRepo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $laverieNote = $noteRepo->find($id);
        if (!$laverieNote) {
            return $this->json(['message' => 'Avis introuvable'], 404);
        }

        if ($laverieNote->getUtilisateur()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $note = $data['note'] ?? null;
        $commentaireProvided = array_key_exists('commentaire', $data);
        $commentaire = $commentaireProvided ? $data['commentaire'] : null;

        if ($note === null) {
            return $this->json(['message' => 'La note est requise'], 400);
        }

        if ((int) $note < 1 || (int) $note > 5) {
            return $this->json(['message' => 'La note doit être comprise entre 1 et 5'], 400);
        }

        $laverieNote->setNote((int) $note)->setNoteLe(new \DateTime());

        if ($commentaireProvided) {
            $commentaireClean = is_string($commentaire) ? trim($commentaire) : null;
            if ($commentaireClean === '' || $commentaireClean === null) {
                $laverieNote->setCommentaire(null)->setCommenteLe(null);
            } else {
                if (mb_strlen($commentaireClean) > 1000) {
                    return $this->json(['message' => 'Le commentaire ne peut pas dépasser 1000 caractères'], 400);
                }
                $laverieNote->setCommentaire($commentaireClean)->setCommenteLe(new \DateTime());
            }
        }

        $em->flush();

        return $this->json([
            'message' => 'Avis modifié avec succès',
            'avis' => [
                'id'          => $laverieNote->getId(),
                'note'        => $laverieNote->getNote(),
                'noteLe'      => $laverieNote->getNoteLe()?->format('Y-m-d H:i:s'),
                'commentaire' => $laverieNote->getCommentaire(),
                'commenteLe'  => $laverieNote->getCommenteLe()?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/api/profil/avis/{id}', name: 'api_profil_avis_supprimer', methods: ['DELETE'], requirements: ['id' => '\\d+'])]
    public function supprimerAvis(
        int $id,
        LaverieNoteRepository $noteRepo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $laverieNote = $noteRepo->find($id);
        if (!$laverieNote) {
            return $this->json(['message' => 'Avis introuvable'], 404);
        }

        if ($laverieNote->getUtilisateur()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $em->remove($laverieNote);
        $em->flush();

        return $this->json(['message' => 'Avis supprimé avec succès']);
    }
}
