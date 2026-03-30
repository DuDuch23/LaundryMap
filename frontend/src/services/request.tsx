import axios from 'axios';
import API_BASE_URL from "./api";

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