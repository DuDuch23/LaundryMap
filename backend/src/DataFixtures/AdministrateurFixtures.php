<?php

namespace App\DataFixtures;

use App\Entity\Administrateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AdministrateurFixtures extends Fixture
{
    public const ADMIN_REFERENCE_PREFIX = 'administrateur_';

    private array $admins = [
        ['email' => 'admin@laundrymaps.fr',        'mdp' => 'Admin@1234'],
        ['email' => 'moderateur@laundrymaps.fr',   'mdp' => 'Modo@5678'],
        ['email' => 'superadmin@laundrymaps.fr',   'mdp' => 'Super@9012'],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->admins as $i => $data) {
            $admin = new Administrateur();
            $admin->setEmail($data['email']);
            $admin->setMotDePasse(password_hash($data['mdp'], PASSWORD_BCRYPT));
            $manager->persist($admin);
            $this->addReference(self::ADMIN_REFERENCE_PREFIX . $i, $admin);
        }

        $manager->flush();
    }
}
