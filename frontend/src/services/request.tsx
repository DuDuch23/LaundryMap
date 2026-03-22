import axios from 'axios';
import API_BASE_URL from "./api";

//AXIOS JWT TOKEN
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token && config.headers) {
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

// export async function InscriptionProfessionnel(data: InscriptionProfessionnelData) {
//     try {
//         const response = await axios.post(`${API_BASE_URL}/api/inscription-professionnel`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Error during professional registration:", error);
//         throw error;
//     }
// }

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

    if(!response.ok){
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
    console.log("Langues récupérées :", response);
    return await response.json();

}

export async function inscriptionUtilisateur(data: InscriptionUtilisateurData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/inscription-utilisateur`, data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'inscription utilisateur:", error);
        throw error;
    }
}

export async function connexion(data: ConnexionData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/connexion`, data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
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
        
        const response = await axios.post(`${API_BASE_URL}/api/admin/utilisateurs/${id}/statut`, payload);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du statut (action: ${action}):`, error);
        throw error;
    }
}