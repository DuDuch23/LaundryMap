<?php

namespace App\Controller\Api\Admin;

use App\Entity\MotInjurieux;
use App\Repository\MotInjurieuxRepository;
use Doctrine\ORM\EntityManagerInterface;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class ApiAdminMotsInterditController extends AbstractController
{
    private const PAR_PAGE = 30;

    #[Route('/api/admin/mots-interdits', name: 'api_admin_mots_interdits_liste', methods: ['GET'])]
    public function liste(Request $request, MotInjurieuxRepository $repo): JsonResponse
    {
        $page      = max(1, $request->query->getInt('page', 1));
        $recherche = trim((string) $request->query->get('q', ''));

        $qb = $repo->createSearchQueryBuilder($recherche !== '' ? $recherche : null);

        $pagerfanta = new Pagerfanta(new QueryAdapter($qb));
        $pagerfanta->setMaxPerPage(self::PAR_PAGE);
        $pagerfanta->setCurrentPage(min($page, max(1, $pagerfanta->getNbPages())));

        $mots = [];
        foreach ($pagerfanta->getCurrentPageResults() as $m) {
            $mots[] = ['id' => $m->getId(), 'label' => $m->getLabel()];
        }

        return $this->json([
            'mots'  => $mots,
            'total' => $pagerfanta->getNbResults(),
            'pagination' => [
                'pageCourante'    => $pagerfanta->getCurrentPage(),
                'totalPages'      => $pagerfanta->getNbPages(),
                'totalResultats'  => $pagerfanta->getNbResults(),
                'parPage'         => self::PAR_PAGE,
                'aPageSuivante'   => $pagerfanta->hasNextPage(),
                'aPagePrecedente' => $pagerfanta->hasPreviousPage(),
            ],
        ]);
    }

    #[Route('/api/admin/mots-interdits', name: 'api_admin_mots_interdits_creer', methods: ['POST'])]
    public function creer(
        Request $request,
        MotInjurieuxRepository $repo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data  = json_decode($request->getContent(), true) ?? [];
        $label = mb_strtolower(trim((string) ($data['label'] ?? '')), 'UTF-8');

        if ($label === '') {
            return $this->json(['message' => 'Le mot est requis.'], 400);
        }

        if (mb_strlen($label) > 255) {
            return $this->json(['message' => 'Le mot est trop long (255 caractères max).'], 400);
        }

        if ($repo->findOneBy(['label' => $label])) {
            return $this->json(['message' => 'Ce mot existe déjà dans la liste.'], 409);
        }

        $mot = (new MotInjurieux())->setLabel($label);
        $em->persist($mot);
        $em->flush();

        return $this->json(['id' => $mot->getId(), 'label' => $mot->getLabel()], 201);
    }

    #[Route('/api/admin/mots-interdits/{id}', name: 'api_admin_mots_interdits_modifier', methods: ['PUT'], requirements: ['id' => '\\d+'])]
    public function modifier(
        int $id,
        Request $request,
        MotInjurieuxRepository $repo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $mot = $repo->find($id);
        if (!$mot) {
            return $this->json(['message' => 'Mot introuvable.'], 404);
        }

        $data  = json_decode($request->getContent(), true) ?? [];
        $label = mb_strtolower(trim((string) ($data['label'] ?? '')), 'UTF-8');

        if ($label === '' || mb_strlen($label) > 255) {
            return $this->json(['message' => 'Le mot est invalide.'], 400);
        }

        $existant = $repo->findOneBy(['label' => $label]);
        if ($existant !== null && $existant->getId() !== $id) {
            return $this->json(['message' => 'Ce mot existe déjà dans la liste.'], 409);
        }

        $mot->setLabel($label);
        $em->flush();

        return $this->json(['id' => $mot->getId(), 'label' => $mot->getLabel()]);
    }

    #[Route('/api/admin/mots-interdits/{id}', name: 'api_admin_mots_interdits_supprimer', methods: ['DELETE'], requirements: ['id' => '\\d+'])]
    public function supprimer(
        int $id,
        MotInjurieuxRepository $repo,
        EntityManagerInterface $em,
    ): JsonResponse {
        $mot = $repo->find($id);
        if (!$mot) {
            return $this->json(['message' => 'Mot introuvable.'], 404);
        }

        $em->remove($mot);
        $em->flush();

        return $this->json(['message' => 'Mot supprimé.']);
    }
}
