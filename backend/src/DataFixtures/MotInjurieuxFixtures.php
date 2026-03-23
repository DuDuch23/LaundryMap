<?php

namespace App\DataFixtures;

use App\Entity\MotInjurieux;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class MotInjurieuxFixtures extends Fixture
{
    private array $mots = [
        'enculé', 'connard', 'connasse', 'con', 'conne',
        'imbécile', 'abruti', 'abrutie', 'débile', 'attardé',
        'putain', 'pute', 'fils de pute', 'fils de pute', 'salope', 'salaud',
        'gourgandine', 'prostitué', 'nique ta mère', 'nique',
        'baiseur', 'baiseuse', 'enculé', 'ta gueule',
        'gros con', 'pauvre con', 'espèce de con', 'triple con', 'sale con',
        'couillon', 'couillonne', 'guignol', 'fumier', 
        'saloparde', 'lâche', 'enfoiré', 'enfoirée', 'salopard',
        'merde', 'bordel', 'putain de merde', 'va te faire foutre',
        'ferme ta gueule', 'ta mère', 'nul', 'nulle', 'looser', 'loser',
        'epstein', 'nazi', 'facho', 'raciste', 'sexiste',
        'fuck', 'fuck you', 'motherfucker', 'fucker', 'fucking',
        'shit', 'bullshit', 'piece of shit', 'holy shit',
        'bitch', 'son of a bitch', 'bastard', 'asshole', 'ass',
        'dick', 'dickhead', 'cock', 'prick', 'cunt',
        'idiot', 'moron', 'retard', 'stupid', 'dumbass', 'dumb',
        'loser', 'scumbag', 'jerk', 'prick', 'wanker', 'tosser',
        'twat', 'douche', 'douchebag', 'slut', 'whore', 'skank',
        'go to hell', 'shut up', 'get lost', 'drop dead',
        'racist', 'sexist', 'nazi',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->mots as $label) {
            $mot = new MotInjurieux();
            $mot->setLabel($label);
            $manager->persist($mot);
        }

        $manager->flush();
    }
}
