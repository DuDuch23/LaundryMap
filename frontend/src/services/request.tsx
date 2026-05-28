import axios from 'axios';
import API_BASE_URL from "./api";
import type {
    GeoSuggestion,
    MethodePaiementOption,
    RechercheParams,
    RechercheResult,
    ServiceOption,
} from '../types/Laverie';
 
export type { GeoSuggestion, MethodePaiementOption, RechercheParams, RechercheResult, ServiceOption };


const publicApiEndpoints = [
    '/api/inscription-utilisateur',
    '/api/connexion',
    '/api/resend-verification',
    '/api/inscription-pro',
    '/api/verify-email'
    // Les endpoints suivants sont des exemples et devront être ajoutés s'ils sont implémentés avec axios
    // '/api/mot-de-passe-oublie',
    // '/api/reinitialiser-mot-de-passe',
];

//AXIOS JWT TOKEN
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const isPublicEndpoint = publicApiEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (token && config.headers && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur de réponse : redirige vers /connexion si le token a expiré (401)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            const currentPath = window.location.pathname;
            if (currentPath !== '/connexion') {
                window.location.href = '/connexion';
            }
        }
        return Promise.reject(error);
    }
);

interface InscriptionProfessionnelData {
    email: string;
    prenom: string;
    nom: string;
    password: string;
    sirenOrSiret: string;
    adresse: string;
    rue: string;
    codePostal: string;
    ville: string;
    pays: string;
    latitude: number | null;
    longitude: number | null;
}

interface InscriptionUtilisateurData {
    prenom: string;
    nom: string;
    email: string;
    motDePasse: string;
}

export interface ConnexionData {
    email: string;
    mot_de_passe: string;
}

export interface ProfilUtilisateurData {
    id: number;
    email: string;
    prenom: string | null;
    nom: string | null;
    statut: string;
    dateCreation: string | null;
    dateDerniereConnexion: string | null;
    utilisateurSupprimeLe?: string | null;
    preference?: ProfilPreferenceData | null;
    isProfessionnel: boolean;
}

export interface ProfilPreferenceData {
    langueId: number;
    langueCode: string;
    theme: 'clair' | 'sombre' | 'systeme';
    notifications: boolean;
}

export interface UpdateProfilData {
    nom: string;
    prenom: string;
    motDePasseActuel?: string;
    nouveauMotDePasse?: string;
    preference?: {
        langueId?: number;
        theme?: 'clair' | 'sombre' | 'systeme';
        notifications?: boolean;
    };
}

export async function inscriptionProfessionnel(data: InscriptionProfessionnelData) {
    const response = await fetch(`${API_BASE_URL}/api/inscription-professionnel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const resultat = await response.json();

    if (!response.ok) {
        const error: any = new Error('Erreur lors de l\'inscription professionnel');
        error.response = { data: resultat };
        throw error;
    }

    return resultat;
}

export async function getLangues() {
    const response = await fetch(`${API_BASE_URL}/api/langues`, {
        method: 'GET',
        headers: { accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des langues');
    }

    return await response.json();
}

export async function inscriptionUtilisateur(data: InscriptionUtilisateurData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/inscription-utilisateur`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'inscription utilisateur:", error);
        throw error;
    }
}

export async function connexion(data: ConnexionData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/connexion`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        throw error;
    }
}

export async function getProfilUtilisateur(): Promise<ProfilUtilisateurData> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error: any = new Error('Impossible de récupérer le profil utilisateur.');
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    return data as ProfilUtilisateurData;
}

export async function updateProfilUtilisateur(payload: UpdateProfilData): Promise<ProfilUtilisateurData> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error: any = new Error(data?.message || 'Impossible de mettre à jour le profil utilisateur.');
        error.status = response.status;
        throw error;
    }

    return data.utilisateur as ProfilUtilisateurData;
}

export async function supprimerProfilUtilisateur(): Promise<void> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil`, {
        method: 'DELETE',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error: any = new Error(data?.message || 'Impossible de supprimer le compte utilisateur.');
        error.status = response.status;
        throw error;
    }
}

