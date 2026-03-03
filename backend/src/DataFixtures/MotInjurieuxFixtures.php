<?php

namespace App\DataFixtures;

use App\Entity\MotInjurieux;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MotInjurieuxFixtures extends Fixture
{
    private array $mots = [
        'enculé', 'imbécile', 'connard', 'fils de pute', 'epstein',
        'voleur', 'gourgandine', 'con', 'merde', 'putain',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->mots as $label) {
            $mot = new MotInjurieux();
            $mot->setLabel($label);
            $manager->persist($mot);
        }

        $manager->flush();
    }
}
