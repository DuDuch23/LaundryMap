<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiInscriptionUtilisateurController extends AbstractController
{
    #[Route('/api/inscription-utilisateur', name: 'api_inscription', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function inscription(Request $request, SerializerInterface $serializer, UserPasswordHasherInterface $passwordHasher, 
    EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse {

        $utilisateur = $serializer->deserialize($request->getContent(), Utilisateur::class, 'json');

        //GESTION DES ERREURS
        $erreursFront = [];
        $erreurs = $validator->validate($utilisateur);

        foreach ($erreurs as $erreur){
            $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
        }

        if (count($erreursFront) > 0) {
            return $this->json(['erreurs' => $erreursFront], 400);
        }

        // UTILISATEUR
        $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_VALIDE);

        $motDePasseEnClair = $utilisateur->getMotDePasse();
        if ($motDePasseEnClair) {
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasseEnClair));
        }

        $entityManager->persist($utilisateur);
        $entityManager->flush();

        return $this->json(['message' => 'Inscription réussie avec succès !'], 201);
    }
}