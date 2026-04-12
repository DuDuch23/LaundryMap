<?php

namespace App\DataFixtures;

use App\Entity\Media;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MediaFixtures extends Fixture
{
    public const MEDIA_REFERENCE_PREFIX = 'media_';

    public function load(ObjectManager $manager): void
    {
        $totalMediaFixtures = 220;

        for ($i = 0; $i < $totalMediaFixtures; $i++) {
            $media = new Media();
            $media->setEmplacement(sprintf('https://picsum.photos/seed/laundry-%03d/1600/900', $i + 1));
            $media->setNomOriginel(sprintf('laverie-%03d.jpg', $i + 1));
            $media->setPoids(150000 + (($i % 10) * 10000));
            $media->setMimeType('image/jpeg');
            $manager->persist($media);
            $this->addReference(self::MEDIA_REFERENCE_PREFIX . $i, $media);
        }

        $manager->flush();
    }
}
