<?php

namespace App\Controller\Api\Administration;

use App\Repository\UtilisateurRepository;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
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


    #[Route('/api/admin/utilisateurs/{id}', name: 'api_admin_utilisateur_detail', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function getUtilisateurDetail(int $id, UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        $user = $utilisateurRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

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

            $adressePro = $pro->getAdresse();
            if ($adressePro) {
                $userData['ville'] = $adressePro->getVille();
                $userData['codePostal'] = (string) $adressePro->getCodePostal();
            }

            //INFO
            $laveriesData = [];
            foreach ($pro->getLaveries() as $laverie) {
                
                if ($laverie->getSupprimee_le() !== null) {
                    continue;
                }

                $couleur = match($laverie->getStatut()->name) {
                    'STATUT_VALIDEE' => 'Validé',
                    'STATUT_REFUSEE' => 'Refusé',
                    default          => 'En attente'
                };

                //SI ADRESSE COMPLETE
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

                $laveriesData[] = [
                    'id' => $laverie->getId(),
                    'nom' => $laverie->getNomEtablissement(),
                    'statut' => $couleur,
                    'adresse' => $adresseComplete,
                    'distance' => null,
                    'image' => $image,
                ];
            }

            $userData['professionnel'] = [
                'id' => $pro->getId(),
                'siren' => (string) $pro->getSiren(),
                'statut' => $statutProReact,
                'laveries' => $laveriesData
            ];
        }

        return $this->json($userData);
    }

    #[Route('/api/admin/utilisateurs/{id}/statut', name: 'api_admin_utilisateur_statut', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function updateStatut(int $id, Request $request, UtilisateurRepository $utilisateurRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $utilisateurRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? null;

        if (!in_array($action, ['accepter', 'refuser'])) {
            return $this->json(['message' => 'Action invalide'], 400);
        }

        $pro = $user->getProfessionnel();

        if ($action === 'accepter') {
            $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_VALIDE);
            if ($pro) {
                $pro->setStatut(\App\Enum\StatutProfessionnelEnum::STATUT_VALIDE);
                $pro->setDateValidation(new \DateTime());
            }
        } else {
            $user->setStatut(\App\Enum\StatutUtilisateurEnum::STATUT_REFUSE);
            if ($pro) {
                $pro->setStatut(\App\Enum\StatutProfessionnelEnum::STATUT_REFUSE);
            }
        }

        $em->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès']);
    }
}
