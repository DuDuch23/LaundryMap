<?php

namespace App\DataFixtures;

use App\Entity\Media;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MediaFixtures extends Fixture
{
    public const MEDIA_REFERENCE_PREFIX = 'media_';

    private array $medias = [
        ['emplacement' => 'https://picsum.photos/seed/laundry-01/1600/900', 'nom_originel' => 'laverie-01.jpg', 'poids' => 204800, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-02/1600/900', 'nom_originel' => 'laverie-02.jpg', 'poids' => 153600, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-03/1600/900', 'nom_originel' => 'laverie-03.jpg', 'poids' => 307200, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-04/1600/900', 'nom_originel' => 'laverie-04.jpg', 'poids' => 102400, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-05/1600/900', 'nom_originel' => 'laverie-05.jpg', 'poids' => 256000, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-06/1600/900', 'nom_originel' => 'laverie-06.jpg', 'poids' => 220000, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-07/1600/900', 'nom_originel' => 'laverie-07.jpg', 'poids' => 240000, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-08/1600/900', 'nom_originel' => 'laverie-08.jpg', 'poids' => 198000, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-09/1600/900', 'nom_originel' => 'laverie-09.jpg', 'poids' => 275000, 'mime_type' => 'image/jpeg'],
        ['emplacement' => 'https://picsum.photos/seed/laundry-10/1600/900', 'nom_originel' => 'laverie-10.jpg', 'poids' => 310000, 'mime_type' => 'image/jpeg'],
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
