<?php

namespace App\Controller\Api;

use App\Entity\Langue;
use App\Repository\LangueRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Response;


class ApiLangueController extends AbstractController
{
    #[Route('/api/langues', name: 'api_langues', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function get(LangueRepository $langueRepository, EntityManagerInterface $entityManager): JsonResponse{
        $langues = $langueRepository->findAll();

        return $this->json($langues, Response::HTTP_OK, [], ['groups' => 'langue:read']);
    }
}