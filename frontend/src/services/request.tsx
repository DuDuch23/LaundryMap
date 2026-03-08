import axios from 'axios';
import API_BASE_URL from "./api";

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
    try {
        const response = await fetch(`${API_BASE_URL}/api/langues`, {
            method: 'GET',
            headers: { accept: 'application/json' },
        });
        console.log("Langues récupérées :", response);
        return await response.json();
    } catch (error) {
        console.error("Erreur API getCategory :", error);
        return { data: [] }; 
    }
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
