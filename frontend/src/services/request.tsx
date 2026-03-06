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
//         const response = await axios.post(`${API_BASE_URL}/api/inscription_professionnel`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Error during professional registration:", error);
//         throw error;
//     }
// }

export async function inscriptionProfessionnel(data: InscriptionProfessionnelData): Promise<InscriptionProfessionnelResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/inscription_professionnel`, data);
    console.log(data);
    return response.data;
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
