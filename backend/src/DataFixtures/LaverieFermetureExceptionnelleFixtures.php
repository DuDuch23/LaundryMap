<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieFermetureExceptionnelle;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieFermetureExceptionnelleFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        $fermeturesExcep = [
            ['laverie_idx' => 0, 'debut' => '2026-04-12 00:00:00', 'fin' => '2026-04-13 23:59:59', 'raison' => 'Fête nationale'],
            ['laverie_idx' => 1, 'debut' => '2026-05-01 00:00:00', 'fin' => '2026-05-01 23:59:59', 'raison' => 'Fête du Travail'],
            ['laverie_idx' => 2, 'debut' => '2026-07-14 00:00:00', 'fin' => '2026-07-14 23:59:59', 'raison' => 'Fête Nationale'],
            ['laverie_idx' => 3, 'debut' => '2026-08-15 00:00:00', 'fin' => '2026-08-15 23:59:59', 'raison' => 'Travaux de maintenance'],
            ['laverie_idx' => 4, 'debut' => '2026-12-25 00:00:00', 'fin' => '2026-12-26 23:59:59', 'raison' => 'Noël'],
        ];

        foreach ($fermeturesExcep as $data) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);

            $fe = new LaverieFermetureExceptionnelle();
            $fe->setLaverie($laverie);
            $fe->setDateDebut(new \DateTime($data['debut']));
            $fe->setDateFin(new \DateTime($data['fin']));
            $fe->setRaison($data['raison']);
            $fe->setDateAjout($now);
            $manager->persist($fe);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [LaverieFixtures::class];
    }
}

