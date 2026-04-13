<?php

namespace App\Controller\Api\Professionnel;

use App\Controller\Api\ApiProfilController;
use App\Repository\LaverieRepository;
use App\Repository\ProfessionnelRepository;
use App\Service\Professionnel\ProfessionnelLaverieFormatterService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiProfessionnelController extends ApiProfilController
{
    #[Route('/api/professionnel/tableau-bord', name: 'api_tableau_bord_pro', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function tableauBordProfessionnel(
        Request $request,
        ProfessionnelRepository $professionnelRepository,
        LaverieRepository $laverieRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $professionnel = $this->getValidatedProfessionnel($professionnelRepository);

        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $laveries = $laverieRepository->findByProfessionnel($professionnel);
        $stats = $laverieRepository->countByProfessionnelAndStatut($professionnel);

        return $this->json([
            'professionnel' => [
                'id' => $professionnel->getId(),
                'prenom' => $professionnel->getUtilisateur()->getPrenom(),
                'nom' => $professionnel->getUtilisateur()->getNom(),
                'email' => $professionnel->getUtilisateur()->getEmail(),
                'siren' => $professionnel->getSiren(),
                'photoProfil' => ($professionnel->getPhotoProfil() && $formatter->isProjectManagedMediaPath($professionnel->getPhotoProfil()->getEmplacement()))
                    ? $formatter->toPublicMediaUrl($professionnel->getPhotoProfil()->getEmplacement(), $request)
                    : null,
            ],
            'stats' => $stats,
            'laveries' => array_map(function ($laverie) use ($request, $formatter) {
                $logo = $laverie->getLogo();
                $logoEmplacement = ($logo && $formatter->isProjectManagedMediaPath($logo->getEmplacement()))
                    ? $formatter->toPublicMediaUrl($logo->getEmplacement(), $request)
                    : null;
                $gallery = $formatter->buildGalleryResponse($laverie, $request);
                $primaryImage = $gallery[0]['image'] ?? $logoEmplacement;

                return [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'adresse' => $laverie->getAdresse()->getAdresse(),
                    'codePostal' => $laverie->getAdresse()->getCodePostal(),
                    'ville' => $laverie->getAdresse()->getVille(),
                    'statut' => $laverie->getStatut()->value,
                    'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                    'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                    'image' => $primaryImage,
                    'imageAlt' => $primaryImage ? $laverie->getNomEtablissement() : null,
                    'images' => $gallery,
                    'commentairesCount' => $formatter->countLaverieCommentaires($laverie),
                    'noteMoyenne' => $formatter->getLaverieNoteMoyenne($laverie),
                    'logo' => $logoEmplacement ? [
                        'id' => $logo->getId(),
                        'image' => $logoEmplacement,
                        'alt' => $laverie->getNomEtablissement(),
                    ] : null,
                ];
            }, $laveries),
        ], 200);
    }
}
