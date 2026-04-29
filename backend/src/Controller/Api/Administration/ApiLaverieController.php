<?php

namespace App\Controller\Api\Administration;

use App\Entity\LaverieHistoriqueInteraction;
use App\Repository\LaverieRepository;
use App\Service\Professionnel\ProfessionnelLaverieFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Pagerfanta\Doctrine\ORM\QueryAdapter;
use Pagerfanta\Pagerfanta;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;

class ApiLaverieController extends AbstractController
{
    #[Route('/api/laveries/{id}', name: 'api_public_laverie_detail', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function getPublicLaverieDetail(
        int $id,
        Request $request,
        LaverieRepository $laverieRepository,
        ProfessionnelLaverieFormatterService $formatter,
    ): JsonResponse {
        $laverie = $laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimee_le() !== null || $laverie->getStatut()->value !== 'Validée') {
            return $this->json(['message' => 'Laverie introuvable'], 404);
        }

        $adresse = $laverie->getAdresse();
        $gallery = $formatter->buildGalleryResponse($laverie, $request);
        $equipements = $formatter->buildEquipementsResponse($laverie);
        $horaires = $formatter->buildHorairesResponse($laverie);
        $services = $formatter->buildServicesResponse($laverie);
        $paiements = $formatter->buildPaiementsResponse($laverie);
        $commentaires = $formatter->buildCommentairesResponse($laverie);
        $mainImage = $gallery[0]['image'] ?? null;

        if ($mainImage === null && $laverie->getLogo() !== null && $formatter->isProjectManagedMediaPath($laverie->getLogo()->getEmplacement())) {
            $mainImage = $formatter->toPublicMediaUrl($laverie->getLogo()->getEmplacement(), $request);
        }

        return $this->json([
            'id' => $laverie->getId(),
            'nom' => $laverie->getNomEtablissement(),
            'statut' => 'Validée',
            'description' => $laverie->getDescription(),
            'adresse' => $adresse?->getAdresse(),
            'codePostal' => $adresse?->getCodePostal(),
            'ville' => $adresse?->getVille(),
            'latitude' => $adresse?->getLatitude(),
            'longitude' => $adresse?->getLongitude(),
            'distance' => null,
            'wiLineReference' => $laverie->getWiLineReference(),
            'image' => $mainImage,
            'images' => $gallery,
            'equipements' => $equipements,
            'services' => $services,
            'paiements' => $paiements,
            'commentaires' => $commentaires,
            'horaires' => $horaires,
            'commentairesCount' => $formatter->countLaverieCommentaires($laverie),
            'noteMoyenne' => $formatter->getLaverieNoteMoyenne($laverie),
            'professionnel' => [
                'id' => $laverie->getProfessionnel()?->getId(),
                'nom' => $laverie->getProfessionnel()?->getUtilisateur()?->getNom(),
                'prenom' => $laverie->getProfessionnel()?->getUtilisateur()?->getPrenom(),
            ],
        ]);
    }

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

    #[Route('/api/admin/laveries/{id}', name: 'api_admin_laverie_detail', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getLaverieDetail(int $id, LaverieRepository $laverieRepository): JsonResponse
    {
        $laverie = $laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimee_le() !== null) {
            return $this->json(['message' => 'Laverie introuvable'], 404);
        }

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

        // Images
        $images = [];
        foreach ($laverie->getMedias() as $mediaAssoc) {
            if ($mediaAssoc->getMedia()) {
                $images[] = [
                    'url' => '/uploads/medias/' . $mediaAssoc->getMedia()->getEmplacement(),
                    'description' => $mediaAssoc->getDescription(),
                ];
            }
        }

        // Equipements
        $equipements = [];
        foreach ($laverie->getEquipements() as $equipement) {
            $equipements[] = [
                'id' => $equipement->getId(),
                'nom' => $equipement->getNom(),
                'type' => $equipement->getType(),
                'capacite' => $equipement->getCapacite(),
                'tarif' => $equipement->getTarif(),
                'duree' => $equipement->getDuree(),
            ];
        }

        // Horaires
        $horaires = [];
        foreach ($laverie->getFermetures() as $fermeture) {
            $horaires[] = [
                'jour' => $fermeture->getJour()->value,
                'heureDebut' => $fermeture->getHeureDebut()->format('H:i'),
                'heureFin' => $fermeture->getHeureFin()->format('H:i'),
            ];
        }

        $pro = $laverie->getProfessionnel();

        return $this->json([
            'id' => $laverie->getId(),
            'nom' => $laverie->getNomEtablissement(),
            'statut' => $statutReact,
            'description' => $laverie->getDescription(),
            'adresse' => $adresseComplete,
            'wiLineReference' => $laverie->getWiLineReference(),
            'images' => $images,
            'equipements' => $equipements,
            'horaires' => $horaires,
            'professionnel' => [
                'utilisateurId' => $pro->getUtilisateur()->getId(),
                'id' => $pro->getId(),
                'nom' => $pro->getUtilisateur()->getNom(),
                'prenom' => $pro->getUtilisateur()->getPrenom(),
            ],
        ]);
    }

    #[Route('/api/admin/laveries/{id}/statut', name: 'api_admin_laverie_statut', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatut(int $id, Request $request, LaverieRepository $laverieRepository, EntityManagerInterface $em, MailerInterface $mailer, LoggerInterface $logger): JsonResponse
    {
        $administrateur = $this->getUser();

        if (!$administrateur) {
            return $this->json(['message' => 'Action non autorisée. Aucun administrateur connecté.'], 403);
        }

        $laverie = $laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimee_le() !== null) {
            return $this->json(['message' => 'Laverie introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? null;
        $motif = $data['commentaire'] ?? null;

        if (!in_array($action, ['accepter', 'refuser'])) {
            return $this->json(['message' => 'Action invalide'], 400);
        }

        if ($action === 'refuser' && empty(trim($motif))) {
            return $this->json(['message' => 'Un motif de refus est obligatoire.'], 400);
        }

        $pro = $laverie->getProfessionnel();
        if (!$pro) {
            return $this->json(['message' => 'La laverie n\'a pas de professionnel rattaché.'], 500);
        }
        $user = $pro->getUtilisateur();
        if (!$user) {
            return $this->json(['message' => 'Le professionnel n\'a pas d\'utilisateur rattaché.'], 500);
        }

        $historique = new LaverieHistoriqueInteraction();
        $historique->setAdministrateur($administrateur);
        $historique->setLaverie($laverie);
        $historique->setDate(new \DateTime());

        if ($action === 'accepter') {
            $laverie->setStatut(\App\Enum\StatutLaverieEnum::STATUT_VALIDEE);
            $historique->setAction('Validation de la laverie');
            $historique->setMotifAction($motif ?: 'Laverie vérifiée et validée.');
        } else {
            $laverie->setStatut(\App\Enum\StatutLaverieEnum::STATUT_REFUSEE);
            $historique->setAction('Refus de la laverie');
            $historique->setMotifAction($motif ?: 'Laverie refusée par l\'administration.');
        }

        try {
            $em->persist($historique);
            $em->flush();
        } catch (\Throwable $e) {
            $logger->error('Echec flush statut laverie', ['laverieId' => $id, 'exception' => $e]);
            return $this->json(['message' => 'Erreur lors de la mise à jour en base de données.'], 500);
        }

        if ($action === 'accepter') {
            $frontendBaseUrl = $this->getParameter('app.frontend_url');
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Votre laverie "' . $laverie->getNomEtablissement() . '" a été validée !')
                ->htmlTemplate('emails/validation_laverie.html.twig')
                ->context([
                    'user' => $user,
                    'laverie' => $laverie,
                    'motif' => $motif,
                    'loginUrl' => $frontendBaseUrl . '/connexion',
                ]);
        } else {
            $email = (new TemplatedEmail())
                ->from($this->getParameter('mailer_from'))
                ->to($user->getEmail())
                ->subject('Information concernant votre laverie "' . $laverie->getNomEtablissement() . '"')
                ->htmlTemplate('emails/refus_laverie.html.twig')
                ->context([
                    'user' => $user,
                    'laverie' => $laverie,
                    'motif' => $motif,
                ]);
        }

        try {
            $mailer->send($email);
        } catch (\Throwable $e) {
            $logger->error('Echec envoi mail statut laverie', ['laverieId' => $id, 'action' => $action, 'exception' => $e]);
        }

        return $this->json(['message' => 'Statut de la laverie mis à jour avec succès']);
    }
}