export interface FiltresUtilisateurs {
    statut?: string;
    type?: string;
    proprietaire?: string;
    ordre?: string;
}

export interface FiltresLaveries {
    statut?: string;
    ordre?: string;
}

export async function fetchAdminUtilisateurs(page: number = 1, filtres?: FiltresUtilisateurs) {
    try {
        const params: Record<string, string | number> = { page };

        if (filtres?.statut) params.statut = filtres.statut;
        if (filtres?.type) params.type = filtres.type;
        if (filtres?.proprietaire) params.proprietaire = filtres.proprietaire;
        if (filtres?.ordre) params.ordre = filtres.ordre;

        const response = await axios.get(`${API_BASE_URL}/api/admin/utilisateurs`, { params });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        throw error;
    }
}

export async function fetchUtilisateurDetail(id: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/utilisateurs/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de l'utilisateur ${id}:`, error);
        throw error;
    }
}

export async function fetchAdminLaveries(page: number = 1, filtres?: FiltresLaveries) {
    try {
        const params: Record<string, string | number> = { page };

        if (filtres?.statut) params.statut = filtres.statut;
        if (filtres?.ordre) params.ordre = filtres.ordre;

        const response = await axios.get(`${API_BASE_URL}/api/admin/laveries`, { params });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des laveries:", error);
        throw error;
    }
}

export async function fetchLaverieDetail(id: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/laveries/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de la laverie ${id}:`, error);
        throw error;
    }
}

export async function updateLaverieStatut(id: number, action: 'accepter' | 'refuser', commentaire?: string) {
    try {
        const payload: any = { action };
        if (commentaire) {
            payload.commentaire = commentaire;
        }
        const response = await axios.post(`${API_BASE_URL}/api/admin/laveries/${id}/statut`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du statut de la laverie (action: ${action}):`, error);
        throw error;
    }
}

export async function updateUtilisateurStatut(id: number, action: 'accepter' | 'refuser', commentaire?: string) {
    try {
        const payload: any = { action };
        if (commentaire) {
            payload.commentaire = commentaire;
        }
        const response = await axios.post(`${API_BASE_URL}/api/admin/utilisateurs/${id}/statut`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du statut (action: ${action}):`, error);
        throw error;
    }
}

export interface LaverieResume {
    id: number;
    nomEtablissement: string;
    statut: string;
    adresse: {
        rue: string;
        codePostal: string;
        ville: string;
    };
    dateAjout: string;
}

interface MesLaveriesData {
    laveries: LaverieResume[];
}

export interface FavoriLaverie {
    id: number;
    nom: string;
    adresse: string;
    codePostal: number;
    ville: string;
    statut: string;
    description: string | null;
    dateAjout: string | null;
    dateModification: string | null;
    image: string | null;
    imageAlt: string | null;
}

export interface LaveriePublicDetail {
    id: number;
    nom: string;
    statut: string;
    description: string | null;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    latitude: number | null;
    longitude: number | null;
    distance: number | null;
    wiLineReference: number | null;
    logo: string | null;
    image: string | null;
    images: Array<{
        id?: number;
        image: string;
        alt?: string;
    }>;
    equipements: Array<{
        id: number;
        equipementReference?: number | null;
        nom: string;
        type: string;
        capacite: number;
        tarif: number;
        duree: number;
    }>;
    horaires: Array<{
        jour: string;
        debut: string;
        fin: string;
        ferme: boolean;
    }>;
    services: Array<{
        id: number;
        nom: string;
    }>;
    paiements: Array<{
        id: number;
        nom: string;
    }>;
    commentaires: Array<{
        id: number;
        note: number;
        commentaire: string;
        commentaireSupprimeeLe?: string | null;
        date: string;
        reponse?: string | null;
        reponduLe?: string | null;
        dejaSignale?: boolean;
        utilisateur: {
            id?: number;
            prenom: string;
            nom: string;
        };
    }>;
    commentairesCount: number;
    noteMoyenne: number | null;
    monAvis: MonAvis | null;
    estProprietaire?: boolean;
    professionnel?: {
        id?: number | null;
        nom?: string | null;
        prenom?: string | null;
    };
}

interface MesFavorisData {
    favoris: FavoriLaverie[];
    total: number;
}

export async function getMesLaveries(): Promise<MesLaveriesData> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/laveries`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error: any = new Error('Impossible de récupérer les laveries.');
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    return data as MesLaveriesData;
}

export async function getMesFavoris(): Promise<MesFavorisData> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil/favoris`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error: any = new Error('Impossible de récupérer vos favoris.');
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    return data as MesFavorisData;
}

export async function ajouterFavori(laverieId: number): Promise<void> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil/favoris/${laverieId}`, {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error: any = new Error('Impossible d\'ajouter ce favori.');
        error.status = response.status;
        throw error;
    }
}

export async function supprimerFavori(laverieId: number): Promise<void> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Aucun token de connexion trouvé.');
    }

    const response = await fetch(`${API_BASE_URL}/api/profil/favoris/${laverieId}`, {
        method: 'DELETE',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error: any = new Error('Impossible de supprimer ce favori.');
        error.status = response.status;
        throw error;
    }
}

