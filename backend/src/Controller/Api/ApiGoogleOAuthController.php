<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiGoogleOAuthController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly JWTTokenManagerInterface $jwtTokenManager
    ) {
    }

    #[Route('/api/oauth/google/redirect', name: 'api_google_oauth_redirect', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function redirectToGoogle(): RedirectResponse
    {
        $clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? null;
        $redirectUri = $_ENV['GOOGLE_REDIRECT_URI'] ?? null;

        if (!$clientId || !$redirectUri) {
            return $this->redirect($this->buildFrontendErrorUrl('configuration_manquante'));
        }

        $queryParams = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return $this->redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $queryParams);
    }

    #[Route('/api/oauth/google/callback', name: 'api_google_oauth_callback', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function callback(Request $request): RedirectResponse|JsonResponse
    {
        $authorizationCode = $request->query->get('code');

        if (!$authorizationCode) {
            return $this->redirect($this->buildFrontendErrorUrl('code_google_absent'));
        }

        $clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? null;
        $clientSecret = $_ENV['GOOGLE_CLIENT_SECRET'] ?? null;
        $redirectUri = $_ENV['GOOGLE_REDIRECT_URI'] ?? null;

        if (!$clientId || !$clientSecret || !$redirectUri) {
            return $this->redirect($this->buildFrontendErrorUrl('configuration_manquante'));
        }

        try {
            $httpClient = HttpClient::create();

            $tokenResponse = $httpClient->request('POST', 'https://oauth2.googleapis.com/token', [
                'body' => [
                    'code' => $authorizationCode,
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirectUri,
                    'grant_type' => 'authorization_code',
                ],
            ]);

            $tokenData = $tokenResponse->toArray(false);
            $accessToken = $tokenData['access_token'] ?? null;

            if (!$accessToken) {
                return $this->redirect($this->buildFrontendErrorUrl('jeton_google_invalide'));
            }

            $userInfoResponse = $httpClient->request('GET', 'https://openidconnect.googleapis.com/v1/userinfo', [
                'headers' => [
                    'Authorization' => sprintf('Bearer %s', $accessToken),
                ],
            ]);

            $userInfo = $userInfoResponse->toArray(false);
            $email = $userInfo['email'] ?? null;
            $googleUserId = $userInfo['sub'] ?? null;

            if (!$email || !$googleUserId) {
                return $this->redirect($this->buildFrontendErrorUrl('profil_google_invalide'));
            }

            $utilisateurRepository = $this->entityManager->getRepository(Utilisateur::class);
            $utilisateur = $utilisateurRepository->findOneBy(['email' => $email]);

            if (!$utilisateur) {
                $utilisateur = new Utilisateur();
                $utilisateur
                    ->setEmail($email)
                    ->setPrenom($userInfo['given_name'] ?? null)
                    ->setNom($userInfo['family_name'] ?? null)
                    ->setStatut(StatutUtilisateurEnum::STATUT_VALIDE)
                    ->setOauthId('google:' . $googleUserId)
                    ->setDateDerniereConnexion(new \DateTime());

                $this->entityManager->persist($utilisateur);
            } else {
                if (!$utilisateur->getOauthId()) {
                    $utilisateur->setOauthId('google:' . $googleUserId);
                }
                $utilisateur->setDateDerniereConnexion(new \DateTime());
            }

            $this->entityManager->flush();

            $jwt = $this->jwtTokenManager->create($utilisateur);

            return $this->redirect($this->buildFrontendSuccessUrl($jwt));
        } catch (\Throwable) {
            return $this->redirect($this->buildFrontendErrorUrl('echec_authentification_google'));
        }
    }

    private function buildFrontendSuccessUrl(string $jwt): string
    {
        $baseUrl = $_ENV['FRONTEND_SSO_SUCCESS_URL'] ?? 'http://localhost:5173/connexion';
        $separator = str_contains($baseUrl, '?') ? '&' : '?';

        return sprintf('%s%stoken=%s', $baseUrl, $separator, urlencode($jwt));
    }

    private function buildFrontendErrorUrl(string $error): string
    {
        $baseUrl = $_ENV['FRONTEND_SSO_ERROR_URL'] ?? 'http://localhost:5173/connexion';
        $separator = str_contains($baseUrl, '?') ? '&' : '?';

        return sprintf('%s%serror=%s', $baseUrl, $separator, urlencode($error));
    }
}