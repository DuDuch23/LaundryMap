<?php

namespace App\DataFixtures;

use App\Entity\Adresse;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Enum\StatutProfessionnelEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class ProfessionnelFixtures extends Fixture implements DependentFixtureInterface
{
    public const PROFESSIONNEL_REFERENCE_PREFIX = 'professionnel_';

    private array $professionnels = [
        ['siren' => 123456789, 'statut' => StatutProfessionnelEnum::STATUT_VALIDE,     'utilisateur_idx' => 0, 'adresse_idx' => 0],
        ['siren' => 987654321, 'statut' => StatutProfessionnelEnum::STATUT_VALIDE,     'utilisateur_idx' => 1, 'adresse_idx' => 1],
        ['siren' => 456789123, 'statut' => StatutProfessionnelEnum::STATUT_EN_ATTENTE, 'utilisateur_idx' => 2, 'adresse_idx' => 2],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->professionnels as $i => $data) {
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);
            $adresse = $this->getReference(AdresseFixtures::ADRESSE_REFERENCE_PREFIX . $data['adresse_idx'], Adresse::class);

            $pro = new Professionnel();
            $pro->setUtilisateur($utilisateur);
            $pro->setSiren($data['siren']);
            $pro->setStatut($data['statut']);
            $pro->setAdresse($adresse);
            if ($data['statut'] === StatutProfessionnelEnum::STATUT_VALIDE) {
                $pro->setDateValidation(new \DateTime());
            }
            $manager->persist($pro);
            $this->addReference(self::PROFESSIONNEL_REFERENCE_PREFIX . $i, $pro);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UtilisateurFixtures::class,
            AdresseFixtures::class,
        ];
    }
}
