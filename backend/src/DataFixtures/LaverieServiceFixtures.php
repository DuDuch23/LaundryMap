<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieService;
use App\Entity\Service;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

// Services disponibles :
// 0 : Lavage  |  1 : Séchage  |  2 : Repassage  |  3 : Nettoyage à sec  |  4 : Self-service 24h/24

class LaverieServiceFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // [laverie_idx (position PHP), service_idx]
        $associations = [
            // Laveries 0-4 (données initiales conservées)
            [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],

            // Henri IV - Senlis (105) : lavage + séchage + self-service
            [105, 0], [105, 1], [105, 4],

            // République Senlis (106) : lavage + séchage + repassage
            [106, 0], [106, 1], [106, 2],

            // Chat Haret (107) : lavage + séchage uniquement
            [107, 0], [107, 1],

            // Joffre (108) : lavage + séchage + self-service 24h
            [108, 0], [108, 1], [108, 4],

            // Vieille de Paris (109) : lavage + séchage
            [109, 0], [109, 1],

            // Foch Senlis (110) : lavage + séchage + repassage + self-service
            [110, 0], [110, 1], [110, 2], [110, 4],

            // Saint-Pierre (111) : lavage + séchage
            [111, 0], [111, 1],

            // de Meaux (112) : lavage + séchage + nettoyage à sec
            [112, 0], [112, 1], [112, 3],

            // de la Gare (113) : tous les services (grande laverie)
            [113, 0], [113, 1], [113, 2], [113, 3], [113, 4],

            // du Châtel (114) : lavage + séchage
            [114, 0], [114, 1],

            // Connétable Chantilly (115) : lavage + séchage + repassage + self-service
            [115, 0], [115, 1], [115, 2], [115, 4],

            // Joffre Chantilly (116) : lavage + séchage + nettoyage à sec
            [116, 0], [116, 1], [116, 3],

            // Paris Chantilly (117) : lavage + séchage + self-service
            [117, 0], [117, 1], [117, 4],

            // Jules Uhry Creil (118) : lavage + séchage + self-service
            [118, 0], [118, 1], [118, 4],

            // République Creil (119) : lavage + séchage + repassage
            [119, 0], [119, 1], [119, 2],

            // Pont-Maxence (120) : lavage + séchage + self-service
            [120, 0], [120, 1], [120, 4],

            // Foch Maxence (121) : lavage + séchage
            [121, 0], [121, 1],

            // Verberie (122) : lavage + séchage uniquement
            [122, 0], [122, 1],

            // Nanteuil (123) : lavage + séchage
            [123, 0], [123, 1],

            // Luzarches (124) : lavage + séchage
            [124, 0], [124, 1],
        ];

        foreach ($associations as [$lavIdx, $serviceIdx]) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            $service = $this->getReference(ServiceFixtures::SERVICE_REFERENCE_PREFIX . $serviceIdx, Service::class);

            $ls = new LaverieService();
            $ls->setLaverie($laverie);
            $ls->setService($service);
            $manager->persist($ls);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            ServiceFixtures::class,
        ];
    }
}
