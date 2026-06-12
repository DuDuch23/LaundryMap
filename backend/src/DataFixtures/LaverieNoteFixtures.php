<?php

namespace App\DataFixtures;

use App\Entity\Laverie;
use App\Entity\LaverieNote;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieNoteFixtures extends Fixture implements DependentFixtureInterface
{
    public const NOTE_REFERENCE_PREFIX = 'laverie_note_';

    private array $reviewTemplates = [
        5 => [
            'Très bonne expérience : machines récentes, locaux propres et cycle rapide.',
            'Service impeccable, j’ai pu laver et sécher mon linge en moins d’une heure.',
            'Laverie très propre, agréable à utiliser et bien organisée.',
        ],
        4 => [
            'Laverie pratique et bien entretenue, il manque juste un peu de place aux heures de pointe.',
            'Bon rapport qualité/prix, l’accueil est correct et les machines fonctionnent bien.',
            'Globalement satisfait, le seul point faible est l’attente quand il y a du monde.',
        ],
        3 => [
            'Service correct, mais j’ai attendu un peu avant qu’une machine se libère.',
            'Laverie convenable pour un lavage rapide, sans plus.',
            'Expérience moyenne : pratique, mais certains équipements mériteraient d’être renouvelés.',
        ],
        2 => [
            'Déçu par la disponibilité des machines et l’état général de l’espace.',
            'Pas terrible : un peu sale et il a fallu attendre longtemps.',
            'Je m’attendais à mieux, surtout sur la propreté et l’entretien.',
        ],
    ];

    private array $notePatterns = [
        [5, 4, 4, 3, 5],
        [4, 5, 3, 4, 4],
        [3, 4, 5, 3, 4],
        [5, 4, 3, 4, 2],
        [4, 3, 4, 5, 4],
        [5, 4, 5, 3, 4],
        [4, 4, 3, 5, 4],
    ];

    public function load(ObjectManager $manager): void
    {
        $laveriesCount = $this->getLaveriesCount();
        // On ne crée des avis qu'avec des utilisateurs standards (pas les comptes rattachés à un Professionnel).
        $standardUserIndices = UtilisateurFixtures::STANDARD_USER_INDICES;
        $usersCount = count($standardUserIndices);
        $referenceIndex = 0;

        for ($laverieIdx = 0; $laverieIdx < $laveriesCount; $laverieIdx++) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $laverieIdx, Laverie::class);
            $pattern = $this->notePatterns[$laverieIdx % count($this->notePatterns)];

            for ($slot = 0; $slot < 5; $slot++) {
                $utilisateurIdx = $standardUserIndices[($laverieIdx + $slot) % $usersCount];
                $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $utilisateurIdx, Utilisateur::class);
                $noteValue = $pattern[$slot];

                $note = new LaverieNote();
                $note->setLaverie($laverie);
                $note->setUtilisateur($utilisateur);
                $commentaire = $this->buildReviewText($laverieIdx, $slot, $noteValue);
                $noteDate = new \DateTime();
                $noteDate->modify(sprintf('-%d days', ($laverieIdx % 14) * 3 + $slot + 1));
                $commentDate = clone $noteDate;
                $commentDate->modify('+2 hours');

                $note->setNote($noteValue);
                $note->setNoteLe($noteDate);
                $note->setCommentaire($commentaire);
                $note->setCommenteLe($commentDate);
                $manager->persist($note);
                $this->addReference(self::NOTE_REFERENCE_PREFIX . $referenceIndex, $note);
                $referenceIndex++;
            }
        }

        $manager->flush();
    }

    private function getLaveriesCount(): int
    {
        $reflection = new \ReflectionClass(LaverieFixtures::class);
        $property = $reflection->getProperty('laveries');
        $property->setAccessible(true);

        return count($property->getValue(new LaverieFixtures()));
    }

    private function buildReviewText(int $laverieIdx, int $slot, int $noteValue): string
    {
        $templates = $this->reviewTemplates[$noteValue] ?? $this->reviewTemplates[4];
        $template = $templates[($laverieIdx + $slot) % count($templates)];

        $context = [
            'attente' => [
                'la machine était disponible rapidement',
                'j’ai eu un petit peu d’attente en heure de pointe',
                'l’affluence restait raisonnable',
            ],
            'proprete' => [
                'l’espace était propre',
                'les bacs et plans de pliage étaient bien entretenus',
                'le sol et les machines étaient corrects',
            ],
            'prix' => [
                'le tarif reste acceptable',
                'le prix est un peu élevé mais cohérent',
                'le rapport qualité/prix est honnête',
            ],
            'sechage' => [
                'le séchage était efficace',
                'les sèche-linge ont bien fait le travail',
                'le linge est ressorti presque sec en fin de cycle',
            ],
        ];

        $pieces = array_values($context);
        $addition = [];
        foreach ($pieces as $index => $variants) {
            $addition[] = $variants[($laverieIdx + $slot + $index) % count($variants)];
        }

        return $template . ' ' . implode(', ', $addition) . '.';
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            UtilisateurFixtures::class,
        ];
    }
}

