<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Utilisateur;
use App\Entity\EmailVerificationToken;
use App\Entity\Professionnel;
use App\Enum\StatutProfessionnelEnum;
use App\Enum\StatutUtilisateurEnum;
use App\Repository\ProfessionnelRepository;
use App\Repository\UtilisateurRepository;
use App\Service\ApiSirenSiretService;
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
            ->from($this->getParameter('mailer_from'))
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

    #[Route('/api/inscription-professionnel', name: 'api_inscription-professionnel', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function inscriptionProfessionnel(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ApiSirenSiretService $sirenService,
        ProfessionnelRepository $professionnelRepository,
        UtilisateurRepository $utilisateurRepository,
    ): JsonResponse {
        try {
            $donnees = json_decode($request->getContent(), true);

            if (!is_array($donnees)) {
                return $this->json(['erreurs' => ['global' => 'Données invalides']], 400);
            }

            $erreursFront = [];
            $sirenOuSiret = trim($donnees['sirenOrSiret'] ?? '');

            $resultat = null;
            $existeUtilisateur = $utilisateurRepository->findOneByEmail((string) ($donnees['email'] ?? ''));

            if ($existeUtilisateur) {
                $erreursFront['email'] = 'Cet email est déjà utilisé';
            }

            if (empty($sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Le numéro SIREN ou SIRET est requis';
            } elseif (!preg_match('/^\d{9}$/', $sirenOuSiret) && !preg_match('/^\d{14}$/', $sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Format invalide';
            } else {
                $resultat = $sirenService->verify($sirenOuSiret);
                if (!$resultat['valide']) {
                    $erreursFront['sirenOrSiret'] = 'Numéro SIREN/SIRET introuvable ou entreprise inactive';
                } else {
                    $existeSiren = $professionnelRepository->findOneBySiren((int) $resultat['siren']);

                    if ($existeSiren) {
                        $erreursFront['sirenOrSiret'] = 'Ce numéro SIREN/SIRET est déjà utilisé';
                    }
                }
            }

            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }

            $utilisateur = new Utilisateur();
            $utilisateur->setEmail($donnees['email'] ?? '');
            $utilisateur->setNom(!empty($donnees['nom']) ? $donnees['nom'] : null);
            $utilisateur->setPrenom(!empty($donnees['prenom']) ? $donnees['prenom'] : null);
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $donnees['password'] ?? ''));
            $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_EN_ATTENTE);

            $erreurs = $validator->validate($utilisateur, null, ['utilisateur:write']);
            foreach ($erreurs as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }

            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }

            $adresse = new Adresse();
            $adresse->setAdresse($donnees['adresse'] ?? '');
            $adresse->setRue($donnees['rue'] ?? '');
            $adresse->setCodePostal((int) ($donnees['codePostal'] ?? 0));
            $adresse->setVille($donnees['ville'] ?? '');
            $adresse->setPays($donnees['pays'] ?? 'France');

            $erreursAdresse = $validator->validate($adresse);
            foreach ($erreursAdresse as $erreur) {
                $erreursFront['adresse_' . $erreur->getPropertyPath()] = $erreur->getMessage();
            }

            $professionnel = new Professionnel();
            $professionnel->setUtilisateur($utilisateur);
            $professionnel->setStatut(StatutProfessionnelEnum::STATUT_EN_ATTENTE);
            $professionnel->setSiren((int) $resultat['siren']);
            $professionnel->setAdresse($adresse);

            $erreursPro = $validator->validate($professionnel);
            foreach ($erreursPro as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }

            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }

            $entityManager->persist($utilisateur);
            $entityManager->persist($adresse);
            $entityManager->persist($professionnel);
            $entityManager->flush();

            return $this->json(
                ['message' => 'Inscription réussie avec succès !'],
                201,
                [],
                ['groups' => ['professionnel:read']]
            );
        } catch (\Exception $e) {
            return $this->json([
                'erreur' => $e->getMessage(),
                'fichier' => $e->getFile(),
                'ligne' => $e->getLine(),
            ], 500);
        }
    }
}