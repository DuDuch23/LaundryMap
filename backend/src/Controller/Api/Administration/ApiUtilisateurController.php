<?php

namespace App\Controller\Api\Administration;

use App\Repository\UtilisateurRepository;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiUtilisateurController extends AbstractController
{
    #[Route('/api/admin/utilisateurs', name: 'api_admin_utilisateurs_liste', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function getUtilisateurs(
        Request $request,
        UtilisateurRepository $utilisateurRepository
    ): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $maxParPage = 10;

        $qb = $utilisateurRepository->createFilteredQueryBuilder(
            $request->query->get('statut'),
            $request->query->get('type'),
            $request->query->get('proprietaire'),
            $request->query->get('ordre')
        );

        $adapter = new QueryAdapter($qb);
        $pagerfanta = new Pagerfanta($adapter);
        $pagerfanta->setMaxPerPage($maxParPage);
        $pagerfanta->setCurrentPage($page);

        $tableauFormate = [];
        foreach ($pagerfanta->getCurrentPageResults() as $user) {
            $pro = $user->getProfessionnel();

            $statutUserNom = $user->getStatut()->name;
            $statutUserReact = match($statutUserNom) {
                'STATUT_VALIDE' => 'Validé',
                'STATUT_REFUSE' => 'Refusé',
                'STATUT_BANNI'  => 'Banni',
                default         => 'En attente'
            };

            $userData = [
                'id' => $user->getId(),
                'prenom' => $user->getPrenom(),
                'nom' => $user->getNom(),
                'email' => $user->getEmail(),
                'statut' => $statutUserReact,
            ];

            if ($pro) {
                $statutProNom = $pro->getStatut()->name;
                $statutProReact = match($statutProNom) {
                    'STATUT_VALIDE' => 'Validé',
                    'STATUT_REFUSE' => 'Refusé',
                    'STATUT_BANNI'  => 'Banni',
                    default         => 'En attente'
                };

                $adresse = $pro->getAdresse();
                if ($adresse) {
                    $userData['ville'] = $adresse->getVille();
                    $userData['codePostal'] = (string) $adresse->getCodePostal();
                }

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
                    'statut' => $statutProReact,
                    'laveries' => $laveriesData
                ];
            }

            $tableauFormate[] = $userData;
        }

        return $this->json([
            'totalEnAttente' => $utilisateurRepository->countEnAttente(),
            'utilisateurs' => $tableauFormate,
            'pagination' => [
                'pageCourante' => $pagerfanta->getCurrentPage(),
                'totalPages' => $pagerfanta->getNbPages(),
                'totalResultats' => $pagerfanta->getNbResults(),
                'parPage' => $maxParPage,
                'aPageSuivante' => $pagerfanta->hasNextPage(),
                'aPagePrecedente' => $pagerfanta->hasPreviousPage(),
            ]
        ]);
    }
}
