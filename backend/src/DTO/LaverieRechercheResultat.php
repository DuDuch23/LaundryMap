<?php

namespace App\DTO;

use App\Entity\Laverie;

/**
 * DTO produit par LaverieRepository::findForPublicSearch().
 *
 * Porte l'entité Laverie + deux valeurs calculées à la volée :
 *  - distanceKm  : distance haversine depuis le point de référence (null si pas de géo)
 *  - estOuvert   : statut d'ouverture calculé à partir des horaires + heure courante
 *
 * L'entité Laverie reste pure — aucune propriété dynamique ne lui est injectée.
 */
final class LaverieRechercheResultat
{
    public function __construct(
        public readonly Laverie $laverie,
        public readonly ?float $distanceKm,
        public readonly bool $estOuvert,
        public readonly ?string $prochaineFermeture,
        public readonly ?string $prochaineOuverture,
        /** @var string[] "HH:MM - HH:MM" pour chaque plage d'ouverture aujourd'hui */
        public readonly array $horairesAujourdhui,
    ) {}
}
