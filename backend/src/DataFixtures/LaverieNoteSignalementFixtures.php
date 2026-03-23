<?php

namespace App\DataFixtures;

use App\Entity\LaverieNote;
use App\Entity\LaverieNoteSignalement;
use App\Entity\Utilisateur;
use App\Enum\MotifEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieNoteSignalementFixtures extends Fixture implements DependentFixtureInterface
{
    private array $signalements = [
        ['note_idx' => 4, 'utilisateur_idx' => 4, 'motif' => MotifEnum::MOTIF_CONTENU_INAPPROPRIE,    'commentaire' => 'Ce commentaire contient des informations trompeuses.'],
        ['note_idx' => 0, 'utilisateur_idx' => 4, 'motif' => MotifEnum::MOTIF_PUBLICITE_NON_AUTORISEE, 'commentaire' => null],
        ['note_idx' => 2, 'utilisateur_idx' => 4, 'motif' => MotifEnum::MOTIF_AUTRE,                   'commentaire' => 'Commentaire suspect.'],
    ];

    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        foreach ($this->signalements as $data) {
            $note = $this->getReference(LaverieNoteFixtures::NOTE_REFERENCE_PREFIX . $data['note_idx'], LaverieNote::class);
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);

            $signalement = new LaverieNoteSignalement();
            $signalement->setLaverieNote($note);
            $signalement->setUtilisateur($utilisateur);
            $signalement->setDate($now);
            $signalement->setMotif($data['motif']);
            $signalement->setCommentaire($data['commentaire']);
            $manager->persist($signalement);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            LaverieNoteFixtures::class,
            UtilisateurFixtures::class,
        ];
    }
}

