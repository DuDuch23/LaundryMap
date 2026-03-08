<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaveriePaiement;
use App\Entity\MethodePaiement;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaveriePaiementFixtures extends Fixture implements DependentFixtureInterface
{
    private array $associations = [
        ['laverie_idx' => 0, 'methode_idx' => 0],
        ['laverie_idx' => 0, 'methode_idx' => 1],
        ['laverie_idx' => 1, 'methode_idx' => 0],
        ['laverie_idx' => 1, 'methode_idx' => 2],
        ['laverie_idx' => 2, 'methode_idx' => 1],
        ['laverie_idx' => 2, 'methode_idx' => 3],
        ['laverie_idx' => 3, 'methode_idx' => 0],
        ['laverie_idx' => 3, 'methode_idx' => 2],
        ['laverie_idx' => 4, 'methode_idx' => 0],
        ['laverie_idx' => 4, 'methode_idx' => 1],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->associations as $data) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);
            $methode = $this->getReference(MethodePaiementFixtures::METHODE_REFERENCE_PREFIX . $data['methode_idx'], MethodePaiement::class);

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

