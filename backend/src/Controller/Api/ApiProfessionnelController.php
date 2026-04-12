<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Media;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Entity\Laverie;
use App\Enum\StatutProfessionnelEnum;
use App\Enum\StatutUtilisateurEnum;
use App\Service\ApiSirenSiretService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiProfessionnelController extends AbstractController
{
    #[Route('/api/professionnel/tableau-bord', name: 'api_tableau_bord_pro', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function tableauBordProfessionnel(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ): JsonResponse {
        try {
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json(['erreur' => 'Utilisateur non authentifié'], 401);
            }

            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            // Vérifier que le professionnel est validé
            if ($professionnel->getStatut()->value !== StatutProfessionnelEnum::STATUT_VALIDE->value) {
                return $this->json(['erreur' => 'Compte professionnel non validé'], 403);
            }

            // Récupérer uniquement les laveries du compte connecté
            $laveries = $entityManager->getRepository(Laverie::class)
                ->createQueryBuilder('l')
                ->innerJoin('l.professionnel', 'p')
                ->innerJoin('p.utilisateur', 'u')
                ->where('p = :professionnel')
                ->andWhere('u = :utilisateur')
                ->andWhere('l.supprimee_le IS NULL')
                ->setParameter('professionnel', $professionnel)
                ->setParameter('utilisateur', $user)
                ->orderBy('l.dateModification', 'DESC')
                ->getQuery()
                ->getResult();

            // Compter les laveries par statut
            $stats = [
                'total' => count($laveries),
                'validees' => 0,
                'en_attente' => 0,
                'refusees' => 0,
            ];

            foreach ($laveries as $laverie) {
                $statut = $laverie->getStatut()->value;
                if ($statut === 'Validée') {
                    $stats['validees']++;
                } elseif ($statut === 'En attente') {
                    $stats['en_attente']++;
                } elseif ($statut === 'Refusée') {
                    $stats['refusees']++;
                }
            }

            return $this->json([
                'professionnel' => [
                    'id' => $professionnel->getId(),
                    'prenom' => $professionnel->getUtilisateur()->getPrenom(),
                    'nom' => $professionnel->getUtilisateur()->getNom(),
                    'email' => $professionnel->getUtilisateur()->getEmail(),
                    'siren' => $professionnel->getSiren(),
                ],
                'stats' => $stats,
                'laveries' => array_map(function ($laverie) {
                    $logo = $laverie->getLogo();

                    return [
                        'id' => $laverie->getId(),
                        'nom' => $laverie->getNomEtablissement(),
                        'adresse' => $laverie->getAdresse()->getAdresse(),
                        'codePostal' => $laverie->getAdresse()->getCodePostal(),
                        'ville' => $laverie->getAdresse()->getVille(),
                        'statut' => $laverie->getStatut()->value,
                        'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                        'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
                        'image' => $logo ? $logo->getEmplacement() : null,
                        'imageAlt' => $logo ? $laverie->getNomEtablissement() : null,
                        'logo' => $logo ? [
                            'id' => $logo->getId(),
                            'image' => $logo->getEmplacement(),
                            'alt' => $laverie->getNomEtablissement(),
                        ] : null,
                    ];
                }, $laveries),
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'erreur' => $e->getMessage(),
                'fichier' => $e->getFile(),
                'ligne' => $e->getLine(),
            ], 500);
        }
    }

    #[Route('/api/inscription-professionnel', name: 'api_inscription-professionnel', methods: ['POST'])]
    public function inscription(
        Request $request,
        SerializerInterface $serializer,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ApiSirenSiretService $sirenService
    ): JsonResponse {
        try{

            $donnees = json_decode($request->getContent(), true);
    
            if (!$donnees) {
                return $this->json(['erreurs' => ['global' => 'Données invalides']], 400);
            }
    
            $erreursFront = [];
    
            $sirenOuSiret = trim($donnees['sirenOrSiret'] ?? '');
    
            $resultat = null;
            $existeSiren = $entityManager->getRepository(Professionnel::class)->findOneBy(['siren' => $sirenOuSiret]);
            $existeUtilisateur = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $donnees['email'] ?? null]);

            if($existeUtilisateur){
                $erreursFront['email'] = 'Cet email est déjà utilisé';
            }
    
            if(empty($sirenOuSiret)){
                $erreursFront['sirenOrSiret'] = 'Le numéro SIREN ou SIRET est requis';
            } elseif (!preg_match('/^\d{9}$/', $sirenOuSiret) && !preg_match('/^\d{14}$/', $sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Format invalide';
            }else if($existeSiren){
                $erreursFront['sirenOrSiret'] = 'Ce numéro SIREN/SIRET est déjà utilisé';
            }else {
                $resultat = $sirenService->verify($sirenOuSiret);
                if (!$resultat['valide']) {
                    $erreursFront['sirenOrSiret'] = 'Numéro SIREN/SIRET introuvable ou entreprise inactive';
                }
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $utilisateur = new Utilisateur();
            $utilisateur->setEmail($donnees['email'] ?? '');
            $utilisateur->setNom(!empty($donnees['nom']) ? $donnees['nom'] : null);
            $utilisateur->setPrenom(!empty($donnees['prenom']) ? $donnees['prenom'] : null);
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $donnees['password'] ?? ''));
            $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_EN_ATTENTE);
    
            $erreurs = $validator->validate($utilisateur, null, ['utilisateur:write']);
            foreach ($erreurs as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $entityManager->persist($utilisateur);
    
            $professionnel = new Professionnel();
            $professionnel->setUtilisateur($utilisateur);
            $professionnel->setStatut(StatutProfessionnelEnum::STATUT_EN_ATTENTE);
            $professionnel->setSiren((int) $resultat['siren']);
    
            $adresse = new Adresse();
            $adresse->setAdresse($donnees['adresse'] ?? '');
            $adresse->setRue($donnees['rue'] ?? '');
            $adresse->setCodePostal((int) ($donnees['codePostal'] ?? 0));
            $adresse->setVille($donnees['ville'] ?? '');
            $adresse->setPays($donnees['pays'] ?? 'France');
    
            $erreursAdresse = $validator->validate($adresse);
            foreach ($erreursAdresse as $erreur) {
                $erreursFront['adresse_' . $erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            $erreursPro = $validator->validate($professionnel);
            foreach ($erreursPro as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }
    
            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }
    
            $entityManager->persist($adresse);
            $professionnel->setAdresse($adresse);
            $entityManager->persist($professionnel);
            $entityManager->flush();
    
            return $this->json(
                ['message' => 'Inscription réussie avec succès !'],
                201,
                [],
                ['groups' => ['professionnel:read']]
            );
        } catch (\Exception $e) {
            return $this->json([
                'erreur' => $e->getMessage(),
                'fichier' => $e->getFile(),
                'ligne' => $e->getLine(),
            ], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_get_laverie', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function getLaverie(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            return $this->json([
                'id' => $laverie->getId(),
                'nom' => $laverie->getNomEtablissement(),
                'adresse' => $laverie->getAdresse()->getAdresse(),
                'codePostal' => $laverie->getAdresse()->getCodePostal(),
                'ville' => $laverie->getAdresse()->getVille(),
                'pays' => $laverie->getAdresse()->getPays(),
                'statut' => $laverie->getStatut()->value,
                'dateAjout' => $laverie->getDateAjout()->format('d/m/Y'),
                'dateModification' => $laverie->getDateModification()->format('d/m/Y'),
            ], 200);

        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/professionnel/laveries/{id}', name: 'api_delete_laverie', methods: ['DELETE'])]
    #[IsGranted('ROLE_PROFESSIONNEL')]
    public function deleteLaverie(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $this->getUser();
            $professionnel = $entityManager->getRepository(Professionnel::class)
                ->findOneBy(['utilisateur' => $user]);

            if (!$professionnel) {
                return $this->json(['erreur' => 'Professionnel non trouvé'], 404);
            }

            $laverie = $entityManager->getRepository(Laverie::class)->find($id);

            if (!$laverie || $laverie->getProfessionnel()->getId() !== $professionnel->getId()) {
                return $this->json(['erreur' => 'Laverie non trouvée ou accès refusé'], 404);
            }

            // Marquer comme supprimée au lieu de la supprimer vraiment
            $laverie->setSupprimee_le(new \DateTime());
            $entityManager->flush();

            return $this->json(['message' => 'Laverie supprimée avec succès'], 200);

        } catch (\Exception $e) {
            return $this->json(['erreur' => $e->getMessage()], 500);
        }
    }
}