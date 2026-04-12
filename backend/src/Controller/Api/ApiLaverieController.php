<?php
namespace App\Controller\Api;

use App\Entity\Adresse;
use App\Entity\Laverie;
use App\Entity\LaverieEquipement;
use App\Entity\LaverieFermeture;
use App\Entity\LaverieService;
use App\Entity\LaverieMedia;
use App\Entity\Utilisateur;
use App\Enum\JourEnum;
use App\Enum\StatutLaverieEnum;
use App\Repository\ServiceRepository;
use App\Service\ApiWiLineService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiLaverieController extends AbstractController
{
    private function getProfessionnelValide(): mixed
    {
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Non authentifié.'], 401);
        }

        $professionnel = $utilisateur->getProfessionnel();

        if ($professionnel === null) {
            return $this->json(['message' => 'Accès réservé aux professionnels.'], 403);
        }

        if ($professionnel->getStatut()->value !== 'Validé') {
            return $this->json(['message' => 'Votre compte professionnel n\'est pas encore validé.'], 403);
        }

        return $professionnel;
    }


    #[Route('/api/laveries', name: 'api_laveries_liste', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function mesLaveries(): JsonResponse
    {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        return $this->json(
            ['laveries' => $professionnel->getLaveries()->toArray()],
            200,
            [],
            ['groups' => ['laverie:public', 'laverie:private']]
        );
    }

    #[Route('/api/wiline/centrales', name: 'api_wiline_centrales', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getCentralesWiLine(Request $request, ApiWiLineService $wiLine): JsonResponse
    {
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $payload = json_decode($request->getContent(), true);
        $apiKey  = trim($payload['apiKey'] ?? '');

        if ($apiKey === '') {
            return $this->json(['message' => 'Le code client WI-LINE est requis.'], 400);
        }

        $centrales = $wiLine->getMachinesParCodeClient($apiKey);

        if ($centrales === null) {
            return $this->json(['message' => 'Code client WI-LINE invalide ou service indisponible.'], 422);
        }

        return $this->json(['centrales' => $centrales]);
    }


    #[Route('/api/laveries', name: 'api_laverie_creer', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function creerLaverie(
        Request $request,
        EntityManagerInterface $em,
        ServiceRepository $serviceRepository,
    ): JsonResponse {
        // donnée reçu par le front
        $professionnel = $this->getProfessionnelValide();
        if ($professionnel instanceof JsonResponse) {
            return $professionnel;
        }

        $payload = json_decode($request->getContent(), true);

        if (!is_array($payload)) {
            return $this->json(['message' => 'Corps de requête invalide.'], 400);
        }

        foreach (['nomEtablissement', 'rue', 'codePostal', 'ville', 'pays'] as $champ) {
            if (empty(trim((string)($payload[$champ] ?? '')))) {
                return $this->json(['message' => "Le champ '$champ' est obligatoire."], 400);
            }
        }

        if (empty($payload['horaires']) || !is_array($payload['horaires'])) {
            return $this->json(['message' => 'Les horaires sont obligatoires.'], 400);
        }

        //  Adresse
        $adresse = new Adresse();
        $adresse->setAdresse(trim($payload['rue'] . ', ' . $payload['codePostal'] . ' ' . $payload['ville'] . ', ' . $payload['pays']));
        $adresse->setRue(trim($payload['rue']));
        $adresse->setCodePostal(trim($payload['codePostal']));
        $adresse->setVille(trim($payload['ville']));
        $adresse->setPays(trim($payload['pays']));
        $em->persist($adresse);

        // Laverie
        $laverie = new Laverie();
        $laverie->setProfessionnel($professionnel);
        $laverie->setNomEtablissement(trim($payload['nomEtablissement']));
        $laverie->setContactEmail(!empty($payload['contactEmail']) ? trim($payload['contactEmail']) : null);
        $laverie->setDescription(!empty($payload['description']) ? trim($payload['description']) : null);
        $laverie->setAdresse($adresse);
        $laverie->setStatut(StatutLaverieEnum::STATUT_EN_ATTENTE);
        $laverie->setDateAjout(new \DateTime());
        $laverie->setDateModification(new \DateTime());        

        // Référence WI-LINE — on stocke l'ID numérique de la centrale si fourni
        if (!empty($payload['wiLineCentraleId'])) {
            $laverie->setWiLineReference((int) $payload['wiLineCentraleId']);
        }

        $em->persist($laverie);

        // ── Horaires (LaverieFermeture) ──────────────────────────────────────
        // On stocke les plages d'ouverture par jour.
        // Le front envoie : { "Lundi": { "ouvert": true, "ouverture": "07:00", "fermeture": "22:00" }, ... }
        $jourMapping = [
            'Lundi' => JourEnum::LUNDI,
            'Mardi' => JourEnum::MARDI,
            'Mercredi' => JourEnum::MERCREDI,
            'Jeudi' => JourEnum::JEUDI,
            'Vendredi' => JourEnum::VENDREDI,
            'Samedi' => JourEnum::SAMEDI,
            'Dimanche' => JourEnum::DIMANCHE,
        ];

        foreach ($payload['horaires'] as $jourLabel => $horaire) {
            if (empty($horaire['ouvert'])) {
                continue; // jour fermé, on ne persiste pas
            }

            $jourEnum = $jourMapping[$jourLabel] ?? null;
            if ($jourEnum === null) continue;

            $fermeture = new LaverieFermeture();
            $fermeture->setLaverie($laverie);
            $fermeture->setJour($jourEnum);
            $fermeture->setHeureDebut(new \DateTime($horaire['ouverture']));
            $fermeture->setHeureFin(new \DateTime($horaire['fermeture']));
            $fermeture->setDateAjout(new \DateTime());
            $fermeture->setDateModification(new \DateTime());
            $em->persist($fermeture);
        }

        if (!empty($payload['machines']) && is_array($payload['machines'])) {
            foreach ($payload['machines'] as $machineData) {
                if (empty($machineData['type'])) continue;

                $equipement = new LaverieEquipement();
                $equipement->setLaverie($laverie);
                $equipement->setNom($machineData['nom'] ?? $machineData['type_name'] ?? $machineData['type']);
                $equipement->setType($machineData['type']);
                $equipement->setCapacite((int) ($machineData['capacite'] ?? 0));
                $equipement->setTarif((float) ($machineData['tarif'] ?? 0));
                $equipement->setDuree((int) ($machineData['duree'] ?? 0));

                if (!empty($machineData['wiline_machine_id'])) {
                    $equipement->setEquipementReference((int) $machineData['wiline_machine_id']);
                }

                $em->persist($equipement);
            }
        }

        // ── Services ─────────────────────────────────────────────────────────
        // Le front envoie un tableau de noms de services : ["Pressing", "Retouches", ...]
        if (!empty($payload['services']) && is_array($payload['services'])) {
            foreach ($payload['services'] as $nomService) {
                $service = $serviceRepository->findOneBy(['nom' => $nomService]);
                if ($service === null) {
                    continue;
                }

                $laverieService = new LaverieService();
                $laverieService->setLaverie($laverie);
                $laverieService->setService($service);
                $em->persist($laverieService);
            }
        }

        $em->flush();


        return $this->json([
            'message' => 'Laverie créée et soumise à validation.',
            'id' => $laverie->getId(),
        ], 201);
    }

    public function modifierLaverie()
    {
        
    }
}