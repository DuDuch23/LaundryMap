<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieReseauSocial;
use App\Enum\TypeReseauSocialEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieReseauSocialFixtures extends Fixture implements DependentFixtureInterface
{
    private array $liens = [
        // Laverie du Marais — palette complète
        0 => [
            'SITE_WEB'  => 'https://laverie-du-marais.fr',
            'FACEBOOK'  => 'https://facebook.com/laveriedumarais',
            'INSTAGRAM' => 'https://instagram.com/laverie_du_marais',
            'X'         => 'https://x.com/laveriemarais',
            'LINKEDIN'  => 'https://linkedin.com/company/laverie-du-marais',
        ],
        // Laverie Bellecour — site + réseaux principaux
        1 => [
            'SITE_WEB'  => 'https://laverie-bellecour.fr',
            'FACEBOOK'  => 'https://facebook.com/laveriebellecour',
            'INSTAGRAM' => 'https://instagram.com/laverie.bellecour',
        ],
        // Laverie Saint-Ferréol — un seul réseau
        2 => [
            'INSTAGRAM' => 'https://instagram.com/laverie_saint_ferreol',
        ],
        // Laverie Capitole — site web seul
        3 => [
            'SITE_WEB' => 'https://laverie-capitole-toulouse.fr',
        ],
        // Laverie Rivoli — Facebook + Instagram
        5 => [
            'FACEBOOK'  => 'https://facebook.com/laverierivoli',
            'INSTAGRAM' => 'https://instagram.com/laverie_rivoli',
        ],
        // Laverie Saint-Antoine — site + Facebook
        6 => [
            'SITE_WEB' => 'https://laverie-saint-antoine.fr',
            'FACEBOOK' => 'https://facebook.com/laveriesaintantoine',
        ],
        // Laverie Part-Dieu — palette complète
        9 => [
            'SITE_WEB'  => 'https://laverie-partdieu.fr',
            'FACEBOOK'  => 'https://facebook.com/laveriepartdieu',
            'INSTAGRAM' => 'https://instagram.com/laverie_partdieu',
            'X'         => 'https://x.com/laveriepartdieu',
            'LINKEDIN'  => 'https://linkedin.com/company/laverie-part-dieu',
        ],
        // Laverie Croix-Rousse — X uniquement
        12 => [
            'X' => 'https://x.com/laveriecroixrousse',
        ],
        // Laverie Paradis (Marseille) — site + Instagram
        13 => [
            'SITE_WEB'  => 'https://laverie-paradis-marseille.fr',
            'INSTAGRAM' => 'https://instagram.com/laverie.paradis.mrs',
        ],
        // Laverie Prado — Facebook + LinkedIn
        16 => [
            'FACEBOOK' => 'https://facebook.com/laverieprado',
            'LINKEDIN' => 'https://linkedin.com/company/laverie-prado',
        ],
        // Laverie Sainte-Catherine (Bordeaux) — Instagram + X
        22 => [
            'INSTAGRAM' => 'https://instagram.com/laverie_sainte_catherine',
            'X'         => 'https://x.com/laveriestecath',
        ],
        // Laverie Grand-Place (Lille) — site + Facebook + Instagram
        26 => [
            'SITE_WEB'  => 'https://laverie-grandplace-lille.fr',
            'FACEBOOK'  => 'https://facebook.com/laveriegrandplacelille',
            'INSTAGRAM' => 'https://instagram.com/laverie_grandplace',
        ],
        // Laverie Graslin (Nantes) — LinkedIn uniquement
        30 => [
            'LINKEDIN' => 'https://linkedin.com/company/laverie-graslin',
        ],
        // Laverie Jean Médecin (Nice) — palette complète
        33 => [
            'SITE_WEB'  => 'https://laverie-jeanmedecin-nice.fr',
            'FACEBOOK'  => 'https://facebook.com/laveriejeanmedecin',
            'INSTAGRAM' => 'https://instagram.com/laverie.jeanmedecin',
            'X'         => 'https://x.com/laveriejmedecin',
            'LINKEDIN'  => 'https://linkedin.com/company/laverie-jean-medecin',
        ],
        // Laverie Kléber (Strasbourg) — site web seul
        37 => [
            'SITE_WEB' => 'https://laverie-kleber-strasbourg.fr',
        ],
        // Laverie Stanislas (Nancy) — Facebook + Instagram + X
        85 => [
            'FACEBOOK'  => 'https://facebook.com/laveriestanislas',
            'INSTAGRAM' => 'https://instagram.com/laverie_stanislas',
            'X'         => 'https://x.com/laveriestanislas',
        ],
        // Laverie Henri IV (Senlis) — site + Instagram
        105 => [
            'SITE_WEB'  => 'https://laverie-henri4-senlis.fr',
            'INSTAGRAM' => 'https://instagram.com/laverie_henri4_senlis',
        ],
        // Laverie du Connétable (Chantilly) — Facebook uniquement
        115 => [
            'FACEBOOK' => 'https://facebook.com/laverieconnetablechantilly',
        ],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->liens as $laverieIdx => $reseaux) {
            $laverie = $this->getReference(
                LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $laverieIdx,
                Laverie::class
            );

            foreach ($reseaux as $typeName => $url) {
                $type = TypeReseauSocialEnum::{$typeName};

                $reseau = new LaverieReseauSocial();
                $reseau->setLaverie($laverie);
                $reseau->setType($type);
                $reseau->setUrl($url);
                $manager->persist($reseau);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
        ];
    }
}
