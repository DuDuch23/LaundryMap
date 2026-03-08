<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/*
 * Commande : php bin/console doctrine:fixtures:load
 */
class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        
    }
}
