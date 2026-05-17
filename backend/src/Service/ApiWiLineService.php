<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class ApiWiLineService
{
    // WILINE_SERVER=https://serveur-wiline
    // WILINE_USER=user_api
    public function __construct(
        private HttpClientInterface $httpClient,
        private string $wilineServer,
        private string $wilineUser,
    ) {}

    // 1 - Authentification 
    public function authenticate(string $apiKey): ?string
    {
        try {
            $response = $this->httpClient->request('POST', $this->wilineServer . '/auth', [
                'body' => [
                    'user'    => $this->wilineUser,
                    'api_key' => $apiKey,
                ],
            ]);

            $data = $response->toArray(false);

            if (!empty($data['status']) && !empty($data['token'])) {
                return $data['token'];
            }

            return null;
        } catch (TransportExceptionInterface $e) {
            return null;
        }
    }

    // 2 - Liste des centrales du compte

    /**
     * Retourne la liste des centrales associées au compte WI-LINE.
     * Format : [['id' => 1, 'name' => '...', 'serial' => '...', 'link' => '...'], ...]
     */
    public function getCentrales(string $token): array
    {
        try {
            $response = $this->httpClient->request('GET', $this->wilineServer . '/laundry_map/centrales', [
                'auth_bearer' => $token,
            ]);

            return $response->toArray(false) ?? [];
        } catch (TransportExceptionInterface $e) {
            return [];
        }
    }

    // 3 -  Détails d'une centrale + ses machines

     /**
     * Retourne les détails d'une centrale, incluant la liste de ses machines.
     * Format : ['id' => 1, 'name' => '...', 'serial' => '...', 'machines' => [...]]
     */
    public function getCentraleDetails(string $token, string $serial): ?array
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                $this->wilineServer . '/laundry_map/centrales/' . $serial,
                ['auth_bearer' => $token]
            );

            return $response->toArray(false);
        } catch (TransportExceptionInterface $e) {
            return null;
        }
    }

    // 4 - Méthode principale : auth + récupération des machines

    /**
     * À partir du code client (api_key), retourne toutes les centrales
     * avec leurs machines, prêtes à être affichées dans le formulaire.
     *
     * Retourne null si le code client est invalide.
     */
    public function getMachinesParCodeClient(string $apiKey): ?array
    {
        $token = $this->authenticate($apiKey);

        if ($token === null) {
            return null;
        }

        $centrales = $this->getCentrales($token);

        $result = [];

        foreach ($centrales as $centrale) {
            $serial = $centrale['serial'] ?? null;
            $details = $serial ? $this->getCentraleDetails($token, $serial) : null;

            $machines = [];

            if ($details && isset($details['machines'])) {
                foreach ($details['machines'] as $machine) {
                    // On ne garde que les machines de catégorie WASH (1) et DRY (2)
                    if (!in_array($machine['category'] ?? 0, [1, 2])) {
                        continue;
                    }

                    $machines[] = [
                        'wiline_machine_id' => $machine['machine_id'],
                        'machine_number' => $machine['machine_number'],
                        'nom' => $machine['name'] ?: $machine['type_name'],
                        'type_name' => $machine['type_name'],
                        'type' => $machine['category'] === 1 ? 'lave-linge' : 'sèche-linge',
                        'capacite' => $this->extraireCapacite($machine['type_name']),
                        'tarif' => round($machine['price'] / 100, 2),
                        'duree' => $machine['duration'] > 0 ? intdiv($machine['duration'], 60) : 0,
                        'hors_service' => $machine['out_of_order'] ?? false,
                    ];
                }
            }

            $result[] = [
                'id' => $centrale['id'],
                'nom' => $centrale['name'],
                'serial' => $serial,
                'machines' => $machines,
            ];
        }

        return $result;
    }

    // ── Utilitaires ──────────────────────────────────────────────────────────

    /**
     * Extrait la capacité en kg depuis un type_name comme "Machine 16kg" ou "Sechoir 8kg".
     */
    private function extraireCapacite(string $typeName): int
    {
        preg_match('/(\d+)\s*kg/i', $typeName, $matches);
        return isset($matches[1]) ? (int) $matches[1] : 0;
    }
}