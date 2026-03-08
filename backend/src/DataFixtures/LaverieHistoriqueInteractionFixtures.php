<?php

namespace App\DataFixtures;

use App\Entity\Administrateur;
use App\Entity\Laverie;
use App\Entity\LaverieHistoriqueInteraction;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieHistoriqueInteractionFixtures extends Fixture implements DependentFixtureInterface
{
    private array $historiques = [
        ['admin_idx' => 0, 'laverie_idx' => 0, 'action' => 'Validation', 'motif' => 'Dossier complet et conforme'],
        ['admin_idx' => 0, 'laverie_idx' => 1, 'action' => 'Validation', 'motif' => 'Verification effectuée avec succès'],
        ['admin_idx' => 1, 'laverie_idx' => 2, 'action' => 'Validation', 'motif' => 'Contrôle qualité réussi'],
        ['admin_idx' => 1, 'laverie_idx' => 3, 'action' => 'Validation', 'motif' => 'Informations vérifiées'],
        ['admin_idx' => 2, 'laverie_idx' => 4, 'action' => 'En attente', 'motif' => 'En attente de pièces justificatives'],
    ];

    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        foreach ($this->historiques as $data) {
            $admin = $this->getReference(AdministrateurFixtures::ADMIN_REFERENCE_PREFIX . $data['admin_idx'], Administrateur::class);
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);

            $historique = new LaverieHistoriqueInteraction();
            $historique->setAdministrateur($admin);
            $historique->setLaverie($laverie);
            $historique->setAction($data['action']);
            $historique->setMotifAction($data['motif']);
            $historique->setDate($now);
            $manager->persist($historique);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            AdministrateurFixtures::class,
            LaverieFixtures::class,
        ];
    }
}

