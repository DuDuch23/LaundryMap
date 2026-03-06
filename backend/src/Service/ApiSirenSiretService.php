<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiSirenSiretService
{
    public function __construct(private HttpClientInterface $httpClient, private string $inseeToken)
    {
        $this->inseeToken = $inseeToken;
        $this->httpClient = $httpClient;
    }

    public function verifySiren(string $siren): bool
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                "https://api.insee.fr/entreprises/sirene/V3.11/siren/{$siren}",
                [
                    'headers' => [
                        'Authorization' => "Bearer {$this->inseeToken}",
                        'Accept' => 'application/json',
                    ]
                ]
            );

            $statusCode = $response->getStatusCode();
            $content = $response->getContent(false);

            // Log temporaire pour débuguer
            dump($statusCode, $content);

            return $statusCode === 200;

        } catch (\Exception $e) {
            dump($e->getMessage()); // Log l'erreur
            return false;
        }
    }

    public function verifySiret(string $siret): bool
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                "https://api.insee.fr/entreprises/sirene/V3.11/siret/{$siret}",
                [
                    'headers' => [
                        'Authorization' => "Bearer {$this->inseeToken}",
                        'Accept' => 'application/json',
                    ]
                ]
            );

            $statusCode = $response->getStatusCode();
            $content = $response->getContent(false);

            // Log temporaire pour débuguer
            dump($statusCode, $content);

            return $statusCode === 200;

        }catch(\Exception $e) {
            dump($e->getMessage()); // Log l'erreur
            return false;
        }
    }

    public function verify(string $sirenOuSiret): array
    {
        $longueur = strlen($sirenOuSiret);

        if ($longueur === 9) {
            $existe = $this->verifySiren($sirenOuSiret);
            return [
                'valide' => $existe,
                'type' => 'SIREN',
                'siren' => $sirenOuSiret,
            ];
        }

        if ($longueur === 14) {
            $existe = $this->verifySiret($sirenOuSiret);
            return [
                'valide' => $existe,
                'type'   => 'SIRET',
                'siren'  => substr($sirenOuSiret, 0, 9),
            ];
        }

        return [
            'valide' => false,
            'type'   => null,
            'siren'  => null,
        ];
    }
}