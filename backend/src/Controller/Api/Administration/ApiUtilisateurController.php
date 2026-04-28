<?php

namespace App\Controller\Api\Administration;

use App\Repository\UtilisateurRepository;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\UtilisateurHistoriqueInteraction;
use App\Entity\ProfessionnelHistoriqueInteraction;
use App\Repository\EmailVerificationTokenRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;

class ApiUtilisateurController extends AbstractController
{
    #[Route('/api/admin/utilisateurs', name: 'api_admin_utilisateurs_liste', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUtilisateurs(
        Request $request,
        UtilisateurRepository $utilisateurRepository
    ): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $maxParPage = 10;

        $qb = $utilisateurRepository->createFilteredQueryBuilder(
            $request->query->get('statut'),
            $request->query->get('type'),
            $request->query->get('proprietaire'),
            $request->query->get('ordre')
        );

        $adapter = new QueryAdapter($qb);
        $pagerfanta = new Pagerfanta($adapter);
        $pagerfanta->setMaxPerPage($maxParPage);
        $pagerfanta->setCurrentPage($page);

        $tableauFormate = [];
        foreach ($pagerfanta->getCurrentPageResults() as $user) {
            $pro = $user->getProfessionnel();

            $statutUserValeur = $user->getStatut()->value;
            $statutUserReact = match($statutUserValeur) {
                'Validé'   => 'Validée',
                'Refusé'   => 'Refusée',
                'Banni'    => 'Banni',
                'Supprimé' => 'Supprimée',
                default    => 'En attente'
            };

            $userData = [
                'id' => $user->getId(),
                'prenom' => $user->getPrenom(),
                'nom' => $user->getNom(),
                'email' => $user->getEmail(),
                'statut' => $statutUserReact,
            ];

            if ($pro) {
                $statutProValeur = $pro->getStatut()->value;
                $statutProReact = match($statutProValeur) {
                    'Validé' => 'Validée',
                    'Refusé' => 'Refusée',
                    'Banni'  => 'Banni',
                    default  => 'En attente'
                };

                $adresse = $pro->getAdresse();
                if ($adresse) {
                    $userData['ville'] = $adresse->getVille();
                    $userData['codePostal'] = (string) $adresse->getCodePostal();
                }

                $laveriesData = [];
                foreach ($pro->getLaveries() as $laverie) {
                    $couleur = match($laverie->getStatut()->name) {
                        'STATUT_VALIDEE' => 'vert',
                        'STATUT_REFUSEE' => 'rouge',
                        default          => 'orange'
                    };

                    $laveriesData[] = [
                        'id' => $laverie->getId(),
                        'nom' => $laverie->getNomEtablissement(),
                        'statut' => $couleur,
                    ];
                }

                $userData['professionnel'] = [
                    'id' => $pro->getId(),
                    'siren' => (string) $pro->getSiren(),
                    'statut' => $statutProReact,
                    'laveries' => $laveriesData
                ];
            }

            $tableauFormate[] = $userData;
        }

        return $this->json([
            'totalEnAttente' => $utilisateurRepository->countEnAttente(),
            'utilisateurs' => $tableauFormate,
            'pagination' => [
                'pageCourante' => $pagerfanta->getCurrentPage(),
                'totalPages' => $pagerfanta->getNbPages(),
                'totalResultats' => $pagerfanta->getNbResults(),
                'parPage' => $maxParPage,
                'aPageSuivante' => $pagerfanta->hasNextPage(),
                'aPagePrecedente' => $pagerfanta->hasPreviousPage(),
            ]
        ]);
    }


    #[Route('/api/admin/utilisateurs/{id}', name: 'api_admin_utilisateur_detail', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUtilisateurDetail(int $id, UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        $user = $utilisateurRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $pro = $user->getProfessionnel();

        $statutUserNom = $user->getStatut()->name;
        $statutUserReact = match($statutUserNom) {
            'STATUT_VALIDE' => 'Validée',
            'STATUT_REFUSE' => 'Refusée',
            'STATUT_BANNI'  => 'Banni',
            default         => 'En attente'
        };

        $userData = [
            'id' => $user->getId(),
            'prenom' => $user->getPrenom(),
            'nom' => $user->getNom(),
            'email' => $user->getEmail(),
            'statut' => $statutUserReact,
        ];

        if ($pro) {
            $statutProNom = $pro->getStatut()->name;
            $statutProReact = match($statutProNom) {
                'STATUT_VALIDE' => 'Validée',
                'STATUT_REFUSE' => 'Refusée',
                'STATUT_BANNI'  => 'Banni',
                default         => 'En attente'
            };

            $adressePro = $pro->getAdresse();
            if ($adressePro) {
                $userData['ville'] = $adressePro->getVille();
                $userData['codePostal'] = (string) $adressePro->getCodePostal();
            }

            //INFO
            $laveriesData = [];
            foreach ($pro->getLaveries() as $laverie) {
                
                if ($laverie->getSupprimee_le() !== null) {
                    continue;
                }

                $couleur = match($laverie->getStatut()->name) {
                    'STATUT_VALIDEE' => 'Validé',
                    'STATUT_REFUSEE' => 'Refusé',
                    default          => 'En attente'
                };

                //SI ADRESSE COMPLETE
                $adresseLav = $laverie->getAdresse();
                $adresseComplete = 'Adresse non renseignée';
                
                if ($adresseLav) {
                    $adresseComplete = sprintf('%s, %s %s', $adresseLav->getAdresse(), $adresseLav->getCodePostal(), $adresseLav->getVille());
                }

                $image = null;
                $premierMediaAssoc = $laverie->getMedias()->first();
                if ($premierMediaAssoc && $premierMediaAssoc->getMedia()) {
                    $image = $premierMediaAssoc->getMedia()->getEmplacement();
                }

                $laveriesData[] = [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'statut' => $couleur,
                    'adresse' => $adresseComplete,
                    'distance' => null,
                    'image' => $image,
                    'imageAlt' => $image ? $laverie->getNomEtablissement() : null,
                ];
            }

            $userData['professionnel'] = [
                'id' => $pro->getId(),
                'siren' => (string) $pro->getSiren(),
                'statut' => $statutProReact,
                'laveries' => $laveriesData
            ];
        }

        return $this->json($userData);
    }

    #[Route('/api/admin/utilisateurs/{id}/statut', name: 'api_admin_utilisateur_statut', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatut(int $id, Request $request, UtilisateurRepository $utilisateurRepository, EntityManagerInterface $em, MailerInterface $mailer, LoggerInterface $logger): JsonResponse
    {
        $administrateur = $this->getUser();

        if (!$administrateur) {
            return $this->json(['message' => 'Action non autorisée. Aucun administrateur connecté.'], 403);
        }

        $user = $utilisateurRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? null;
        $motif = $data['commentaire'] ?? null;

        if (!in_array($action, ['accepter', 'refuser'])) {
            return $this->json(['message' => 'Action invalide'], 400);
        }

        if ($action === 'refuser' && empty(trim($motif))) {
            return $this->json(['message' => 'Un motif de refus est obligatoire.'], 400);
        }

        $pro = $user->getProfessionnel();

        if ($pro) {
            $historique = new ProfessionnelHistoriqueInteraction();
            $historique->setProfessionnel($pro);
        } else {
            $historique = new UtilisateurHistoriqueInteraction();
            $historique->setUtilisateur($user);
        }

        $historique->setAdministrateur($administrateur);
        $historique->setDate(new \DateTime());

        if ($action === 'accepter') {
            $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_VALIDE);
            if ($pro) {
                $pro->setStatut(\App\Enum\StatutProfessionnelEnum::STATUT_VALIDE);
                $pro->setDateValidation(new \DateTime());
            }
            $historique->setAction('Validation du compte');
            $historique->setMotifAction($motif ?: 'Compte vérifié et validé.');

            //ENVOIE DU MAIL EN CAS DE VALIDATION
            $frontendBaseUrl = $this->getParameter('app.frontend_url');
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Votre compte LaundryMap a été validé !')
                ->htmlTemplate('emails/validation_utilisateur.html.twig')
                ->context([
                    'user' => $user,
                    'motif' => $motif,
                    'loginUrl' => $frontendBaseUrl . '/connexion',
                ]);

            try {
                $mailer->send($email);
            } catch (\Throwable $e) {
                $logger->error('Echec envoi mail validation utilisateur', [
                    'utilisateurId' => $user->getId(),
                    'exception' => $e,
                ]);
            }
        } else {
            $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_REFUSE);
            if ($pro) {
                $pro->setStatut(\App\Enum\StatutProfessionnelEnum::STATUT_REFUSE);
            }
            $historique->setAction('Refus du compte');
            $historique->setMotifAction($motif ?: 'Compte refusé par l\'administration.');
            
            //ENVOIE DU MAIL EN CAS DE REFUS
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Information concernant votre compte LaundryMap')
                ->htmlTemplate('emails/refus_utilisateur.html.twig')
                ->context(['user' => $user, 'motif' => $motif]);

            try {
                $mailer->send($email);
            } catch (\Throwable $e) {
                $logger->error('Echec envoi mail refus utilisateur', [
                    'utilisateurId' => $user->getId(),
                    'exception' => $e,
                ]);
            }
        }

        $em->persist($historique);
        $em->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès']);
    }

    #[IsGranted('PUBLIC_ACCESS')]
    #[Route('/api/verify-email/{token}', name: 'api_verify_email', methods: ['GET'])]
    public function verifyUserEmail(string $token, EmailVerificationTokenRepository $tokenRepository, EntityManagerInterface $em): Response {
        $frontendBaseUrl = $this->getParameter('app.frontend_url');

        $verificationToken = $tokenRepository->findOneBy(['token' => $token]);

        if (!$verificationToken) {
            return $this->redirect($frontendBaseUrl . '/email-verifie?error=invalid_token');
        }

        if ($verificationToken->getVerifiedAt() !== null) {
            return $this->redirect($frontendBaseUrl . '/connexion?info=already_verified');
        }

        if ($verificationToken->getExpiresAt() < new \DateTimeImmutable()) {
            $user = $verificationToken->getUser();
            $email = $user ? $user->getEmail() : '';
            $em->remove($verificationToken);
            $em->flush();
            return $this->redirect($frontendBaseUrl . '/email-verifie?error=expired_token&email=' . urlencode($email));
        }

        $user = $verificationToken->getUser();
        if (!$user) {
            return $this->redirect($frontendBaseUrl . '/email-verifie?error=user_not_found');
        }

        $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_VALIDE);
        $verificationToken->setVerifiedAt(new \DateTimeImmutable());

        $em->flush();

        return $this->redirect($frontendBaseUrl . '/email-verifie?success=true');
    }

    #[IsGranted('PUBLIC_ACCESS')]
    #[Route('/api/resend-verification', name: 'api_resend_verification', methods: ['POST'])]
    public function resendVerificationEmail(Request $request, UtilisateurRepository $utilisateurRepository, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->json(['message' => 'L\'adresse e-mail est manquante.'], 400);
        }

        $user = $utilisateurRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Si un compte existe avec cette adresse, un nouveau lien a été envoyé.']);
        }

        if ($user->getStatut() === \App\Enum\StatutUtilisateurEnum::STATUT_VALIDE) {
            return $this->json(['message' => 'Ce compte est déjà validé. Vous pouvez vous connecter.'], 400);
        }

        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $expiresAt = new \DateTimeImmutable('+2 hours');

        $verificationToken = new \App\Entity\EmailVerificationToken();
        $verificationToken->setUser($user);
        $verificationToken->setToken($token);
        $verificationToken->setCreatedAt(new \DateTimeImmutable());
        $verificationToken->setExpiresAt($expiresAt);

        $em->persist($verificationToken);
        $em->flush();

        $verificationUrl = $this->generateUrl('api_verify_email', ['token' => $token], UrlGeneratorInterface::ABSOLUTE_URL);

        $emailMessage = (new TemplatedEmail())
            ->from($this->getParameter('mailer_from'))
            ->to($user->getEmail())
            ->subject('Nouveau lien de confirmation pour LaundryMap')
            ->htmlTemplate('emails/confirmation_email.html.twig')
            ->context([
                'user' => $user,
                'verificationUrl' => $verificationUrl,
                'expiresAt' => $expiresAt,
            ]);

        $mailer->send($emailMessage);

        return $this->json(['message' => 'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.']);
    }
}
