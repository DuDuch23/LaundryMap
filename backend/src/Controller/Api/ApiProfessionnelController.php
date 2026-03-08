<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
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

class ApiProfessionnelController extends AbstractController
{
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
}