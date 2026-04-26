// ─── Constantes statiques ────────────────────────────────────────────────────
// Services et moyens de paiement sont désormais gérés en base de données.
// Ils sont chargés via l'API (/api/services, /api/methodes-paiement).

export const PARIS_FALLBACK = { lat: 48.8566, lng: 2.3522 } as const;

export const RAYON_PAR_DEFAUT_KM = 10;
export const RAYON_MAX_KM        = 50;
export const LIMITE_RESULTATS    = 30;

// ─── Jours de la semaine ──────────────────────────────────────────────────────
// Restent statiques car ce sont des valeurs métier fixes, non administrables.

export interface JourOption {
    value: string;
    label: string;
}

export const JOURS_OPTIONS: JourOption[] = [
    { value: 'ouvert_maintenant', label: 'Ouvert maintenant' },
    { value: 'Lundi',             label: 'Lundi'    },
    { value: 'Mardi',             label: 'Mardi'    },
    { value: 'Mercredi',          label: 'Mercredi' },
    { value: 'Jeudi',             label: 'Jeudi'    },
    { value: 'Vendredi',          label: 'Vendredi' },
    { value: 'Samedi',            label: 'Samedi'   },
    { value: 'Dimanche',          label: 'Dimanche' },
];

export const JOURS_FORM = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;

export const EQUIPEMENTS_OPTIONS: string[] = [
    'Changeur de monnaie',
    'Distributeur de lessive',
    'WiFi gratuit',
    'Climatisation',
    'Chauffage',
    'Parking',
    'Accès PMR',
    'Vidéosurveillance',
];