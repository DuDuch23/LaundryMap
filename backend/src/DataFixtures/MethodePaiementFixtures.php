<?php

namespace App\DataFixtures;

use App\Entity\MethodePaiement;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MethodePaiementFixtures extends Fixture
{
    public const METHODE_REFERENCE_PREFIX = 'methode_';

    private array $methodes = [
        'Espèces',
        'Carte bancaire',
        'Sans contact',
        'Virement bancaire',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->methodes as $i => $nom) {
            $methode = new MethodePaiement();
            $methode->setNom($nom);
            $manager->persist($methode);
            $this->addReference(self::METHODE_REFERENCE_PREFIX . $i, $methode);
        }

        $manager->flush();
    }
}
