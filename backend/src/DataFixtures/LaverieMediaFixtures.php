<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieMedia;
use App\Entity\Media;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieMediaFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 0; $i < 5; $i++) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $i, Laverie::class);
            $media = $this->getReference(MediaFixtures::MEDIA_REFERENCE_PREFIX . $i, Media::class);

            $laverieMedia = new LaverieMedia();
            $laverieMedia->setLaverie($laverie);
            $laverieMedia->setMedia($media);
            $laverieMedia->setDescription('Photo principale de la laverie');
            $manager->persist($laverieMedia);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            MediaFixtures::class,
        ];
    }
}

