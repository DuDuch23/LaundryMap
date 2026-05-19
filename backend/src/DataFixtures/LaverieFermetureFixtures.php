<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieFermeture;
use App\Enum\JourEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieFermetureFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        // [laverie_idx (position PHP), JourEnum, 'HH:MM ouverture', 'HH:MM fermeture']
        // Plusieurs lignes le même jour = plusieurs plages horaires (ex. coupure méridienne)
        $horaires = [
            // Laveries 0-4 (données initiales conservées)
            [0, JourEnum::DIMANCHE, '00:00', '23:59'],
            [0, JourEnum::LUNDI,    '00:00', '23:59'],
            [1, JourEnum::DIMANCHE, '00:00', '23:59'],
            [2, JourEnum::DIMANCHE, '00:00', '23:59'],
            [2, JourEnum::SAMEDI,   '00:00', '23:59'],
            [3, JourEnum::DIMANCHE, '00:00', '23:59'],
            [4, JourEnum::DIMANCHE, '00:00', '23:59'],
            [4, JourEnum::LUNDI,    '00:00', '23:59'],

            // ── Laverie Henri IV - Senlis (idx 105) ───────────────────────────
            // Lun-Ven : coupure méridienne  |  Sam : journée continue  |  Dim : demi-journée
            [105, JourEnum::LUNDI,    '07:00', '12:30'],
            [105, JourEnum::LUNDI,    '14:00', '21:00'],
            [105, JourEnum::MARDI,    '07:00', '12:30'],
            [105, JourEnum::MARDI,    '14:00', '21:00'],
            [105, JourEnum::MERCREDI, '07:00', '12:30'],
            [105, JourEnum::MERCREDI, '14:00', '21:00'],
            [105, JourEnum::JEUDI,    '07:00', '12:30'],
            [105, JourEnum::JEUDI,    '14:00', '21:00'],
            [105, JourEnum::VENDREDI, '07:00', '12:30'],
            [105, JourEnum::VENDREDI, '14:00', '21:00'],
            [105, JourEnum::SAMEDI,   '07:00', '21:00'],
            [105, JourEnum::DIMANCHE, '08:00', '18:00'],

            // Laverie République Senlis (idx 106) : 7j/7 8h-20h (journée continue)
            [106, JourEnum::LUNDI,    '08:00', '20:00'],
            [106, JourEnum::MARDI,    '08:00', '20:00'],
            [106, JourEnum::MERCREDI, '08:00', '20:00'],
            [106, JourEnum::JEUDI,    '08:00', '20:00'],
            [106, JourEnum::VENDREDI, '08:00', '20:00'],
            [106, JourEnum::SAMEDI,   '08:00', '20:00'],
            [106, JourEnum::DIMANCHE, '08:00', '20:00'],

            // ── Laverie Chat Haret (idx 107) ─────────────────────────────────
            // Rythme artisanal : coupure 12h-14h tous les jours
            [107, JourEnum::MARDI,    '09:00', '12:00'],
            [107, JourEnum::MARDI,    '14:00', '19:00'],
            [107, JourEnum::MERCREDI, '09:00', '12:00'],
            [107, JourEnum::MERCREDI, '14:00', '19:00'],
            [107, JourEnum::JEUDI,    '09:00', '12:00'],
            [107, JourEnum::JEUDI,    '14:00', '19:00'],
            [107, JourEnum::VENDREDI, '09:00', '12:00'],
            [107, JourEnum::VENDREDI, '14:00', '19:00'],
            [107, JourEnum::SAMEDI,   '09:00', '12:00'],
            [107, JourEnum::SAMEDI,   '14:00', '19:00'],
            [107, JourEnum::DIMANCHE, '09:00', '17:00'],

            // Laverie Joffre (idx 108) : Lun-Sam 7h-22h, Dim fermé
            [108, JourEnum::LUNDI,    '07:00', '22:00'],
            [108, JourEnum::MARDI,    '07:00', '22:00'],
            [108, JourEnum::MERCREDI, '07:00', '22:00'],
            [108, JourEnum::JEUDI,    '07:00', '22:00'],
            [108, JourEnum::VENDREDI, '07:00', '22:00'],
            [108, JourEnum::SAMEDI,   '07:00', '22:00'],

            // Laverie Vieille de Paris (idx 109) : Lun-Sam 8h-20h, Dim 9h-13h
            [109, JourEnum::LUNDI,    '08:00', '20:00'],
            [109, JourEnum::MARDI,    '08:00', '20:00'],
            [109, JourEnum::MERCREDI, '08:00', '20:00'],
            [109, JourEnum::JEUDI,    '08:00', '20:00'],
            [109, JourEnum::VENDREDI, '08:00', '20:00'],
            [109, JourEnum::SAMEDI,   '08:00', '20:00'],
            [109, JourEnum::DIMANCHE, '09:00', '13:00'],

            // Laverie Maréchal Foch (idx 110) : Lun-Sam 7h-21h, Dim 8h-18h
            [110, JourEnum::LUNDI,    '07:00', '21:00'],
            [110, JourEnum::MARDI,    '07:00', '21:00'],
            [110, JourEnum::MERCREDI, '07:00', '21:00'],
            [110, JourEnum::JEUDI,    '07:00', '21:00'],
            [110, JourEnum::VENDREDI, '07:00', '21:00'],
            [110, JourEnum::SAMEDI,   '07:00', '21:00'],
            [110, JourEnum::DIMANCHE, '08:00', '18:00'],

            // Laverie Saint-Pierre (idx 111) : Lun-Ven 8h-21h, Sam 8h-18h
            [111, JourEnum::LUNDI,    '08:00', '21:00'],
            [111, JourEnum::MARDI,    '08:00', '21:00'],
            [111, JourEnum::MERCREDI, '08:00', '21:00'],
            [111, JourEnum::JEUDI,    '08:00', '21:00'],
            [111, JourEnum::VENDREDI, '08:00', '21:00'],
            [111, JourEnum::SAMEDI,   '08:00', '18:00'],

            // Laverie de Meaux (idx 112) : 7j/7 8h-20h
            [112, JourEnum::LUNDI,    '08:00', '20:00'],
            [112, JourEnum::MARDI,    '08:00', '20:00'],
            [112, JourEnum::MERCREDI, '08:00', '20:00'],
            [112, JourEnum::JEUDI,    '08:00', '20:00'],
            [112, JourEnum::VENDREDI, '08:00', '20:00'],
            [112, JourEnum::SAMEDI,   '08:00', '20:00'],
            [112, JourEnum::DIMANCHE, '08:00', '20:00'],

            // Laverie de la Gare (idx 113) : 7j/7 6h-22h
            [113, JourEnum::LUNDI,    '06:00', '22:00'],
            [113, JourEnum::MARDI,    '06:00', '22:00'],
            [113, JourEnum::MERCREDI, '06:00', '22:00'],
            [113, JourEnum::JEUDI,    '06:00', '22:00'],
            [113, JourEnum::VENDREDI, '06:00', '22:00'],
            [113, JourEnum::SAMEDI,   '06:00', '22:00'],
            [113, JourEnum::DIMANCHE, '07:00', '21:00'],

            // Laverie du Châtel (idx 114) : Lun-Ven 8h-20h, Sam 8h-17h
            [114, JourEnum::LUNDI,    '08:00', '20:00'],
            [114, JourEnum::MARDI,    '08:00', '20:00'],
            [114, JourEnum::MERCREDI, '08:00', '20:00'],
            [114, JourEnum::JEUDI,    '08:00', '20:00'],
            [114, JourEnum::VENDREDI, '08:00', '20:00'],
            [114, JourEnum::SAMEDI,   '08:00', '17:00'],

            // ── Laverie du Connétable - Chantilly (idx 115) ───────────────────
            // Lun-Ven : coupure méridienne  |  Sam : journée continue  |  Dim : demi-journée
            [115, JourEnum::LUNDI,    '08:00', '12:30'],
            [115, JourEnum::LUNDI,    '14:00', '21:00'],
            [115, JourEnum::MARDI,    '08:00', '12:30'],
            [115, JourEnum::MARDI,    '14:00', '21:00'],
            [115, JourEnum::MERCREDI, '08:00', '12:30'],
            [115, JourEnum::MERCREDI, '14:00', '21:00'],
            [115, JourEnum::JEUDI,    '08:00', '12:30'],
            [115, JourEnum::JEUDI,    '14:00', '21:00'],
            [115, JourEnum::VENDREDI, '08:00', '12:30'],
            [115, JourEnum::VENDREDI, '14:00', '21:00'],
            [115, JourEnum::SAMEDI,   '07:00', '21:00'],
            [115, JourEnum::DIMANCHE, '08:00', '18:00'],

            // Laverie Joffre Chantilly (idx 116) : Lun-Sam 8h-20h
            [116, JourEnum::LUNDI,    '08:00', '20:00'],
            [116, JourEnum::MARDI,    '08:00', '20:00'],
            [116, JourEnum::MERCREDI, '08:00', '20:00'],
            [116, JourEnum::JEUDI,    '08:00', '20:00'],
            [116, JourEnum::VENDREDI, '08:00', '20:00'],
            [116, JourEnum::SAMEDI,   '08:00', '20:00'],

            // Laverie Paris Chantilly (idx 117) : 7j/7, Dim 9h-18h
            [117, JourEnum::LUNDI,    '08:00', '20:00'],
            [117, JourEnum::MARDI,    '08:00', '20:00'],
            [117, JourEnum::MERCREDI, '08:00', '20:00'],
            [117, JourEnum::JEUDI,    '08:00', '20:00'],
            [117, JourEnum::VENDREDI, '08:00', '20:00'],
            [117, JourEnum::SAMEDI,   '08:00', '20:00'],
            [117, JourEnum::DIMANCHE, '09:00', '18:00'],

            // Laverie Jules Uhry - Creil (idx 118) : Lun-Sam 7h-21h
            [118, JourEnum::LUNDI,    '07:00', '21:00'],
            [118, JourEnum::MARDI,    '07:00', '21:00'],
            [118, JourEnum::MERCREDI, '07:00', '21:00'],
            [118, JourEnum::JEUDI,    '07:00', '21:00'],
            [118, JourEnum::VENDREDI, '07:00', '21:00'],
            [118, JourEnum::SAMEDI,   '07:00', '21:00'],

            // ── Laverie République Creil (idx 119) ───────────────────────────
            // Lun-Ven : coupure méridienne  |  Sam : journée continue  |  Dim : demi-journée
            [119, JourEnum::LUNDI,    '08:00', '12:30'],
            [119, JourEnum::LUNDI,    '14:30', '20:00'],
            [119, JourEnum::MARDI,    '08:00', '12:30'],
            [119, JourEnum::MARDI,    '14:30', '20:00'],
            [119, JourEnum::MERCREDI, '08:00', '12:30'],
            [119, JourEnum::MERCREDI, '14:30', '20:00'],
            [119, JourEnum::JEUDI,    '08:00', '12:30'],
            [119, JourEnum::JEUDI,    '14:30', '20:00'],
            [119, JourEnum::VENDREDI, '08:00', '12:30'],
            [119, JourEnum::VENDREDI, '14:30', '20:00'],
            [119, JourEnum::SAMEDI,   '08:00', '20:00'],
            [119, JourEnum::DIMANCHE, '09:00', '15:00'],

            // Laverie Pont-Maxence (idx 120) : Lun-Sam 7h-21h
            [120, JourEnum::LUNDI,    '07:00', '21:00'],
            [120, JourEnum::MARDI,    '07:00', '21:00'],
            [120, JourEnum::MERCREDI, '07:00', '21:00'],
            [120, JourEnum::JEUDI,    '07:00', '21:00'],
            [120, JourEnum::VENDREDI, '07:00', '21:00'],
            [120, JourEnum::SAMEDI,   '07:00', '21:00'],

            // Laverie Foch Maxence (idx 121) : Lun-Ven 8h-20h, Sam 8h-18h
            [121, JourEnum::LUNDI,    '08:00', '20:00'],
            [121, JourEnum::MARDI,    '08:00', '20:00'],
            [121, JourEnum::MERCREDI, '08:00', '20:00'],
            [121, JourEnum::JEUDI,    '08:00', '20:00'],
            [121, JourEnum::VENDREDI, '08:00', '20:00'],
            [121, JourEnum::SAMEDI,   '08:00', '18:00'],

            // ── Laverie Verberie (idx 122) ────────────────────────────────────
            // Rythme village : coupure déjeuner tous les jours
            [122, JourEnum::LUNDI,    '08:00', '12:00'],
            [122, JourEnum::LUNDI,    '14:00', '19:00'],
            [122, JourEnum::MARDI,    '08:00', '12:00'],
            [122, JourEnum::MARDI,    '14:00', '19:00'],
            [122, JourEnum::MERCREDI, '08:00', '12:00'],
            [122, JourEnum::MERCREDI, '14:00', '19:00'],
            [122, JourEnum::JEUDI,    '08:00', '12:00'],
            [122, JourEnum::JEUDI,    '14:00', '19:00'],
            [122, JourEnum::VENDREDI, '08:00', '12:00'],
            [122, JourEnum::VENDREDI, '14:00', '19:00'],
            [122, JourEnum::SAMEDI,   '08:00', '12:00'],
            [122, JourEnum::SAMEDI,   '14:00', '19:00'],

            // ── Laverie Nanteuil (idx 123) ────────────────────────────────────
            // Rythme village : coupure déjeuner
            [123, JourEnum::LUNDI,    '08:00', '12:00'],
            [123, JourEnum::LUNDI,    '14:00', '19:00'],
            [123, JourEnum::MARDI,    '08:00', '12:00'],
            [123, JourEnum::MARDI,    '14:00', '19:00'],
            [123, JourEnum::MERCREDI, '08:00', '12:00'],
            [123, JourEnum::MERCREDI, '14:00', '19:00'],
            [123, JourEnum::JEUDI,    '08:00', '12:00'],
            [123, JourEnum::JEUDI,    '14:00', '19:00'],
            [123, JourEnum::VENDREDI, '08:00', '12:00'],
            [123, JourEnum::VENDREDI, '14:00', '19:00'],
            [123, JourEnum::SAMEDI,   '08:00', '12:00'],
            [123, JourEnum::SAMEDI,   '14:00', '19:00'],

            // Laverie Luzarches (idx 124) : Lun-Sam 8h-20h
            [124, JourEnum::LUNDI,    '08:00', '20:00'],
            [124, JourEnum::MARDI,    '08:00', '20:00'],
            [124, JourEnum::MERCREDI, '08:00', '20:00'],
            [124, JourEnum::JEUDI,    '08:00', '20:00'],
            [124, JourEnum::VENDREDI, '08:00', '20:00'],
            [124, JourEnum::SAMEDI,   '08:00', '20:00'],
        ];

        foreach ($horaires as [$lavIdx, $jour, $debut, $fin]) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $lavIdx, Laverie::class);
            $fermeture = new LaverieFermeture();
            $fermeture->setLaverie($laverie);
            $fermeture->setJour($jour);
            $fermeture->setHeureDebut(new \DateTime($debut));
            $fermeture->setHeureFin(new \DateTime($fin));
            $fermeture->setDateAjout($now);
            $fermeture->setDateModification($now);
            $manager->persist($fermeture);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [LaverieFixtures::class];
    }
}
