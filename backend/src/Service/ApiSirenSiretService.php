<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiSirenSiretService
{
    public function __construct(private HttpClientInterface $httpClient) {}

    public function verifySiren(string $siren): bool
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                "https://recherche-entreprises.api.gouv.fr/search?q={$siren}&page=1&per_page=1"
            );

            $data = $response->toArray();
            
            if (empty($data['results'])) {
                return false;
            }

            // Vérifie que le SIREN correspond exactement
            foreach ($data['results'] as $entreprise) {
                if ($entreprise['siren'] === $siren) {
                    return true;
                }
            }

            return false;

        } catch (\Exception $e) {
            dump($e->getMessage());
            return false;
        }
    }

    public function verifySiret(string $siret): bool
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                "https://recherche-entreprises.api.gouv.fr/search?q={$siret}&page=1&per_page=1"
            );

            $data = $response->toArray();

            if (empty($data['results'])) {
                return false;
            }

            // Vérifie que le SIRET correspond dans les établissements
            foreach ($data['results'] as $entreprise) {
                if (!empty($entreprise['matching_etablissements'])) {
                    foreach ($entreprise['matching_etablissements'] as $etablissement) {
                        if ($etablissement['siret'] === $siret) {
                            return true;
                        }
                    }
                }
            }

            return false;

        } catch (\Exception $e) {
            dump($e->getMessage());
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
                'type'   => 'SIREN',
                'siren'  => $sirenOuSiret,
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