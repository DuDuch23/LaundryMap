<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieEquipement;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieEquipementFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $equipementsParLaverie = [
            0 => [
                ['nom' => 'Lave-linge 8 kg',   'type' => 'Lave-linge',  'capacite' => 8,  'tarif' => 4.50, 'duree' => 40],
                ['nom' => 'Sèche-linge 8 kg',  'type' => 'Sèche-linge', 'capacite' => 8,  'tarif' => 2.00, 'duree' => 30],
            ],
            1 => [
                ['nom' => 'Lave-linge 10 kg',  'type' => 'Lave-linge',  'capacite' => 10, 'tarif' => 5.50, 'duree' => 45],
                ['nom' => 'Sèche-linge 10 kg', 'type' => 'Sèche-linge', 'capacite' => 10, 'tarif' => 2.50, 'duree' => 35],
            ],
            2 => [
                ['nom' => 'Lave-linge 6 kg',   'type' => 'Lave-linge',  'capacite' => 6,  'tarif' => 3.50, 'duree' => 35],
                ['nom' => 'Sèche-linge 6 kg',  'type' => 'Sèche-linge', 'capacite' => 6,  'tarif' => 1.80, 'duree' => 25],
            ],
            3 => [
                ['nom' => 'Lave-linge 12 kg',  'type' => 'Lave-linge',  'capacite' => 12, 'tarif' => 6.50, 'duree' => 50],
                ['nom' => 'Sèche-linge 12 kg', 'type' => 'Sèche-linge', 'capacite' => 12, 'tarif' => 3.00, 'duree' => 40],
            ],
            4 => [
                ['nom' => 'Lave-linge 7 kg',   'type' => 'Lave-linge',  'capacite' => 7,  'tarif' => 4.00, 'duree' => 38],
                ['nom' => 'Sèche-linge 7 kg',  'type' => 'Sèche-linge', 'capacite' => 7,  'tarif' => 2.00, 'duree' => 28],
            ],
        ];

        for ($lavIdx = 0; $lavIdx < 5; $lavIdx++) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            foreach ($equipementsParLaverie[$lavIdx] as $data) {
                $eq = new LaverieEquipement();
                $eq->setLaverie($laverie);
                $eq->setNom($data['nom']);
                $eq->setType($data['type']);
                $eq->setCapacite($data['capacite']);
                $eq->setTarif($data['tarif']);
                $eq->setDuree($data['duree']);
                $manager->persist($eq);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [LaverieFixtures::class];
    }
}

