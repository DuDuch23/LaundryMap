import { HorairesJour } from "./HorairesJour";
import { Machine } from "./Machine";

export interface FormDataAddLaverie {
    nomEtablissement: string;
    contactEmail: string;
    description: string;
    rue: string;
    codePostal: string;
    ville: string;
    pays: string;
    wiLineApiKey: string;
    wiLineCentraleId: number | null;
    horaires: Record<string, HorairesJour>;
    machines: Machine[];
    equipements: string[];
    services: string[];
    paiements: string[];
}