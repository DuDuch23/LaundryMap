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
use Exception;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\MailerException\TransportExceptionInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;
use Throwable;

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

        $banniJusquA = $user->getBanniJusquA();
        $estBanni = $user->getStatut() === \App\Enum\StatutUtilisateurEnum::STATUT_BANNI;

        $userData = [
            'id' => $user->getId(),
            'prenom' => $user->getPrenom(),
            'nom' => $user->getNom(),
            'email' => $user->getEmail(),
            'statut' => $statutUserReact,
            'estBanni' => $estBanni,
            'banniJusquA' => $banniJusquA?->format('c'),
            'banniMotif' => $user->getBanniMotif(),
            'estBanniDefinitif' => $estBanni && $banniJusquA === null,
            'estBanniTemporaire' => $estBanni && $banniJusquA !== null,
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
                    'STATUT_VALIDEE' => 'Validée',
                    'STATUT_REFUSEE' => 'Refusée',
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
            $frontendBaseUrl = rtrim($this->getParameter('app.frontend_url'), '/');
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
            } catch (Throwable $e) {
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
            } catch (Throwable $e) {
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
        $frontendBaseUrl = rtrim($this->getParameter('app.frontend_url'), '/');

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

        $isPro = $user->getProfessionnel() !== null;
        $successUrl = $frontendBaseUrl . '/email-verifie?success=true' . ($isPro ? '&pro=1' : '');

        return $this->redirect($successUrl);
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
                'isPro' => $user->getProfessionnel() !== null,
            ]);

        $mailer->send($emailMessage);

        return $this->json(['message' => 'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.']);
    }

    #[Route('/api/admin/utilisateurs/{id}/blocage', name: 'api_admin_utilisateur_bloquer', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function bloquerUtilisateur(
        int $id,
        Request $request,
        UtilisateurRepository $utilisateurRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer,
        LoggerInterface $logger
    ): JsonResponse {
        $administrateur = $this->getUser();
        if (!$administrateur) {
            return $this->json(['message' => 'Action non autorisée.'], 403);
        }

        $user = $utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        // Refus : bloquer un pro ou un compte supprimé
        if ($user->getProfessionnel() !== null) {
            return $this->json(['message' => 'Les comptes professionnels ne peuvent pas être bloqués via cette fonctionnalité.'], 400);
        }
        if ($user->getStatut() === \App\Enum\StatutUtilisateurEnum::STATUT_SUPPRIME) {
            return $this->json(['message' => 'Ce compte a été supprimé et ne peut plus être bloqué.'], 400);
        }
        if ($user->getStatut() === \App\Enum\StatutUtilisateurEnum::STATUT_BANNI) {
            return $this->json(['message' => 'Cet utilisateur est déjà bloqué.'], 409);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $duree = $data['duree'] ?? null;       // 'temporaire' | 'definitif'
        $dateFinRaw = $data['dateFin'] ?? null;
        $motif = isset($data['motif']) ? trim((string) $data['motif']) : '';

        if (!in_array($duree, ['temporaire', 'definitif'], true)) {
            return $this->json(['message' => 'La durée doit être "temporaire" ou "definitif".'], 400);
        }
        if ($motif === '') {
            return $this->json(['message' => 'Le motif est obligatoire.'], 400);
        }
        if (mb_strlen($motif) > 255) {
            return $this->json(['message' => 'Le motif est trop long (255 caractères maximum).'], 400);
        }

        $banniJusquA = null;
        if ($duree === 'temporaire') {
            if (!$dateFinRaw) {
                return $this->json(['message' => 'La date de fin est obligatoire pour un blocage temporaire.'], 400);
            }
            try {
                $banniJusquA = (new \DateTime((string) $dateFinRaw))->setTime(23, 59, 59);
            } catch (Exception) {
                return $this->json(['message' => 'Date de fin invalide.'], 400);
            }
            if ($banniJusquA <= new \DateTime()) {
                return $this->json(['message' => 'La date de fin doit être postérieure à aujourd\'hui.'], 400);
            }
        }

        $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_BANNI);
        $user->setBanniJusquA($banniJusquA);
        $user->setBanniMotif($motif);

        $historique = new UtilisateurHistoriqueInteraction();
        $historique->setUtilisateur($user);
        $historique->setAdministrateur($administrateur);
        $historique->setDate(new \DateTime());
        $historique->setAction($duree === 'temporaire' ? 'Blocage temporaire' : 'Blocage définitif');
        $historique->setMotifAction($motif);

        $em->persist($historique);
        $em->flush();

        // Email de notification
        try {
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Votre compte LaundryMap a été bloqué')
                ->htmlTemplate('emails/blocage_utilisateur.html.twig')
                ->context([
                    'user' => $user,
                    'motif' => $motif,
                    'banniJusquA' => $banniJusquA,
                    'estDefinitif' => $banniJusquA === null,
                ]);
            $mailer->send($email);
        } catch (Throwable $e) {
            $logger->error('Echec envoi mail blocage utilisateur', [
                'utilisateurId' => $user->getId(),
                'exception' => $e,
            ]);
        }

        return $this->json([
            'message' => 'Utilisateur bloqué avec succès.',
            'banniJusquA' => $banniJusquA?->format('c'),
            'banniMotif' => $motif,
        ]);
    }

    #[Route('/api/admin/utilisateurs/{id}/blocage', name: 'api_admin_utilisateur_debloquer', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function debloquerUtilisateur(
        int $id,
        UtilisateurRepository $utilisateurRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer,
        LoggerInterface $logger
    ): JsonResponse {
        $administrateur = $this->getUser();
        if (!$administrateur) {
            return $this->json(['message' => 'Action non autorisée.'], 403);
        }

        $user = $utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }
        if ($user->getStatut() !== \App\Enum\StatutUtilisateurEnum::STATUT_BANNI) {
            return $this->json(['message' => 'Cet utilisateur n\'est pas bloqué.'], 400);
        }

        $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_VALIDE);
        $user->setBanniJusquA(null);
        $user->setBanniMotif(null);

        $historique = new UtilisateurHistoriqueInteraction();
        $historique->setUtilisateur($user);
        $historique->setAdministrateur($administrateur);
        $historique->setDate(new \DateTime());
        $historique->setAction('Déblocage');
        $historique->setMotifAction('Compte débloqué par un administrateur.');

        $em->persist($historique);
        $em->flush();

        try {
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Votre compte LaundryMap a été débloqué')
                ->htmlTemplate('emails/deblocage_utilisateur.html.twig')
                ->context([
                    'user' => $user,
                    'loginUrl' => rtrim($this->getParameter('app.frontend_url'), '/') . '/connexion',
                ]);
            $mailer->send($email);
        } catch (Throwable $e) {
            $logger->error('Echec envoi mail déblocage utilisateur', [
                'utilisateurId' => $user->getId(),
                'exception' => $e,
            ]);
        }

        return $this->json(['message' => 'Utilisateur débloqué avec succès.']);
    }
}
