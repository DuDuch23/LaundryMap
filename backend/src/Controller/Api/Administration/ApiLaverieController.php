<?php

namespace App\Controller\Api\Administration;

use App\Repository\LaverieRepository;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiLaverieController extends AbstractController
{
    #[Route('/api/admin/laveries', name: 'api_admin_laveries_liste', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getLaveries(
        Request $request,
        LaverieRepository $laverieRepository
    ): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $maxParPage = 10;

        $qb = $laverieRepository->createFilteredQueryBuilder(
            $request->query->get('statut'),
            $request->query->get('ordre')
        );

        $adapter = new QueryAdapter($qb);
        $pagerfanta = new Pagerfanta($adapter);
        $pagerfanta->setMaxPerPage($maxParPage);
        $pagerfanta->setCurrentPage($page);

        $tableauFormate = [];
        foreach ($pagerfanta->getCurrentPageResults() as $laverie) {
            $statutReact = match($laverie->getStatut()->name) {
                'STATUT_VALIDEE' => 'Validée',
                'STATUT_REFUSEE' => 'Refusée',
                default          => 'En attente'
            };

            $adresseLav = $laverie->getAdresse();
            $adresseComplete = 'Adresse non renseignée';
            if ($adresseLav) {
                $adresseComplete = sprintf('%s, %s %s', $adresseLav->getAdresse(), $adresseLav->getCodePostal(), $adresseLav->getVille());
            }

            $image = null;
            $premierMediaAssoc = $laverie->getMedias()->first();
            if ($premierMediaAssoc && $premierMediaAssoc->getMedia()) {
                $image = '/uploads/medias/' . $premierMediaAssoc->getMedia()->getEmplacement();
            }

            $pro = $laverie->getProfessionnel();

            $tableauFormate[] = [
                'id' => $laverie->getId(),
                'nom' => $laverie->getNomEtablissement(),
                'statut' => $statutReact,
                'adresse' => $adresseComplete,
                'distance' => null,
                'image' => $image,
                'professionnel' => [
                    'id' => $pro->getId(),
                    'nom' => $pro->getUtilisateur()->getNom(),
                    'prenom' => $pro->getUtilisateur()->getPrenom(),
                ],
            ];
        }

        return $this->json([
            'totalEnAttente' => $laverieRepository->countEnAttente(),
            'laveries' => $tableauFormate,
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
