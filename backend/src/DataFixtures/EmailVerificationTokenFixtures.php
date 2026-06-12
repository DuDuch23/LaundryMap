<?php

namespace App\DataFixtures;

use App\Entity\EmailVerificationToken;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EmailVerificationTokenFixtures extends Fixture implements DependentFixtureInterface
{
    /*
     *
     * Index correspondent à UtilisateurFixtures :
     *   0 = Marc Dupont      (pro validé)
     *   1 = Sophie Martin    (pro validé)
     *   2 = Jean Leclerc     (pro en attente de validation admin)
     *   3 = Alice Bernard    (user simple validé)
     *   4 = Thomas Roux      (user simple en attente)
     *   5 = Lucas Moreau     (user simple validé)
     *   6 = Camille Petit    (user simple validé)
     *   7 = Julie Lefèvre    (user simple validé)
     *   8 = Maxime Durand    (user simple validé)
     */
    private const TOKENS = [
        ['utilisateur_idx' => 0],
        ['utilisateur_idx' => 1],
        ['utilisateur_idx' => 2],
        ['utilisateur_idx' => 3],
        ['utilisateur_idx' => 4],
        ['utilisateur_idx' => 5],
        ['utilisateur_idx' => 6],
        ['utilisateur_idx' => 7],
        ['utilisateur_idx' => 8],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::TOKENS as $i => $data) {
            /** @var Utilisateur $utilisateur */
            $utilisateur = $this->getReference(
                UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'],
                Utilisateur::class
            );

            $token = new EmailVerificationToken();
            $token->setUser($utilisateur);
            $token->setToken($this->genererTokenAleatoire());
            $token->setCreatedAt(new \DateTimeImmutable('-1 day'));
            $token->setExpiresAt(new \DateTimeImmutable('+2 hours'));
            $token->setVerifiedAt(new \DateTimeImmutable('-23 hours'));

            $manager->persist($token);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UtilisateurFixtures::class,
        ];
    }

    private function genererTokenAleatoire(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
