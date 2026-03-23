<?php

namespace App\DataFixtures;

use App\Entity\Service;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ServiceFixtures extends Fixture
{
    public const SERVICE_REFERENCE_PREFIX = 'service_';

    private array $services = [
        'Lavage',
        'Séchage',
        'Repassage',
        'Nettoyage à sec',
        'Self-service 24h/24',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->services as $i => $nom) {
            $service = new Service();
            $service->setNom($nom);
            $manager->persist($service);
            $this->addReference(self::SERVICE_REFERENCE_PREFIX . $i, $service);
        }

        $manager->flush();
    }
}
