<?php

namespace App\DataFixtures;

use App\Entity\Langue;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class LangueFixtures extends Fixture
{
    public const LANGUE_REFERENCE_PREFIX = 'langue_';

    private array $langues = [
        ['nom' => 'Français',  'code' => 'fr'],
        ['nom' => 'Anglais',   'code' => 'en'],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->langues as $i => $data) {
            $langue = new Langue();
            $langue->setNom($data['nom']);
            $langue->setCode($data['code']);
            $manager->persist($langue);
            $this->addReference(self::LANGUE_REFERENCE_PREFIX . $i, $langue);
        }

        $manager->flush();
    }
}