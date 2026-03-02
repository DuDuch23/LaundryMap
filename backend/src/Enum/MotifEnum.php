<?php

namespace App\Enum;

enum MotifEnum: string
{
    case MOTIF_PROPOS_INJURIEUX = 'Propos injurieux';
    case MOTIF_CONTENU_INAPPROPRIE = 'Contenu inapproprié';
    case MOTIF_PUBLICITE_NON_AUTORISEE = 'Publicité non autorisée';
    case MOTIF_AUTRE = 'Autre';
}