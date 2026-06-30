// ─── Référentiels (chargés depuis l'API) ────────────────────────────────────

export interface ServiceOption {
    id: number;
    nom: string;
}

export interface MethodePaiementOption {
    id: number;
    nom: string;
}

// ─── Carte / Géolocalisation ─────────────────────────────────────────────────

export interface Position {
    lat: number;
    lng: number;
}

// ─── Laverie (résultat de recherche publique) ────────────────────────────────

export interface Laverie {
    id: number;
    nom: string;
    adresse: string;
    ville: string;
    codePostal: string;
    latitude: number | null;
    longitude: number | null;
    /** Distance en km depuis le point de référence (null si non fourni) */
    distance: number | null;
    image: string | null;
    estOuvert: boolean;
    prochaineFermeture?: string | null;
    prochaineOuverture?: string | null;
    horairesAujourdhui?: string[];
    noteMoyenne: number;
    commentairesCount: number;
    description: string | null;
    siteWeb?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
}

export interface GeoSuggestion {
    label: string;
    latitude: number;
    longitude: number;
    rue?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
}

// ─── Filtres ─────────────────────────────────────────────────────────────────

export interface FiltresRecherche {
    horaire: string;
    /** IDs des services sélectionnés */
    serviceIds: number[];
    /** IDs des méthodes de paiement sélectionnées */
    paiementIds: number[];
    /** Rayon de recherche géographique en km (1–50) */
    rayon: number;
}

export interface RechercheParams {
    lat?: number;
    lng?: number;
    q?: string;
    rayon?: number;
    horaire?: string;
    serviceIds?: number[];
    paiementIds?: number[];
}

export interface RechercheResult {
    total: number;
    laveries: Laverie[];
    meta: {
        rayon: number | null;
        geoFourni: boolean;
        recherche: string | null;
    };
}