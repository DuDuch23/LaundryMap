<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiGoogleOAuthController extends AbstractController
{
    private const FRONTEND_SUCCESS_PATH = '/profil';
    private const FRONTEND_ERROR_PATH = '/connexion';
    private const ALLOWED_REDIRECT_SCHEMES = ['https', 'http'];
    private const OAUTH_STATE_COOKIE = 'google_oauth_state';
    private const OAUTH_STATE_TTL_SECONDS = 600;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly JWTTokenManagerInterface $jwtTokenManager,
        #[Autowire('%env(string:GOOGLE_CLIENT_ID)%')]
        private readonly string $googleClientId,
        #[Autowire('%env(string:GOOGLE_CLIENT_SECRET)%')]
        private readonly string $googleClientSecret,
        #[Autowire('%env(string:GOOGLE_REDIRECT_URI)%')]
        private readonly string $googleRedirectUri,
        #[Autowire('%env(string:FRONTEND_SSO_SUCCESS_URL)%')]
        private readonly string $frontendSsoSuccessUrl,
        #[Autowire('%env(string:FRONTEND_SSO_ERROR_URL)%')]
        private readonly string $frontendSsoErrorUrl,
        #[Autowire('%kernel.environment%')]
        private readonly string $appEnv
    ) {
    }

    #[Route('/api/oauth/google/redirect', name: 'api_google_oauth_redirect', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $clientId = $this->normalizeConfigValue($this->googleClientId);
        $redirectUri = $this->normalizeConfigValue($this->googleRedirectUri);

        if (!$clientId || !$redirectUri) {
            return $this->redirect($this->buildFrontendErrorUrl('configuration_manquante', $request));
        }

        $state = $this->generateOauthState();

        $queryParams = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        $response = $this->redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $queryParams);
        $response->headers->setCookie($this->createOauthStateCookie($state, $request));

        return $response;
    }

    #[Route('/api/oauth/google/callback', name: 'api_google_oauth_callback', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function callback(Request $request): RedirectResponse|JsonResponse
    {
        $requestState = $request->query->get('state');
        $cookieState = $request->cookies->get(self::OAUTH_STATE_COOKIE);

        if (!is_string($requestState) || !is_string($cookieState) || !hash_equals($cookieState, $requestState)) {
            return $this->redirectWithClearedOauthState(
                $this->buildFrontendErrorUrl('etat_oauth_invalide', $request),
                $request
            );
        }

        $authorizationCode = $request->query->get('code');

        if (!$authorizationCode) {
            return $this->redirectWithClearedOauthState(
                $this->buildFrontendErrorUrl('code_google_absent', $request),
                $request
            );
        }

        $clientId = $this->normalizeConfigValue($this->googleClientId);
        $clientSecret = $this->normalizeConfigValue($this->googleClientSecret);
        $redirectUri = $this->normalizeConfigValue($this->googleRedirectUri);

        if (!$clientId || !$clientSecret || !$redirectUri) {
            return $this->redirectWithClearedOauthState(
                $this->buildFrontendErrorUrl('configuration_manquante', $request),
                $request
            );
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
                return $this->redirectWithClearedOauthState(
                    $this->buildFrontendErrorUrl('jeton_google_invalide', $request),
                    $request
                );
            }

            $userInfoResponse = $httpClient->request('GET', 'https://openidconnect.googleapis.com/v1/userinfo', [
                'headers' => [
                    'Authorization' => sprintf('Bearer %s', $accessToken),
                ],
            ]);

            $userInfo = $userInfoResponse->toArray(false);
            $email = $userInfo['email'] ?? null;
            $googleUserId = $userInfo['sub'] ?? null;
            $emailVerified = filter_var($userInfo['email_verified'] ?? false, FILTER_VALIDATE_BOOL);

            if (!$email || !$googleUserId || !$emailVerified) {
                return $this->redirectWithClearedOauthState(
                    $this->buildFrontendErrorUrl('profil_google_invalide', $request),
                    $request
                );
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
                $statut = $utilisateur->getStatut();

                if (in_array($statut, [
                    StatutUtilisateurEnum::STATUT_REFUSE,
                    StatutUtilisateurEnum::STATUT_BANNI,
                    StatutUtilisateurEnum::STATUT_SUPPRIME,
                ], true)) {
                    return $this->redirectWithClearedOauthState(
                        $this->buildFrontendErrorUrl('compte_non_valide', $request),
                        $request
                    );
                }

                // Compte créé classiquement mais email non vérifié : Google ayant
                // confirmé la propriété de l'adresse, on valide le compte et on
                // lie l'identifiant Google pour permettre la connexion SSO.
                if ($statut === StatutUtilisateurEnum::STATUT_EN_ATTENTE) {
                    $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_VALIDE);
                }

                if (!$utilisateur->getOauthId()) {
                    $utilisateur->setOauthId('google:' . $googleUserId);
                }
                $utilisateur->setDateDerniereConnexion(new \DateTime());
            }

            $this->entityManager->flush();

            $jwt = $this->jwtTokenManager->create($utilisateur);

            return $this->redirectWithClearedOauthState(
                $this->buildFrontendSuccessUrl($jwt, $request),
                $request
            );
        } catch (\Throwable) {
            return $this->redirectWithClearedOauthState(
                $this->buildFrontendErrorUrl('echec_authentification_google', $request),
                $request
            );
        }
    }

    private function buildFrontendSuccessUrl(string $jwt, Request $request): string
    {
        $baseUrl = $this->resolveAndValidateFrontendUrl(
            $this->normalizeConfigValue($this->frontendSsoSuccessUrl),
            $this->buildDefaultFrontendUrl(self::FRONTEND_SUCCESS_PATH, $request),
            $request
        );
        $baseUrl = strtok($baseUrl, '#') ?: $baseUrl;
        $fragment = http_build_query(['token' => $jwt]);

        return sprintf('%s#%s', $baseUrl, $fragment);
    }

    private function buildFrontendErrorUrl(string $error, Request $request): string
    {
        $baseUrl = $this->resolveAndValidateFrontendUrl(
            $this->normalizeConfigValue($this->frontendSsoErrorUrl),
            $this->buildDefaultFrontendUrl(self::FRONTEND_ERROR_PATH, $request),
            $request
        );
        $baseUrl = strtok($baseUrl, '#') ?: $baseUrl;
        $fragment = http_build_query(['error' => $error]);

        return sprintf('%s#%s', $baseUrl, $fragment);
    }

    private function resolveAndValidateFrontendUrl(?string $url, string $fallbackUrl, Request $request): string
    {
        if ($url && $this->isTrustedRedirectUrl($url, $request)) {
            return $url;
        }

        if ($this->isTrustedRedirectUrl($fallbackUrl, $request)) {
            return $fallbackUrl;
        }

        return $this->buildDefaultFrontendUrl(self::FRONTEND_ERROR_PATH, $request);
    }

    private function buildDefaultFrontendUrl(string $path, Request $request): string
    {
        $normalizedPath = str_starts_with($path, '/') ? $path : '/' . $path;

        $configuredFrontendOrigin = $this->resolveConfiguredFrontendOrigin();
        if ($configuredFrontendOrigin !== null) {
            return $configuredFrontendOrigin . $normalizedPath;
        }

        return $request->getSchemeAndHttpHost() . $normalizedPath;
    }

    private function isTrustedRedirectUrl(string $url, Request $request): bool
    {
        $parts = parse_url($url);

        if ($parts === false || !isset($parts['scheme'], $parts['host'])) {
            return false;
        }

        $scheme = strtolower((string) $parts['scheme']);
        $host = strtolower((string) $parts['host']);

        if (!in_array($scheme, self::ALLOWED_REDIRECT_SCHEMES, true)) {
            return false;
        }

        if (!$this->isDevOrTestEnvironment() && $scheme !== 'https') {
            return false;
        }

        $origin = $this->buildOriginFromParts($parts);
        if ($origin === null) {
            return false;
        }

        $allowedOrigins = $this->resolveAllowedRedirectOrigins($request);

        return in_array($origin, $allowedOrigins, true);
    }

    private function resolveConfiguredFrontendOrigin(): ?string
    {
        $configuredOrigins = $this->resolveConfiguredFrontendOrigins();

        return $configuredOrigins[0] ?? null;
    }

    private function resolveConfiguredFrontendOrigins(): array
    {
        $origins = [];

        foreach ([$this->frontendSsoSuccessUrl, $this->frontendSsoErrorUrl] as $configuredUrl) {
            $normalizedUrl = $this->normalizeConfigValue($configuredUrl);

            if ($normalizedUrl === null) {
                continue;
            }

            $parts = parse_url($normalizedUrl);
            if ($parts === false || !isset($parts['scheme'], $parts['host'])) {
                continue;
            }

            $scheme = strtolower((string) $parts['scheme']);
            if (!in_array($scheme, self::ALLOWED_REDIRECT_SCHEMES, true)) {
                continue;
            }

            $origin = $this->buildOriginFromParts($parts);
            if ($origin !== null) {
                $origins[] = $origin;
            }
        }

        return array_values(array_unique($origins));
    }

    private function resolveAllowedRedirectOrigins(Request $request): array
    {
        $allowedOrigins = array_merge(
            [$request->getSchemeAndHttpHost()],
            $this->resolveConfiguredFrontendOrigins()
        );

        return array_values(array_unique($allowedOrigins));
    }

    private function buildOriginFromParts(array $parts): ?string
    {
        if (!isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $scheme = strtolower((string) $parts['scheme']);
        $host = strtolower((string) $parts['host']);
        $port = isset($parts['port']) ? ':' . (int) $parts['port'] : '';

        return sprintf('%s://%s%s', $scheme, $host, $port);
    }

    private function isDevOrTestEnvironment(): bool
    {
        $currentEnv = strtolower(trim($this->appEnv));

        return in_array($currentEnv, ['dev', 'test'], true);
    }

    private function normalizeConfigValue(string $value): ?string
    {
        $trimmedValue = trim($value);

        return $trimmedValue !== '' ? $trimmedValue : null;
    }

    private function generateOauthState(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    private function createOauthStateCookie(string $state, Request $request): Cookie
    {
        $isSecure = $request->isSecure();

        return Cookie::create(
            self::OAUTH_STATE_COOKIE,
            $state,
            time() + self::OAUTH_STATE_TTL_SECONDS,
            '/api/oauth/google',
            null,
            $isSecure,
            true,
            false,
            Cookie::SAMESITE_LAX
        );
    }

    private function createClearedOauthStateCookie(Request $request): Cookie
    {
        $isSecure = $request->isSecure();

        return Cookie::create(
            self::OAUTH_STATE_COOKIE,
            '',
            1,
            '/api/oauth/google',
            null,
            $isSecure,
            true,
            false,
            Cookie::SAMESITE_LAX
        );
    }

    private function redirectWithClearedOauthState(string $url, Request $request): RedirectResponse
    {
        $response = $this->redirect($url);
        $response->headers->setCookie($this->createClearedOauthStateCookie($request));

        return $response;
    }
}