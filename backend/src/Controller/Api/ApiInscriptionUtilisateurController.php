<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Entity\EmailVerificationToken;
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
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ApiInscriptionUtilisateurController extends AbstractController
{
    #[Route('/api/inscription-utilisateur', name: 'api_inscription', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function inscription(
        Request $request, 
        SerializerInterface $serializer, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $entityManager, 
        ValidatorInterface $validator,
        MailerInterface $mailer
    ): JsonResponse {

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

        $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_EN_ATTENTE);

        $motDePasseEnClair = $utilisateur->getMotDePasse();
        if ($motDePasseEnClair) {
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasseEnClair));
        }

        $entityManager->persist($utilisateur);

        $tokenString = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $expiresAt = new \DateTimeImmutable('+2 hours');

        $verificationToken = new EmailVerificationToken();
        $verificationToken->setUser($utilisateur);
        $verificationToken->setToken($tokenString);
        $verificationToken->setCreatedAt(new \DateTimeImmutable());
        $verificationToken->setExpiresAt($expiresAt);

        $entityManager->persist($verificationToken);
        $entityManager->flush();

        $verificationUrl = $this->generateUrl('api_verify_email', ['token' => $tokenString], UrlGeneratorInterface::ABSOLUTE_URL);

        $emailMessage = (new TemplatedEmail())
            ->from('noreply@laundrymap.fr')
            ->to($utilisateur->getEmail())
            ->subject('Confirmez votre inscription sur LaundryMap')
            ->htmlTemplate('emails/confirmation_email.html.twig')
            ->context([
                'user' => $utilisateur,
                'verificationUrl' => $verificationUrl,
                'expiresAt' => $expiresAt,
            ]);

        $mailer->send($emailMessage);

        return $this->json([
            'message' => 'Inscription réussie ! Un email de vérification vous a été envoyé.'
        ], 201);
    }
}