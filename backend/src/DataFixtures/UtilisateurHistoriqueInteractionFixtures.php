<?php

namespace App\DataFixtures;

use App\Entity\Administrateur;
use App\Entity\Utilisateur;
use App\Entity\UtilisateurHistoriqueInteraction;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UtilisateurHistoriqueInteractionFixtures extends Fixture implements DependentFixtureInterface
{
    private array $historiques = [
        ['admin_idx' => 0, 'utilisateur_idx' => 0, 'action' => 'Validation du compte',   'motif' => 'Compte vérifié, email confirmé',            'date' => '-30 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 1, 'action' => 'Validation du compte',   'motif' => 'Toutes les conditions remplies',             'date' => '-29 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 2, 'action' => 'Validation du compte',   'motif' => 'Inscription validée',                        'date' => '-28 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 3, 'action' => 'Validation du compte',   'motif' => 'Compte activé manuellement',                 'date' => '-27 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 4, 'action' => 'Mise en attente',         'motif' => "Vérification d'identité en cours",           'date' => '-26 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 2, 'action' => 'Suspension du compte',   'motif' => 'Comportement signalé plusieurs fois',        'date' => '-25 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 0, 'action' => 'Réinitialisation MDP',   'motif' => 'Demande utilisateur suite à oubli',          'date' => '-24 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 1, 'action' => 'Mise en attente',         'motif' => 'Activité suspecte détectée',                 'date' => '-23 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 3, 'action' => 'Validation du compte',   'motif' => 'Second examen du dossier, validé',           'date' => '-22 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 4, 'action' => 'Validation du compte',   'motif' => 'Documents fournis conformes',                'date' => '-21 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 0, 'action' => 'Avertissement',           'motif' => 'Contenu inapproprié publié',                 'date' => '-20 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 1, 'action' => 'Levée de suspension',    'motif' => 'Situation clarifiée, compte réactivé',       'date' => '-19 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 2, 'action' => 'Avertissement',           'motif' => 'Utilisation abusive du service de signalement', 'date' => '-18 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 3, 'action' => 'Réinitialisation MDP',   'motif' => 'Compromission du mot de passe suspectée',    'date' => '-17 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 4, 'action' => 'Suspension du compte',   'motif' => 'Violation des conditions générales',         'date' => '-15 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 0, 'action' => 'Clôture du compte',       'motif' => 'Demande de suppression par utilisateur',     'date' => '-12 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 1, 'action' => 'Validation du compte',   'motif' => 'Réouverture après appel accepté',            'date' => '-10 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 2, 'action' => 'Levée de suspension',    'motif' => 'Engagement de bonnes pratiques reçu',        'date' => '-7 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 3, 'action' => 'Avertissement',           'motif' => 'Tentatives de connexion répétées',           'date' => '-5 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 4, 'action' => 'Mise en attente',         'motif' => 'Nouveau signalement reçu, en cours d\'examen', 'date' => '-3 days'],
        ['admin_idx' => 0, 'utilisateur_idx' => 0, 'action' => 'Note interne',            'motif' => 'Profil vérifié pour partenariat professionnel', 'date' => '-2 days'],
        ['admin_idx' => 1, 'utilisateur_idx' => 1, 'action' => 'Validation du compte',   'motif' => 'Mise à jour des informations confirmée',     'date' => '-1 days'],
        ['admin_idx' => 2, 'utilisateur_idx' => 2, 'action' => 'Note interne',            'motif' => 'Utilisateur premium, suivi prioritaire',     'date' => 'now'],
        ['admin_idx' => 0, 'utilisateur_idx' => 3, 'action' => 'Réinitialisation MDP',   'motif' => 'Connexion depuis un pays inhabituel',        'date' => 'now'],
        ['admin_idx' => 1, 'utilisateur_idx' => 4, 'action' => 'Note interne',            'motif' => 'Dossier transmis au service juridique',      'date' => 'now'],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->historiques as $data) {
            $admin = $this->getReference(AdministrateurFixtures::ADMIN_REFERENCE_PREFIX . $data['admin_idx'], Administrateur::class);
            $utilisateur = $this->getReference(UtilisateurFixtures::UTILISATEUR_REFERENCE_PREFIX . $data['utilisateur_idx'], Utilisateur::class);

            $historique = new UtilisateurHistoriqueInteraction();
            $historique->setAdministrateur($admin);
            $historique->setUtilisateur($utilisateur);
            $historique->setAction($data['action']);
            $historique->setMotifAction($data['motif']);
            $historique->setDate(new \DateTime($data['date']));
            $manager->persist($historique);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            AdministrateurFixtures::class,
            UtilisateurFixtures::class,
        ];
    }
}
