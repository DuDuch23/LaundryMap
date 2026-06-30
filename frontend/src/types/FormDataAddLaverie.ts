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
    latitude: number | null;
    longitude: number | null;
    wiLineCode: string;
    wiLineCentraleId: number | null;
    horaires: Record<string, HorairesJour>;
    machines: Machine[];
    equipements: string[];
    serviceIds: number[],
    paiementIds: number[],
    siteWeb: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
}