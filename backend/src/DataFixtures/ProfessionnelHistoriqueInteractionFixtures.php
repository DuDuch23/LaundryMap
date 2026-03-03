<?php

namespace App\DataFixtures;

use App\Entity\Administrateur;
use App\Entity\Professionnel;
use App\Entity\ProfessionnelHistoriqueInteraction;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class ProfessionnelHistoriqueInteractionFixtures extends Fixture implements DependentFixtureInterface
{
    private array $historiques = [
        ['admin_idx' => 0, 'pro_idx' => 0, 'action' => 'Validation du compte', 'motif' => 'SIREN vérifié et validé'],
        ['admin_idx' => 0, 'pro_idx' => 1, 'action' => 'Validation du compte', 'motif' => 'Documents conformes'],
        ['admin_idx' => 1, 'pro_idx' => 2, 'action' => 'Mise en attente',      'motif' => 'Documents manquants, relance envoyée'],
    ];

    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        foreach ($this->historiques as $data) {
            $admin = $this->getReference(AdministrateurFixtures::ADMIN_REFERENCE_PREFIX . $data['admin_idx'], Administrateur::class);
            $pro = $this->getReference(ProfessionnelFixtures::PROFESSIONNEL_REFERENCE_PREFIX . $data['pro_idx'], Professionnel::class);

            $historique = new ProfessionnelHistoriqueInteraction();
            $historique->setAdministrateur($admin);
            $historique->setProfessionnel($pro);
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
            ProfessionnelFixtures::class,
        ];
    }
}

