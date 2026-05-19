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
        // [laverie_idx (position PHP), nom, type, capacite_kg, tarif_€, duree_min]
        $equipements = [
            // Laveries 0-4 (données initiales conservées)
            [0, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [0, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [1, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [1, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],
            [2, 'Lave-linge 6 kg',    'Lave-linge',  6,  3.50, 35],
            [2, 'Sèche-linge 6 kg',   'Sèche-linge', 6,  1.80, 25],
            [3, 'Lave-linge 12 kg',   'Lave-linge',  12, 6.50, 50],
            [3, 'Sèche-linge 12 kg',  'Sèche-linge', 12, 3.00, 40],
            [4, 'Lave-linge 7 kg',    'Lave-linge',  7,  4.00, 38],
            [4, 'Sèche-linge 7 kg',   'Sèche-linge', 7,  2.00, 28],

            // Laverie Henri IV - Senlis (idx 105) : grande laverie centre-ville, 5 machines
            [105, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [105, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [105, 'Lave-linge 14 kg',   'Lave-linge',  14, 7.50, 55],
            [105, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [105, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie République Senlis (idx 106) : 4 machines
            [106, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [106, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [106, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [106, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Chat Haret (idx 107) : petite laverie médiévale, 3 machines
            [107, 'Lave-linge 7 kg',    'Lave-linge',  7,  4.00, 38],
            [107, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [107, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie Joffre (idx 108) : 4 machines, proche gare
            [108, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [108, 'Lave-linge 12 kg',   'Lave-linge',  12, 6.50, 50],
            [108, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [108, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Vieille de Paris (idx 109) : 3 machines
            [109, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [109, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [109, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie Maréchal Foch (idx 110) : grande laverie, 5 machines
            [110, 'Lave-linge 6 kg',    'Lave-linge',  6,  3.50, 35],
            [110, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [110, 'Lave-linge 14 kg',   'Lave-linge',  14, 7.50, 55],
            [110, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [110, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Saint-Pierre (idx 111) : 3 machines
            [111, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [111, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [111, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie de Meaux (idx 112) : 4 machines
            [112, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [112, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [112, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [112, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie de la Gare (idx 113) : 6 machines, grande capacité
            [113, 'Lave-linge 6 kg',    'Lave-linge',  6,  3.50, 35],
            [113, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [113, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [113, 'Lave-linge 14 kg',   'Lave-linge',  14, 7.50, 55],
            [113, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [113, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie du Châtel (idx 114) : 3 machines, quartier historique
            [114, 'Lave-linge 7 kg',    'Lave-linge',  7,  4.00, 38],
            [114, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [114, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie du Connétable - Chantilly (idx 115) : 5 machines
            [115, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [115, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [115, 'Lave-linge 14 kg',   'Lave-linge',  14, 7.50, 55],
            [115, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [115, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Joffre Chantilly (idx 116) : 4 machines
            [116, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [116, 'Lave-linge 12 kg',   'Lave-linge',  12, 6.50, 50],
            [116, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [116, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Paris Chantilly (idx 117) : 4 machines
            [117, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [117, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [117, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [117, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Jules Uhry - Creil (idx 118) : 5 machines
            [118, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [118, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [118, 'Lave-linge 14 kg',   'Lave-linge',  14, 7.50, 55],
            [118, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [118, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie République Creil (idx 119) : 4 machines
            [119, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [119, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [119, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [119, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Pont-Maxence (idx 120) : 4 machines
            [120, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [120, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [120, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
            [120, 'Sèche-linge 10 kg',  'Sèche-linge', 10, 2.50, 35],

            // Laverie Foch Maxence (idx 121) : 3 machines
            [121, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [121, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [121, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie Verberie (idx 122) : petite laverie village, 2 machines
            [122, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [122, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie Nanteuil (idx 123) : seule laverie du bourg, 3 machines
            [123, 'Lave-linge 7 kg',    'Lave-linge',  7,  4.00, 38],
            [123, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [123, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],

            // Laverie Luzarches (idx 124) : petite commune, 3 machines
            [124, 'Lave-linge 8 kg',    'Lave-linge',  8,  4.50, 40],
            [124, 'Lave-linge 10 kg',   'Lave-linge',  10, 5.50, 45],
            [124, 'Sèche-linge 8 kg',   'Sèche-linge', 8,  2.00, 30],
        ];

        foreach ($equipements as [$lavIdx, $nom, $type, $capacite, $tarif, $duree]) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            $eq = new LaverieEquipement();
            $eq->setLaverie($laverie);
            $eq->setNom($nom);
            $eq->setType($type);
            $eq->setCapacite($capacite);
            $eq->setTarif($tarif);
            $eq->setDuree($duree);
            $manager->persist($eq);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [LaverieFixtures::class];
    }
}
