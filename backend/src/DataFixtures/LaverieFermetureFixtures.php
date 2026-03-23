<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieFermeture;
use App\Enum\JourEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieFermetureFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        $fermeturesParLaverie = [
            0 => [JourEnum::DIMANCHE, JourEnum::LUNDI],
            1 => [JourEnum::DIMANCHE],
            2 => [JourEnum::DIMANCHE, JourEnum::SAMEDI],
            3 => [JourEnum::DIMANCHE],
            4 => [JourEnum::DIMANCHE, JourEnum::LUNDI],
        ];

        for ($lavIdx = 0; $lavIdx < 5; $lavIdx++) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            foreach ($fermeturesParLaverie[$lavIdx] as $jour) {
                $fermeture = new LaverieFermeture();
                $fermeture->setLaverie($laverie);
                $fermeture->setJour($jour);
                $fermeture->setHeureDebut(new \DateTime('00:00:00'));
                $fermeture->setHeureFin(new \DateTime('23:59:59'));
                $fermeture->setDateAjout($now);
                $fermeture->setDateModification($now);
                $manager->persist($fermeture);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [LaverieFixtures::class];
    }
}

