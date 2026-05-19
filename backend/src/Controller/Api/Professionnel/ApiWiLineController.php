<?php

namespace App\Controller\Api\Professionnel;

use App\Service\ApiWiLineService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PROFESSIONNEL')]
class ApiWiLineController extends AbstractController
{
    #[Route('/api/professionnel/wiline/centrale/{serial}', name: 'api_professionnel_wiline_centrale', methods: ['GET'])]
    public function getCentrale(string $serial, ApiWiLineService $wiLineService): JsonResponse
    {
        if (!preg_match('/^[A-Fa-f0-9]{16}$/', $serial)) {
            return $this->json(['message' => 'Numéro de série invalide.'], 400);
        }

        $centrale = $wiLineService->getCentraleBySerial($serial);

        if ($centrale === null) {
            return $this->json(['message' => 'Centrale introuvable ou service Wi-Line indisponible.'], 404);
        }

        return $this->json($centrale);
    }
}