export interface MonAvis {
    id: number;
    note: number;
    commentaire?: string | null;
    commenteLe?: string | null;
    noteLe?: string | null;
}

export interface AvisUtilisateur {
    id: number;
    note: number;
    noteLe: string | null;
    commentaire: string | null;
    commenteLe: string | null;
    laverie: {
        id: number;
        nom: string;
        adresse: string | null;
        codePostal: string | null;
        ville: string | null;
    };
}

export interface PaginationInfo {
    pageCourante: number;
    totalPages: number;
    totalResultats: number;
    parPage: number;
    aPageSuivante: boolean;
    aPagePrecedente: boolean;
}

export interface MesAvisResponse {
    avis: AvisUtilisateur[];
    pagination: PaginationInfo;
}

export async function getMesAvis(page: number = 1): Promise<MesAvisResponse> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const res = await fetch(`${API_BASE_URL}/api/profil/avis?page=${page}`, {
        headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Impossible de récupérer vos avis');
    const data = await res.json();
    return {
        avis: data.avis as AvisUtilisateur[],
        pagination: data.pagination as PaginationInfo,
    };
}

export async function creerAvis(laverieId: number, note: number, commentaire?: string | null): Promise<MonAvis> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const body: Record<string, unknown> = { laverieId, note };
    if (commentaire !== undefined && commentaire !== null && commentaire !== '') {
        body.commentaire = commentaire;
    }
    const res = await fetch(`${API_BASE_URL}/api/profil/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la création de l\'avis');
    return data.avis as MonAvis;
}

export async function modifierAvis(id: number, note: number, commentaire?: string | null): Promise<MonAvis> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const body: Record<string, unknown> = { note };
    if (commentaire !== undefined) {
        body.commentaire = commentaire;
    }
    const res = await fetch(`${API_BASE_URL}/api/profil/avis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la modification de l\'avis');
    return data.avis as MonAvis;
}

// ── F-12 : Réponses du professionnel aux avis ────────────────────────────────

export interface ReponseAvis {
    reponse: string;
    reponduLe: string;
}

export async function publierReponseAvis(avisId: number, reponse: string): Promise<ReponseAvis> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const res = await fetch(`${API_BASE_URL}/api/professionnel/avis/${avisId}/reponse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reponse }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la publication de la réponse');
    return data as ReponseAvis;
}

export async function supprimerReponseAvis(avisId: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const res = await fetch(`${API_BASE_URL}/api/professionnel/avis/${avisId}/reponse`, {
        method: 'DELETE',
        headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la suppression de la réponse');
    }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function supprimerAvis(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const res = await fetch(`${API_BASE_URL}/api/profil/avis/${id}`, {
        method: 'DELETE',
        headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la suppression de l\'avis');
    }
}

export async function fetchPublicLaverieDetail(id: string): Promise<LaveriePublicDetail> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        accept: 'application/json',
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/laveries/${id}`, {
        headers,
    });

    if (!response.ok) {
        const error: any = new Error('Impossible de récupérer la fiche de la laverie.');
        error.status = response.status;
        throw error;
    }

    return response.json() as Promise<LaveriePublicDetail>;
}

