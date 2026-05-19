import { WiLineMachine } from "./WiLineMachine";
import { HorairesJour } from "../HorairesJour";

export interface WiLineCentrale {
    id: number;
    nom: string;
    serial: string;
    adresse: string;
    codePostal: string;
    ville: string;
    pays: string;
    description: string;
    logo: string | null;
    paiements: {
        coin: boolean;
        bill: boolean;
        card: boolean;
        fidelity: boolean;
    };
    horaires: Record<string, HorairesJour>;
    machines: WiLineMachine[];
}
