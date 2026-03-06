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

interface InscriptionProfessionnelResponse {
    message: string;
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
