<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Route;


class InscriptionController extends AbstractController
{
    #[Route(path: '/api/inscription', name: 'api_inscription', methods: ['POST'])]
    public function inscription(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['mot_de_passe'])) {
            return new JsonResponse(['message' => 'Email et mot de passe sont requis.'], 400);
        }

        $utilisateur = new Utilisateur();
        $utilisateur->setEmail($data['email']);
        $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $data['mot_de_passe']));

        $entityManager->persist($utilisateur);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Inscription réussie.'], 201);
    }

    #[Route(path: '/api/connexion', name: 'api_connexion', methods: ['POST'])]
    public function connexion(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['mot_de_passe'])) {
            return new JsonResponse(['message' => 'Email et mot de passe sont requis.'], 400);
        }

        $utilisateur = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);

        if (!$utilisateur || !$passwordHasher->isPasswordValid($utilisateur, $data['mot_de_passe'])) {
            return new JsonResponse(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        return new JsonResponse(['message' => 'Connexion réussie.'], 200);
    }
}