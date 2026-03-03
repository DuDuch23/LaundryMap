<?php

namespace App\Enum;

enum StatutUtilisateurEnum: string
{
    case STATUT_EN_ATTENTE = 'En attente';
    case STATUT_VALIDE = 'Validé';
    case STATUT_REFUSE = 'Refusé';
    case STATUT_BANNI = 'Banni';
}