<?php

namespace App\Controller\Api;

use App\Entity\Laverie;
use App\Entity\LaverieMedia;
use App\Entity\Media;
use App\Entity\Utilisateur;
use App\Service\MediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiMediaController extends AbstractController
{
    private const MAX_PHOTOS = 15;

    public function __construct(
        private readonly MediaService $mediaService,
        // Gardés pour la compatibilité de configuration Symfony (services.yaml)
        private readonly string $uploadsDirectory,
        private readonly string $uploadsPublicPath,
    ) {}

    #[Route('/api/laveries/{id}/logo', name: 'api_laverie_logo', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadLogo(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        $file = $request->files->get('logo');
        if (!$file) {
            return $this->json(['message' => 'Aucun fichier reçu.'], 400);
        }

        $erreur = $this->mediaService->validerFichier($file);
        if ($erreur) return $this->json(['message' => $erreur], 400);

        if ($laverie->getLogo()) {
            $ancienMedia = $laverie->getLogo();
            $laverie->setLogo(null);
            $this->mediaService->supprimerFichier($ancienMedia->getEmplacement());
            $em->remove($ancienMedia);
        }

        $media = $this->mediaService->creerMedia($file);
        $laverie->setLogo($media);
        $laverie->setDateModification(new \DateTime());
        $em->flush();

        return $this->json(['message' => 'Logo mis à jour.', 'logo' => $this->serializeMedia($media)]);
    }

    #[Route('/api/laveries/{id}/logo', name: 'api_laverie_logo_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deleteLogo(int $id, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        if (!$laverie->getLogo()) {
            return $this->json(['message' => 'Aucun logo à supprimer.'], 404);
        }

        $media = $laverie->getLogo();
        $laverie->setLogo(null);
        $this->mediaService->supprimerFichier($media->getEmplacement());
        $em->remove($media);
        $em->flush();

        return $this->json(['message' => 'Logo supprimé.']);
    }

    #[Route('/api/laveries/{id}/photos', name: 'api_laverie_photos', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadPhoto(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        $file = $request->files->get('photo');
        if (!$file) {
            return $this->json(['message' => 'Aucun fichier reçu.'], 400);
        }

        if ($laverie->getMedias()->count() >= self::MAX_PHOTOS) {
            return $this->json(['message' => 'Limite de ' . self::MAX_PHOTOS . ' photos atteinte.'], 400);
        }

        $erreur = $this->mediaService->validerFichier($file);
        if ($erreur) return $this->json(['message' => $erreur], 400);

        $media = $this->mediaService->creerMedia($file);

        $laverieMedia = new LaverieMedia();
        $laverieMedia->setLaverie($laverie);
        $laverieMedia->setMedia($media);
        $laverieMedia->setDescription($request->request->get('description', ''));
        $em->persist($laverieMedia);

        $laverie->setDateModification(new \DateTime());
        $em->flush();

        return $this->json(['message' => 'Photo ajoutée.', 'photo' => $this->serializeMedia($media)], 201);
    }

    #[Route('/api/laveries/{id}/photos/{mediaId}', name: 'api_laverie_photo_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deletePhoto(int $id, int $mediaId, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        $laverieMedia = $em->getRepository(LaverieMedia::class)->findOneBy([
            'laverie' => $laverie,
            'media'   => $mediaId,
        ]);

        if (!$laverieMedia) {
            return $this->json(['message' => 'Photo introuvable.'], 404);
        }

        $media = $laverieMedia->getMedia();
        $em->remove($laverieMedia);

        if ($media) {
            $this->mediaService->supprimerFichier($media->getEmplacement());
            $em->remove($media);
        }

        $em->flush();

        return $this->json(['message' => 'Photo supprimée.']);
    }

    private function getLaverieOwnee(int $id, EntityManagerInterface $em): Laverie|JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Non authentifié.'], 401);
        }

        $laverie = $em->getRepository(Laverie::class)->find($id);
        if (!$laverie) {
            return $this->json(['message' => 'Laverie introuvable.'], 404);
        }

        $professionnel = $utilisateur->getProfessionnel();
        if (!$professionnel || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
            return $this->json(['message' => 'Accès interdit.'], 403);
        }

        return $laverie;
    }

    private function serializeMedia(Media $media): array
    {
        return [
            'id'          => $media->getId(),
            'url'         => $media->getEmplacement(),
            'nomOriginel' => $media->getNomOriginel(),
            'mimeType'    => $media->getMimeType(),
            'poids'       => $media->getPoids(),
        ];
    }
}
