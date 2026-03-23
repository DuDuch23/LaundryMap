<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieFavori;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieFavoriFixtures extends Fixture implements DependentFixtureInterface
{
    private array $favoris = [
        ['laverie_idx' => 0, 'utilisateur_idx' => 3],
        ['laverie_idx' => 1, 'utilisateur_idx' => 3],
        ['laverie_idx' => 2, 'utilisateur_idx' => 3],
        ['laverie_idx' => 0, 'utilisateur_idx' => 4],
        ['laverie_idx' => 3, 'utilisateur_idx' => 4],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->favoris as $data) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);

            $favori = new LaverieFavori();
            $favori->setLaverie($laverie);
            $favori->setUtilisateur($utilisateur);
            $manager->persist($favori);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            UtilisateurFixtures::class,
        ];
    }
}

