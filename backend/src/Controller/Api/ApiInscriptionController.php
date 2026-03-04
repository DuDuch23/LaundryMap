<?php

namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Enum\StatutProfessionnelEnum;
use App\Enum\StatutUtilisateurEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;


class ApiInscriptionController extends AbstractController
{
    #[Route('/api/inscription', name: 'api_inscription', methods: ['POST'])]
    public function inscription(Request $request, SerializerInterface $serializer, UserPasswordHasherInterface $passwordHasher, 
    EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse {
        
        $donnees = json_decode($request->getContent(), true);
        $typeCompte = $donnees['type'] ?? 'utilisateur';

        $utilisateur = $serializer->deserialize($request->getContent(), Utilisateur::class, 'json');

        //GESTION DES ERREURS
        $erreursFront = [];
        $erreurs = $validator->validate($utilisateur);

        foreach ($erreurs as $erreur){
            $erreursFront[$erreur->getPropertyPath()] = $erreur->getMessage();//ASSOCIATION DE L'ERREUR AUX CHAMPS
        }

        if (count($erreursFront) > 0) {
            return $this->json(['erreurs' => $erreursFront], 400);
        }

        //UTILISATEUR
        $utilisateur->setStatut(StatutUtilisateurEnum::STATUT_EN_ATTENTE);

        $motDePasseEnClair = $utilisateur->getMotDePasse();
        if ($motDePasseEnClair) {
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasseEnClair));
        }

        $entityManager->persist($utilisateur);

        //PROFESSIONNEL
        if ($typeCompte === 'professionnel') {
            $professionnel = new Professionnel();
            $professionnel->setUtilisateur($utilisateur);
            $professionnel->setStatut(StatutProfessionnelEnum::STATUT_EN_ATTENTE);
            
            if (isset($donnees['siren'])) {
                $professionnel->setSiren((int) $donnees['siren']);
            }

            $adresse = new Adresse();
            $adresse->setAdresse($donnees['adresse'] ?? '');
            $adresse->setRue($donnees['rue'] ?? '');
            $adresse->setCodePostal((int) ($donnees['code_postal'] ?? 0));
            $adresse->setVille($donnees['ville'] ?? '');
            $adresse->setPays($donnees['pays'] ?? 'France');

            //VALIDATION ERREURS PROFESSIONNEL ET ADRESSE
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
        }

        $entityManager->flush();

        return $this->json(['message' => 'Inscription réussie avec succès !'], 201);
    }
}