export async function getServices(): Promise<ServiceOption[]> {
    const res = await fetch(`${API_BASE_URL}/api/services`, {
        headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Erreur chargement services (HTTP ${res.status})`);
    const data = await res.json();
    return data.services as ServiceOption[];
}
 
export async function getMethodesPaiement(): Promise<MethodePaiementOption[]> {
    const res = await fetch(`${API_BASE_URL}/api/methodes-paiement`, {
        headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Erreur chargement méthodes de paiement (HTTP ${res.status})`);
    const data = await res.json();
    return data.methodes as MethodePaiementOption[];
}
 
export async function searchLaveries(params: RechercheParams): Promise<RechercheResult> {
    const qs = new URLSearchParams();
 
    if (params.lat !== undefined)        qs.set('lat',        String(params.lat));
    if (params.lng !== undefined)        qs.set('lng',        String(params.lng));
    if (params.q)                        qs.set('q',          params.q);
    if (params.rayon)                    qs.set('rayon',      String(params.rayon));
    if (params.horaire)                  qs.set('horaire',    params.horaire);
    if (params.serviceIds?.length)       qs.set('serviceIds', params.serviceIds.join(','));
    if (params.paiementIds?.length)      qs.set('paiementIds', params.paiementIds.join(','));
 
    const res = await fetch(`${API_BASE_URL}/api/laveries/recherche?${qs}`, {
        headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Erreur recherche laveries (HTTP ${res.status})`);
    return res.json() as Promise<RechercheResult>;
}
 
export async function geocodeSuggestions(q: string): Promise<GeoSuggestion[]> {
    if (!q || q.trim().length < 2) return [];
    const res = await fetch(
        `${API_BASE_URL}/api/laveries/geocode?q=${encodeURIComponent(q.trim())}`,
        { headers: { accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? []) as GeoSuggestion[];
}

// ── F-20 : Gestion des mots interdits (admin) ────────────────────────────────

export interface MotInterdit {
    id: number;
    label: string;
}

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token
        ? { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json', accept: 'application/json' };
}

export interface MotsInterditsPaginatedResponse {
    mots: MotInterdit[];
    total: number;
    pagination: PaginationInfo;
}

export async function fetchMotsInterdits(
    page: number = 1,
    q?: string,
): Promise<MotsInterditsPaginatedResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (q && q.trim() !== '') params.set('q', q.trim());
    const res = await fetch(`${API_BASE_URL}/api/admin/mots-interdits?${params}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Erreur chargement mots interdits (HTTP ${res.status})`);
    return res.json() as Promise<MotsInterditsPaginatedResponse>;
}

export async function creerMotInterdit(label: string): Promise<MotInterdit> {
    const res = await fetch(`${API_BASE_URL}/api/admin/mots-interdits`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout du mot.');
    return data as MotInterdit;
}

export async function modifierMotInterdit(id: number, label: string): Promise<MotInterdit> {
    const res = await fetch(`${API_BASE_URL}/api/admin/mots-interdits/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la modification du mot.');
    return data as MotInterdit;
}

export async function supprimerMotInterdit(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/mots-interdits/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la suppression du mot.');
    }
}

export async function signalerCommentaire(noteId: number, motif: string, commentaire?: string): Promise<{ totalSignalements?: number }> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');

    const body: any = { motif };
    if (commentaire !== undefined) body.commentaire = commentaire;

    const res = await fetch(`${API_BASE_URL}/api/laverie-notes/${noteId}/signalement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'envoi du signalement');
    return data;
}

export async function fetchModerationCommentaires(): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const res = await fetch(`${API_BASE_URL}/api/admin/moderation/commentaires`, {
        headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur chargement modération');
    }
    return res.json();
}

export async function moderationDecision(noteId: number, action: 'keep'|'delete', motif?: string): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');
    const body: any = { action };
    if (motif) body.motif = motif;
    const res = await fetch(`${API_BASE_URL}/api/admin/moderation/commentaires/${noteId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur décision modération');
    return data;
}
