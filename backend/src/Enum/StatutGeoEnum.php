<?php

namespace App\Enum;

enum StatutGeoEnum: string
{
    case GEOLOCALISEE = 'Géolocalisé';
    case ERREUR = 'Erreur géolocalisation';
    case EN_ATTENTE = 'En attente';
}