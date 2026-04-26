<?php

namespace App\Controller\Api;

use App\Repository\MethodePaiementRepository;
use App\Repository\ServiceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints publics pour les référentiels administrés en base.
 * Aucune authentification requise (CDC F-01 : utilisable sans compte).
 */
class ApiReferentielController extends AbstractController
{
    /**
     * GET /api/services
     * Retourne la liste de tous les services disponibles.
     */
    #[Route('/api/services', name: 'api_services_liste', methods: ['GET'])]
    public function services(ServiceRepository $repo): JsonResponse
    {
        $services = $repo->findBy([], ['nom' => 'ASC']);

        return $this->json([
            'services' => array_map(
                static fn ($s) => ['id' => $s->getId(), 'nom' => $s->getNom()],
                $services
            ),
        ]);
    }

    /**
     * GET /api/methodes-paiement
     * Retourne la liste de toutes les méthodes de paiement disponibles.
     */
    #[Route('/api/methodes-paiement', name: 'api_methodes_paiement_liste', methods: ['GET'])]
    public function methodesPaiement(MethodePaiementRepository $repo): JsonResponse
    {
        $methodes = $repo->findBy([], ['nom' => 'ASC']);

        return $this->json([
            'methodes' => array_map(
                static fn ($m) => ['id' => $m->getId(), 'nom' => $m->getNom()],
                $methodes
            ),
        ]);
    }
}
