<?php

namespace App\Controller\Api;

use App\DTO\LaverieRechercheResultat;
use App\Repository\LaverieRepository;
use App\Service\Professionnel\ProfessionnelLaverieFormatterService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ApiRechercheController extends AbstractController
{
    #[Route('/api/laveries/recherche', name: 'api_laveries_recherche', methods: ['GET'])]
    public function rechercher(
        Request $request,
        LaverieRepository $laverieRepo,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $lat = $request->query->get('lat');
        $lng = $request->query->get('lng');
        $geoOk = $lat !== null && $lng !== null && is_numeric($lat) && is_numeric($lng);

        $params = [
            'lat' => $geoOk ? (float) $lat : null,
            'lng' => $geoOk ? (float) $lng : null,
            'q' => trim((string) $request->query->get('q', '')),
            'rayon' => (int) $request->query->get('rayon', 10),
            'horaire' => trim((string) $request->query->get('horaire', '')),
            // IDs entiers — le frontend envoie serviceIds et paiementIds
            'serviceIds' => $this->csvToIntArray($request->query->get('serviceIds', '')),
            'paiementIds' => $this->csvToIntArray($request->query->get('paiementIds', '')),
        ];

        $resultats = $laverieRepo->findForPublicSearch($params);

        $payload = array_map(function (LaverieRechercheResultat $r) use ($formatter, $request) {
            $laverie = $r->laverie;
            $adresse = $laverie->getAdresse();
            $logo = $laverie->getLogo();
            $imageUrl = null;

            if ($logo && $formatter->isProjectManagedMediaPath($logo->getEmplacement())) {
                $imageUrl = $formatter->toPublicMediaUrl($logo->getEmplacement(), $request);
            }

            return [
                'id' => $laverie->getId(),
                'nom' => $laverie->getNomEtablissement(),
                'adresse' => $adresse?->getAdresse(),
                'ville' => $adresse?->getVille(),
                'codePostal' => $adresse?->getCodePostal(),
                'latitude' => $adresse?->getLatitude(),
                'longitude' => $adresse?->getLongitude(),
                'distance' => $r->distanceKm !== null ? round($r->distanceKm, 2) : null,
                'image' => $imageUrl,
                'estOuvert' => $r->estOuvert,
                'noteMoyenne' => $formatter->getLaverieNoteMoyenne($laverie),
                'commentairesCount' => $formatter->countLaverieCommentaires($laverie),
                'description' => $laverie->getDescription(),
            ];
        }, $resultats);

        return $this->json([
            'total' => count($payload),
            'laveries' => $payload,
            'meta' => [
                'geoFourni' => $geoOk,
                'rayon' => $geoOk ? $params['rayon'] : null,
                'recherche' => $params['q'] ?: null,
            ],
        ]);
    }

    #[Route('/api/laveries/geocode', name: 'api_laveries_geocode', methods: ['GET'])]
    public function geocode(Request $request): JsonResponse
    {
        $q = trim((string) $request->query->get('q', ''));
        if ($q === '') return $this->json(['erreur' => 'Paramètre q requis.'], 400);

        $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
            'q' => $q, 'format' => 'json', 'limit' => 5, 'countrycodes' => 'fr', 'addressdetails' => 1,
        ]);

        $ctx = stream_context_create(['http' => [
            'header' => "User-Agent: LaundryMap/1.0 (contact@ec2e.com)\r\n",
            'timeout' => 5, 'ignore_errors' => true,
        ]]);

        $raw = @file_get_contents($url, false, $ctx);
        if ($raw === false) return $this->json(['erreur' => 'Service de géocodage indisponible.'], 503);

        $data = json_decode($raw, true);
        if (!is_array($data)) return $this->json(['suggestions' => []]);

        return $this->json(['suggestions' => array_map(static fn ($item) => [
            'label'     => $item['display_name'],
            'latitude'  => (float) $item['lat'],
            'longitude' => (float) $item['lon'],
        ], $data)]);
    }

    private function csvToIntArray(string $csv): array
    {
        return array_values(array_filter(
            array_map('intval', explode(',', $csv)),
            static fn (int $id) => $id > 0
        ));
    }
}