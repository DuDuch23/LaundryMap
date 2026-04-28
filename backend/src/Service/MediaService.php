<?php

namespace App\Service;

use App\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class MediaService
{
    private const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
    private const EXTENSIONS_AUTORISEES = ['jpg', 'jpeg', 'png', 'webp'];
    private const TAILLE_MAX = 5 * 1024 * 1024;

    public function __construct(
        private readonly string $uploadsDirectory,
        private readonly string $uploadsPublicPath,
        private readonly SluggerInterface $slugger,
        private readonly EntityManagerInterface $em,
    ) {}

    public function validerFichier(UploadedFile $file): ?string
    {
        $mimeType = $file->getMimeType();
        if (!\in_array($mimeType, self::TYPES_AUTORISES)) {
            return 'Format non autorisé. JPEG, PNG ou WebP uniquement.';
        }
        if ($file->getSize() > self::TAILLE_MAX) {
            return 'Fichier trop lourd (5 Mo max).';
        }
        $extension = strtolower((string) $file->guessExtension());
        if (!\in_array($extension, self::EXTENSIONS_AUTORISEES)) {
            return 'Extension incohérente avec le contenu du fichier.';
        }
        return null;
    }

    public function creerMedia(UploadedFile $file): Media
    {
        $taille    = $file->getSize();
        $mimeType  = $file->getMimeType();
        $nomOriginel = strip_tags(substr($file->getClientOriginalName(), 0, 255));

        $nomSafe    = $this->slugger->slug(pathinfo($nomOriginel, PATHINFO_FILENAME));
        $nomFichier = $nomSafe . '-' . uniqid() . '.' . $file->guessExtension();

        $file->move($this->uploadsDirectory, $nomFichier);

        $media = new Media();
        $media->setEmplacement($this->uploadsPublicPath . '/' . $nomFichier);
        $media->setNomOriginel($nomOriginel);
        $media->setPoids($taille ?? 0);
        $media->setMimeType($mimeType ?? 'image/jpeg');
        $this->em->persist($media);

        return $media;
    }

    public function supprimerFichier(string $emplacementRelatif): void
    {
        $cheminAbsolu = $this->uploadsDirectory . '/' . basename($emplacementRelatif);
        if (file_exists($cheminAbsolu)) {
            unlink($cheminAbsolu);
        }
    }
}
