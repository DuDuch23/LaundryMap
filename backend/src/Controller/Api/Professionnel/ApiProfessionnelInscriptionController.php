<?php

namespace App\Controller\Api\Professionnel;

use App\Entity\Adresse;
use App\Entity\Utilisateur;
use App\Entity\Professionnel;
use App\Enum\StatutGeoEnum;
use App\Enum\StatutProfessionnelEnum;
use App\Enum\StatutUtilisateurEnum;
use App\Repository\ProfessionnelRepository;
use App\Repository\UtilisateurRepository;
use App\Service\ApiSirenSiretService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiProfessionnelInscriptionController extends AbstractController
{
    #[Route('/api/inscription-professionnel', name: 'api_inscription_professionnel', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function inscriptionProfessionnel(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ApiSirenSiretService $sirenService,
        ProfessionnelRepository $professionnelRepository,
        UtilisateurRepository $utilisateurRepository,
    ): JsonResponse {
        try {
            $donnees = json_decode($request->getContent(), true);

            if (!is_array($donnees)) {
                return $this->json(['erreurs' => ['global' => 'Données invalides']], 400);
            }

            $erreursFront = [];
            $sirenOuSiret = trim($donnees['sirenOrSiret'] ?? '');

            $resultat = null;
            $existeUtilisateur = $utilisateurRepository->findOneByEmail((string) ($donnees['email'] ?? ''));

            if ($existeUtilisateur) {
                $erreursFront['email'] = 'ERROR_EMAIL_IS_USING';
            }

            if (empty($sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Le numéro SIREN ou SIRET est requis';
            } elseif (!preg_match('/^\d{9}$/', $sirenOuSiret) && !preg_match('/^\d{14}$/', $sirenOuSiret)) {
                $erreursFront['sirenOrSiret'] = 'Format invalide';
            } else {
                $resultat = $sirenService->verify($sirenOuSiret);
                if (!$resultat['valide']) {
                    $erreursFront['sirenOrSiret'] = 'Numéro SIREN/SIRET introuvable ou entreprise inactive';
                } else {
                    $existeSiren = $professionnelRepository->findOneBySiren((int) $resultat['siren']);

                    if ($existeSiren) {
                        $erreursFront['sirenOrSiret'] = 'Ce numéro SIREN/SIRET est déjà utilisé';
                    }
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

            $adresse = new Adresse();
            $adresse->setAdresse($donnees['adresse'] ?? '');
            $adresse->setRue($donnees['rue'] ?? '');
            $adresse->setCodePostal((int) ($donnees['codePostal'] ?? 0));
            $adresse->setVille($donnees['ville'] ?? '');
            $adresse->setPays($donnees['pays'] ?? 'France');

            $lat = isset($donnees['latitude']) && is_numeric($donnees['latitude']) ? (float) $donnees['latitude'] : null;
            $lon = isset($donnees['longitude']) && is_numeric($donnees['longitude']) ? (float) $donnees['longitude'] : null;
            $adresse->setLatitude($lat);
            $adresse->setLongitude($lon);
            $adresse->setStatutGeolocalisation(
                ($lat !== null && $lon !== null) ? StatutGeoEnum::GEOLOCALISEE : StatutGeoEnum::EN_ATTENTE
            );

            $erreursAdresse = $validator->validate($adresse);
            foreach ($erreursAdresse as $erreur) {
                $erreursFront['adresse_' . $erreur->getPropertyPath()] = $erreur->getMessage();
            }

            $professionnel = new Professionnel();
            $professionnel->setUtilisateur($utilisateur);
            $professionnel->setStatut(StatutProfessionnelEnum::STATUT_EN_ATTENTE);
            $professionnel->setSiren((int) $resultat['siren']);
            $professionnel->setAdresse($adresse);

            $erreursPro = $validator->validate($professionnel);
            foreach ($erreursPro as $erreur) {
                $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();
            }

            if (count($erreursFront) > 0) {
                return $this->json(['erreurs' => $erreursFront], 400);
            }

            $entityManager->persist($utilisateur);
            $entityManager->persist($adresse);
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
}
