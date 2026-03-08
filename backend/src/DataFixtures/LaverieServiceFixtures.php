<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieService;
use App\Entity\Service;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieServiceFixtures extends Fixture implements DependentFixtureInterface
{
    private array $associations = [
        ['laverie_idx' => 0, 'service_idx' => 0],
        ['laverie_idx' => 1, 'service_idx' => 1],
        ['laverie_idx' => 2, 'service_idx' => 2],
        ['laverie_idx' => 3, 'service_idx' => 3],
        ['laverie_idx' => 4, 'service_idx' => 4],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->associations as $data) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);
            $service = $this->getReference(ServiceFixtures::SERVICE_REFERENCE_PREFIX . $data['service_idx'], Service::class);

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

