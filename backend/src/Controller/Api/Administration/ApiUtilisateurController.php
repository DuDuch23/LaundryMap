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
                'statut' => $user->getStatut(),
            ];

            if ($pro) {
                //STATUT PROFESSIONNEL
                $statutNom = $pro->getStatut()->name;

                $statutReact = match($statutNom) {
                    'STATUT_VALIDE' => 'Validé',
                    'STATUT_REFUSE' => 'Refusé',
                    'STATUT_BANNI'  => 'Banni',
                    default         => 'En attente'
                };

                if ($statutReact === 'En attente') {
                    $compteEnAttente++;
                }

                //ADRESSE
                $adresse = $pro->getAdresse();
                if ($adresse) {
                    $userData['ville'] = $adresse->getVille();
                    $userData['codePostal'] = (string) $adresse->getCodePostal();
                }

                //LAVERIES
                $laveriesData = [];
                foreach ($pro->getLaveries() as $laverie) {
                    $couleur = match($laverie->getStatut()->name) {
                        'STATUT_VALIDEE' => 'vert',
                        'STATUT_REFUSEE' => 'rouge',
                        default          => 'orange'
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