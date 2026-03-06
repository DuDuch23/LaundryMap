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
    // const response = await axios.post(`${API_BASE_URL}/api/inscription-professionnel`, data);
    // console.log(data);
    // return response.data;

    try {
        const response = await fetch('http://localhost:8000/api/inscription-utilisateur', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                data
            })
        });

        const resultat = await response.json();

        // if (!response.ok) {
        //     if (resultat.erreurs) {
        //         setErrors(resultat.erreurs);
        //     }
        //     return;
        // }

        // setMessageSucces(t('main.inscription_utilisateur.succes'));
        // setFirstName("");
        // setLastName("");
        // setEmail("");
        // setPassword("");
        // setCguAccepted(false);
        return resultat;

    } catch (error) {
        console.error('Erreur :', error);
        // setErrors({ global: "Une erreur est survenue lors de la connexion au serveur." });
    }
}

export async function getLangue() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/langue`);
        return response.data;
    } catch (error) {
        console.error("Error fetching language:", error);
        throw error;
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
