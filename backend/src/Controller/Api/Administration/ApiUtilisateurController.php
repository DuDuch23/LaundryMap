<?php

namespace App\Controller\Api\Administration;

use App\Repository\UtilisateurRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiUtilisateurController extends AbstractController
{
    #[Route('/api/admin/utilisateurs', name: 'api_admin_utilisateurs_liste', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function getUtilisateurs(UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        $utilisateurs = $utilisateurRepository->findAll();
        
        $tableauFormate = [];
        $compteEnAttente = 0;

        foreach ($utilisateurs as $user) {
            $pro = $user->getProfessionnel();
            $userData = [
                'id' => $user->getId(),
                'prenom' => $user->getPrenom(),
                'nom' => $user->getNom(),
                'email' => $user->getEmail(),
            ];

            if ($pro) {
                // 1. STATUT PROFESSIONNEL (Ultra-robuste)
                $statutBrut = $pro->getStatut();
                // On récupère la "value" (ex: 'Validé') si c'est un BackedEnum, sinon le nom
                $statutNom = $statutBrut instanceof \BackedEnum ? $statutBrut->value : ($statutBrut instanceof \UnitEnum ? $statutBrut->name : (string) $statutBrut);

                $statutReact = match($statutNom) {
                    'STATUT_VALIDE', 'Validé' => 'Validée', 
                    'STATUT_REFUSE', 'Refusé' => 'Refuser', 
                    'STATUT_BANNI', 'Banni'   => 'Banni',
                    default                   => 'En attente'
                };

                if ($statutReact === 'En attente') {
                    $compteEnAttente++;
                }

                // 2. ADRESSE
                $adresse = $pro->getAdresse();
                if ($adresse) {
                    $userData['ville'] = $adresse->getVille();
                    $userData['codePostal'] = (string) $adresse->getCodePostal();
                }

                // 3. LAVERIES (Traduction en couleurs)
                $laveriesData = [];
                foreach ($pro->getLaveries() as $laverie) {
                    $statutLavBrut = $laverie->getStatut();
                    $statutLavStr = $statutLavBrut instanceof \BackedEnum ? $statutLavBrut->value : ($statutLavBrut instanceof \UnitEnum ? $statutLavBrut->name : (string) $statutLavBrut);
                    
                    $couleur = match($statutLavStr) {
                        'STATUT_VALIDE', 'Validé'           => 'vert',
                        'STATUT_REFUSE', 'Refusé', 'Refuser'=> 'rouge',
                        'STATUT_BANNI', 'Banni'             => 'noir',
                        'STATUT_EN_ATTENTE', 'En attente'   => 'orange',
                        default                             => 'orange'
                    };

                    $laveriesData[] = [
                        'id' => $laverie->getId(),
                        'nom' => $laverie->getNomEtablissement(), 
                        'statut' => $couleur, 
                    ];
                }

                $userData['professionnel'] = [
                    'id' => $pro->getId(),
                    'siren' => (string) $pro->getSiren(),
                    'statut' => $statutReact,
                    'laveries' => $laveriesData
                ];
            }

            $tableauFormate[] = $userData;
        }

        return $this->json([
            'totalEnAttente' => $compteEnAttente,
            'utilisateurs' => $tableauFormate
        ]);
    }
}