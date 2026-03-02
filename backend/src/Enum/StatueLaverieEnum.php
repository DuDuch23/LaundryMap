<?php

namespace App\Enum;

enum StatueLaverieEnum: string
{
    case STATUT_EN_ATTENTE = 'En attente';
    case STATUT_VALIDEE = 'Validée';
    case STATUT_REFUSEE = 'Refusée';
}