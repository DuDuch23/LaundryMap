<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaveriePaiement;
use App\Entity\MethodePaiement;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

// Méthodes de paiement :
// 0 : Espèces  |  1 : Carte bancaire  |  2 : Sans contact  |  3 : Virement bancaire

class LaveriePaiementFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // [laverie_idx (position PHP), methode_idx]
        $associations = [
            // Laveries 0-4 (données initiales conservées)
            [0, 0], [0, 1],
            [1, 0], [1, 2],
            [2, 1], [2, 3],
            [3, 0], [3, 2],
            [4, 0], [4, 1],

            // Henri IV - Senlis (105) : espèces + CB + sans contact
            [105, 0], [105, 1], [105, 2],

            // République Senlis (106) : CB + sans contact
            [106, 1], [106, 2],

            // Chat Haret (107) : espèces uniquement (vieille laverie)
            [107, 0],

            // Joffre (108) : espèces + CB + sans contact
            [108, 0], [108, 1], [108, 2],

            // Vieille de Paris (109) : espèces + CB
            [109, 0], [109, 1],

            // Foch Senlis (110) : CB + sans contact + virement
            [110, 1], [110, 2], [110, 3],

            // Saint-Pierre (111) : espèces + CB
            [111, 0], [111, 1],

            // de Meaux (112) : CB + sans contact
            [112, 1], [112, 2],

            // de la Gare (113) : espèces + CB + sans contact
            [113, 0], [113, 1], [113, 2],

            // du Châtel (114) : espèces uniquement
            [114, 0],

            // Connétable Chantilly (115) : espèces + CB + sans contact
            [115, 0], [115, 1], [115, 2],

            // Joffre Chantilly (116) : CB + sans contact
            [116, 1], [116, 2],

            // Paris Chantilly (117) : espèces + CB + sans contact
            [117, 0], [117, 1], [117, 2],

            // Jules Uhry Creil (118) : espèces + CB + sans contact
            [118, 0], [118, 1], [118, 2],

            // République Creil (119) : CB + sans contact
            [119, 1], [119, 2],

            // Pont-Maxence (120) : espèces + CB
            [120, 0], [120, 1],

            // Foch Maxence (121) : espèces + CB
            [121, 0], [121, 1],

            // Verberie (122) : espèces uniquement (petit village)
            [122, 0],

            // Nanteuil (123) : espèces + CB
            [123, 0], [123, 1],

            // Luzarches (124) : espèces + CB + sans contact
            [124, 0], [124, 1], [124, 2],
        ];

        foreach ($associations as [$lavIdx, $methodeIdx]) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            $methode = $this->getReference(MethodePaiementFixtures::METHODE_REFERENCE_PREFIX . $methodeIdx, MethodePaiement::class);

            $lp = new LaveriePaiement();
            $lp->setLaverie($laverie);
            $lp->setPaiement($methode);
            $manager->persist($lp);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            MethodePaiementFixtures::class,
        ];
    }
}
