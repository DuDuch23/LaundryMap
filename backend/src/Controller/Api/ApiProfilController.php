<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiProfilController extends AbstractController
{
    #[Route('/api/profil', name: 'api_profil', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getProfil(): JsonResponse
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        return $this->json([
            'id' => $utilisateur->getId(),
            'email' => $utilisateur->getEmail(),
            'prenom' => $utilisateur->getPrenom(),
            'nom' => $utilisateur->getNom(),
            'statut' => $utilisateur->getStatut()->value,
            'dateCreation' => $utilisateur->getDateCreation()?->format(DATE_ATOM),
            'dateDerniereConnexion' => $utilisateur->getDateDerniereConnexion()?->format(DATE_ATOM),
        ]);
    }

    #[Route('/api/profil', name: 'api_profil_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateProfil(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        $payload = json_decode($request->getContent(), true);

        if (!is_array($payload)) {
            return $this->json(['message' => 'Corps de requête invalide.'], 400);
        }

        $nom = array_key_exists('nom', $payload) ? trim((string) $payload['nom']) : null;
        $prenom = array_key_exists('prenom', $payload) ? trim((string) $payload['prenom']) : null;
        $nouveauMotDePasse = array_key_exists('nouveauMotDePasse', $payload) ? (string) $payload['nouveauMotDePasse'] : '';

        if ($nom !== null && $nom === '') {
            return $this->json(['message' => 'Le nom ne peut pas être vide.'], 400);
        }

        if ($prenom !== null && $prenom === '') {
            return $this->json(['message' => 'Le prénom ne peut pas être vide.'], 400);
        }

        if ($nom !== null) {
            $utilisateur->setNom($nom);
        }

        if ($prenom !== null) {
            $utilisateur->setPrenom($prenom);
        }

        if ($nouveauMotDePasse !== '') {
            if (mb_strlen($nouveauMotDePasse) < 8) {
                return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
            }

            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $nouveauMotDePasse));
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Profil mis à jour avec succès.',
            'utilisateur' => [
                'id' => $utilisateur->getId(),
                'email' => $utilisateur->getEmail(),
                'prenom' => $utilisateur->getPrenom(),
                'nom' => $utilisateur->getNom(),
                'statut' => $utilisateur->getStatut()->value,
                'dateCreation' => $utilisateur->getDateCreation()?->format(DATE_ATOM),
                'dateDerniereConnexion' => $utilisateur->getDateDerniereConnexion()?->format(DATE_ATOM),
            ],
        ]);
    }
}
