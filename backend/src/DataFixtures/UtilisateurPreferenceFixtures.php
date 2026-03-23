<?php

namespace App\DataFixtures;

use App\Entity\Langue;
use App\Entity\Utilisateur;
use App\Entity\UtilisateurPreference;
use App\Enum\ThemePreferenceEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UtilisateurPreferenceFixtures extends Fixture implements DependentFixtureInterface
{
    private array $preferences = [
        ['utilisateur_idx' => 0, 'langue_idx' => 0, 'theme' => ThemePreferenceEnum::THEME_CLAIR,   'notifications' => true],
        ['utilisateur_idx' => 1, 'langue_idx' => 1, 'theme' => ThemePreferenceEnum::THEME_SOMBRE,  'notifications' => false],
        ['utilisateur_idx' => 2, 'langue_idx' => 0, 'theme' => ThemePreferenceEnum::THEME_SYSTEME, 'notifications' => true],
        ['utilisateur_idx' => 3, 'langue_idx' => 0, 'theme' => ThemePreferenceEnum::THEME_CLAIR,   'notifications' => true],
        ['utilisateur_idx' => 4, 'langue_idx' => 1, 'theme' => ThemePreferenceEnum::THEME_SOMBRE,  'notifications' => false],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->preferences as $data) {
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);
            $langue = $this->getReference(LangueFixtures::LANGUE_REFERENCE_PREFIX . $data['langue_idx'], Langue::class);

            $pref = new UtilisateurPreference();
            $pref->setUtilisateur($utilisateur);
            $pref->setLangue($langue);
            $pref->setTheme($data['theme']);
            $pref->setNotifications($data['notifications']);
            $manager->persist($pref);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UtilisateurFixtures::class,
            LangueFixtures::class,
        ];
    }
}
