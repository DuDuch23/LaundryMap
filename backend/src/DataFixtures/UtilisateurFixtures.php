<?php

namespace App\DataFixtures;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UtilisateurFixtures extends Fixture
{
    public const UTILISATEUR_REFERENCE_PREFIX = 'utilisateur_';

    public const STANDARD_USER_INDICES = [3, 5, 6, 7, 8];

    private array $utilisateurs = [
        ['email' => 'marc.dupont@email.fr',     'nom' => 'Dupont',   'prenom' => 'Marc',     'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'sophie.martin@email.fr',   'nom' => 'Martin',   'prenom' => 'Sophie',   'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'jean.leclerc@email.fr',    'nom' => 'Leclerc',  'prenom' => 'Jean',     'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'alice.bernard@email.fr',   'nom' => 'Bernard',  'prenom' => 'Alice',    'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'thomas.roux@email.fr',     'nom' => 'Roux',     'prenom' => 'Thomas',   'statut' => StatutUtilisateurEnum::STATUT_EN_ATTENTE],
        ['email' => 'lucas.moreau@email.fr',    'nom' => 'Moreau',   'prenom' => 'Lucas',    'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'camille.petit@email.fr',   'nom' => 'Petit',    'prenom' => 'Camille',  'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'julie.lefevre@email.fr',   'nom' => 'Lefèvre',  'prenom' => 'Julie',    'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
        ['email' => 'maxime.durand@email.fr',   'nom' => 'Durand',   'prenom' => 'Maxime',   'statut' => StatutUtilisateurEnum::STATUT_VALIDE],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->utilisateurs as $i => $data) {
            $user = new Utilisateur();
            $user->setEmail($data['email']);
            $user->setNom($data['nom']);
            $user->setPrenom($data['prenom']);
            $user->setMotDePasse(password_hash('Password@123', PASSWORD_BCRYPT));
            $user->setStatut($data['statut']);
            $user->setDateCreation(new \DateTime());
            $user->setDateModification(new \DateTime());
            $user->setDateDerniereConnexion(new \DateTime());
            $manager->persist($user);
            $this->addReference(self::UTILISATEUR_REFERENCE_PREFIX . $i, $user);
        }

        $manager->flush();
    }
}
