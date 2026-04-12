export interface Machine {
    id: string;
    nom: string;
    type: string;
    capacite: string;
    tarif: string;
    duree: string;
    wiline_machine_id?: number | null;
}