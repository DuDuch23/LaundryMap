<?php

namespace App\Controller\Api\Professionnel;

use App\Entity\Utilisateur;
use App\Repository\ProfessionnelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApiProfessionnelConnexionController extends AbstractController
{
    #[Route('/api/connexion-professionnel', name: 'api_connexion_professionnel', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function connexionProfessionnel(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtTokenManager,
        ProfessionnelRepository $professionnelRepository,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
    ): JsonResponse {
        try {
            $donnees = json_decode($request->getContent(), true);

            if (!is_array($donnees)) {
                return $this->json(['erreur' => 'Données invalides'], 400);
            }

            $email = trim($donnees['email'] ?? '');
            $motDePasse = $donnees['password'] ?? '';

            if (empty($email) || empty($motDePasse)) {
                return $this->json(['erreur' => 'Email et mot de passe requis'], 400);
            }

            $professionnel = $professionnelRepository->findOneByUtilisateurEmail($email);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Identifiants invalides'], 401);
            }

            $utilisateur = $professionnel->getUtilisateur();

            if (!$passwordHasher->isPasswordValid($utilisateur, $motDePasse)) {
                return $this->json(['erreur' => 'Identifiants invalides'], 401);
            }

            $utilisateur->setDateDerniereConnexion(new \DateTime());
            $entityManager->flush();

            $token = $jwtTokenManager->create($utilisateur);

            return $this->json([
                'token' => $token,
                'utilisateur' => [
                    'id' => $utilisateur->getId(),
                    'email' => $utilisateur->getEmail(),
                    'nom' => $utilisateur->getNom(),
                    'prenom' => $utilisateur->getPrenom(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->json([
                'erreur' => 'Erreur lors de la connexion',
            ], 500);
        }
    }
}
