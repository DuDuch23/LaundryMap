<?php

namespace App\Enum;

enum StatutProfessionnelEnum: string
{
    case STATUT_EN_ATTENTE = 'En attente';
    case STATUT_VALIDE = 'Validé';
    case STATUT_REFUSE = 'Refusé';
}