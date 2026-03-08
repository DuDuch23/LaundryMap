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

    private array $notes = [
        ['laverie_idx' => 0, 'utilisateur_idx' => 3, 'note' => 5, 'commentaire' => 'Excellent service, machines toujours propres !'],
        ['laverie_idx' => 0, 'utilisateur_idx' => 4, 'note' => 4, 'commentaire' => 'Très bien, un peu cher mais efficace.'],
        ['laverie_idx' => 1, 'utilisateur_idx' => 3, 'note' => 3, 'commentaire' => 'Correct mais manque de machines disponibles.'],
        ['laverie_idx' => 1, 'utilisateur_idx' => 4, 'note' => 5, 'commentaire' => 'Parfait, je recommande vivement !'],
        ['laverie_idx' => 2, 'utilisateur_idx' => 3, 'note' => 2, 'commentaire' => 'Déçu, une machine en panne lors de ma visite.'],
        ['laverie_idx' => 3, 'utilisateur_idx' => 4, 'note' => 4, 'commentaire' => 'Bonne laverie, propre et bien entretenue.'],
    ];

    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        foreach ($this->notes as $i => $data) {
            $laverie = $this->getReference(LaverieFixtures::LAVERIE_REFERENCE_PREFIX . $data['laverie_idx'], Laverie::class);
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);

            $note = new LaverieNote();
            $note->setLaverie($laverie);
            $note->setUtilisateur($utilisateur);
            $note->setNote($data['note']);
            $note->setNoteLe($now);
            $note->setCommentaire($data['commentaire']);
            $note->setCommenteLe($now);
            $manager->persist($note);
            $this->addReference(self::NOTE_REFERENCE_PREFIX . $i, $note);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieFixtures::class,
            UtilisateurFixtures::class,
        ];
    }
}

