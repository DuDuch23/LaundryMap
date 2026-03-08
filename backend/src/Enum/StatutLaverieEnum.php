<?php

namespace App\Enum;

enum StatutLaverieEnum: string
{
    case STATUT_EN_ATTENTE = 'En attente';
    case STATUT_VALIDEE = 'Validée';
    case STATUT_REFUSEE = 'Refusée';
}