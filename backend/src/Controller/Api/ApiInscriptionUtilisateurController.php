<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Entity\EmailVerificationToken;
use App\Enum\StatutUtilisateurEnum;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
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
        MailerInterface $mailer,
        UtilisateurRepository $utilisateurRepository
    ): JsonResponse {

        $data = json_decode($request->getContent(), true) ?? [];
        $emailCandidat = strtolower(trim((string)($data['email'] ?? '')));
        $compteEnAttente = null;
        if ($emailCandidat !== '') {
            $existant = $utilisateurRepository->findOneBy(['email' => $emailCandidat]);
            if ($existant !== null) {
                if ($existant->getUtilisateurSupprimeLe() !== null) {
                    $existant->setEmail('deleted_' . $existant->getId() . '_' . time() . '@deleted.invalid');
                    $entityManager->flush();
                } elseif ($existant->getStatut() === StatutUtilisateurEnum::STATUT_EN_ATTENTE) {
                    $compteEnAttente = $existant;
                }
            }
        }

        if ($compteEnAttente !== null) {
            $tokenString = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
            $expiresAt = new \DateTimeImmutable('+2 hours');

            $verificationToken = new EmailVerificationToken();
            $verificationToken->setUser($compteEnAttente);
            $verificationToken->setToken($tokenString);
            $verificationToken->setCreatedAt(new \DateTimeImmutable());
            $verificationToken->setExpiresAt($expiresAt);
            $entityManager->persist($verificationToken);
            $entityManager->flush();

            $verificationUrl = $this->generateUrl('api_verify_email', ['token' => $tokenString], UrlGeneratorInterface::ABSOLUTE_URL);

            $emailMessage = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($compteEnAttente->getEmail())
                ->subject('Confirmez votre inscription sur LaundryMap')
                ->htmlTemplate('emails/confirmation_email.html.twig')
                ->context([
                    'user' => $compteEnAttente,
                    'verificationUrl' => $verificationUrl,
                    'expiresAt' => $expiresAt,
                ]);

            try {
                $mailer->send($emailMessage);
            } catch (TransportExceptionInterface) {
                return $this->json([
                    'message' => 'Un problème est survenu lors de l\'envoi de l\'email. Veuillez réessayer dans quelques instants.'
                ], 503);
            }

            return $this->json([
                'message' => 'Inscription réussie ! Un email de vérification vous a été envoyé.'
            ], 201);
        }

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
            ->from($this->getParameter('mailer_from'))
            ->to($utilisateur->getEmail())
            ->subject('Confirmez votre inscription sur LaundryMap')
            ->htmlTemplate('emails/confirmation_email.html.twig')
            ->context([
                'user' => $utilisateur,
                'verificationUrl' => $verificationUrl,
                'expiresAt' => $expiresAt,
            ]);

        try {
            $mailer->send($emailMessage);
        } catch (TransportExceptionInterface) {
            return $this->json([
                'message' => 'Un problème est survenu lors de l\'envoi de l\'email. Veuillez réessayer dans quelques instants.'
            ], 503);
        }

        return $this->json([
            'message' => 'Inscription réussie ! Un email de vérification vous a été envoyé.'
        ], 201);
    }
}