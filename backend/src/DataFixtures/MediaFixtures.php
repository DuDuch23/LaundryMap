<?php

namespace App\DataFixtures;

use App\Entity\Media;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MediaFixtures extends Fixture
{
    public const MEDIA_REFERENCE_PREFIX = 'media_';

    private array $medias = [
        ['emplacement' => 'uploads/laveries/laverie1.jpg',  'nom_originel' => 'laverie1.jpg',  'poids' => 204800,  'mime_type' => 'image/jpeg'],
        ['emplacement' => 'uploads/laveries/laverie2.jpg',  'nom_originel' => 'laverie2.jpg',  'poids' => 153600,  'mime_type' => 'image/jpeg'],
        ['emplacement' => 'uploads/laveries/laverie3.png',  'nom_originel' => 'laverie3.png',  'poids' => 307200,  'mime_type' => 'image/png'],
        ['emplacement' => 'uploads/laveries/laverie4.webp', 'nom_originel' => 'laverie4.webp', 'poids' => 102400,  'mime_type' => 'image/webp'],
        ['emplacement' => 'uploads/laveries/laverie5.jpg',  'nom_originel' => 'laverie5.jpg',  'poids' => 256000,  'mime_type' => 'image/jpeg'],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->medias as $i => $data) {
            $media = new Media();
            $media->setEmplacement($data['emplacement']);
            $media->setNomOriginel($data['nom_originel']);
            $media->setPoids($data['poids']);
            $media->setMimeType($data['mime_type']);
            $manager->persist($media);
            $this->addReference(self::MEDIA_REFERENCE_PREFIX . $i, $media);
        }

        $manager->flush();
    }
}
