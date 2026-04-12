<?php

namespace App\Controller\Api;

use App\Entity\Laverie;
use App\Entity\LaverieMedia;
use App\Entity\Media;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class ApiMediaController extends AbstractController
{
    private const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
    private const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

    public function __construct(
        private string $uploadsDirectory,
        private string $uploadsPublicPath,
    ) {}

    #[Route('/api/laveries/{id}/logo', name: 'api_laverie_logo', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadLogo(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        SluggerInterface $slugger,
    ): JsonResponse {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) {
            return $laverie;
        }

        $file = $request->files->get('logo');
        if (!$file) {
            return $this->json(['message' => 'Aucun fichier reçu.'], 400);
        }

        $erreur = $this->validerFichier($file);
        if ($erreur) return $this->json(['message' => $erreur], 400);

        // Supprime l'ancien logo (fichier + entité)
        if ($laverie->getLogo()) {
            $ancienMedia = $laverie->getLogo();
            $laverie->setLogo(null);
            $this->supprimerFichier($ancienMedia->getEmplacement());
            $em->remove($ancienMedia);
        }

        $media = $this->creerMedia($file, $slugger, $em);
        $laverie->setLogo($media);
        $laverie->setDateModification(new \DateTime());
        $em->flush();

        return $this->json([
            'message' => 'Logo mis à jour.',
            'logo' => $this->serializeMedia($media),
        ]);
    }

    #[Route('/api/laveries/{id}/logo', name: 'api_laverie_logo_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deleteLogo(int $id, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) {
            return $laverie;
        }

        if (!$laverie->getLogo()) {
            return $this->json(['message' => 'Aucun logo à supprimer.'], 404);
        }

        $media = $laverie->getLogo();
        $laverie->setLogo(null);
        $this->supprimerFichier($media->getEmplacement());
        $em->remove($media);
        $em->flush();

        return $this->json(['message' => 'Logo supprimé.']);
    }

    #[Route('/api/laveries/{id}/photos', name: 'api_laverie_photos', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadPhoto(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        SluggerInterface $slugger,
    ): JsonResponse {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        $file = $request->files->get('photo');
        if (!$file) {
            return $this->json(['message' => 'Aucun fichier reçu.'], 400);
        }

        $erreur = $this->validerFichier($file);
        if ($erreur) return $this->json(['message' => $erreur], 400);

        $media = $this->creerMedia($file, $slugger, $em);

        $laverieMedia = new LaverieMedia();
        $laverieMedia->setLaverie($laverie);
        $laverieMedia->setMedia($media);
        $laverieMedia->setDescription($request->request->get('description', ''));
        $em->persist($laverieMedia);

        $laverie->setDateModification(new \DateTime());
        $em->flush();

        return $this->json([
            'message' => 'Photo ajoutée.',
            'photo'   => $this->serializeMedia($media),
        ], 201);
    }

    #[Route('/api/laveries/{id}/photos/{mediaId}', name: 'api_laverie_photo_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deletePhoto(int $id, int $mediaId, EntityManagerInterface $em): JsonResponse
    {
        $laverie = $this->getLaverieOwnee($id, $em);
        if ($laverie instanceof JsonResponse) return $laverie;

        $laverieMedia = $em->getRepository(LaverieMedia::class)->findOneBy([
            'laverie' => $laverie,
            'media' => $mediaId,
        ]);

        if (!$laverieMedia) {
            return $this->json(['message' => 'Photo introuvable.'], 404);
        }

        $media = $laverieMedia->getMedia();
        $em->remove($laverieMedia);

        if ($media) {
            $this->supprimerFichier($media->getEmplacement());
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

    private function validerFichier(\Symfony\Component\HttpFoundation\File\UploadedFile $file): ?string
    {
        if (!in_array($file->getMimeType(), self::TYPES_AUTORISES)) {
            return 'Format non autorisé. JPEG, PNG ou WebP uniquement.';
        }
        if ($file->getSize() > self::TAILLE_MAX) {
            return 'Fichier trop lourd (5 Mo max).';
        }
        return null;
    }

    private function creerMedia(
        \Symfony\Component\HttpFoundation\File\UploadedFile $file,
        SluggerInterface $slugger,
        EntityManagerInterface $em,
    ): Media {
        $taille = $file->getSize();
        $mimeType = $file->getMimeType();
        $nomOriginel = $file->getClientOriginalName();

        $nomSafe = $slugger->slug(pathinfo($nomOriginel, PATHINFO_FILENAME));
        $nomFichier = $nomSafe . '-' . uniqid() . '.' . $file->guessExtension();
        $emplacement = $this->uploadsDirectory . '/' . $nomFichier;

        // Le fichier tmp est supprimé après cette ligne
        $file->move($this->uploadsDirectory, $nomFichier);

        $media = new Media();
        $media->setEmplacement($emplacement);
        $media->setNomOriginel($nomOriginel);
        $media->setPoids($taille ?? 0);
        $media->setMimeType($mimeType ?? 'image/jpeg');
        $em->persist($media);

        return $media;
    }

    private function supprimerFichier(string $emplacement): void
    {
        if (file_exists($emplacement)) {
            unlink($emplacement);
        }
    }

    private function serializeMedia(Media $media): array
    {
        return [
            'id' => $media->getId(),
            'url' => $this->uploadsPublicPath . '/' . basename($media->getEmplacement()),
            'nomOriginel' => $media->getNomOriginel(),
            'mimeType' => $media->getMimeType(),
            'poids' => $media->getPoids(),
        ];
    }
}