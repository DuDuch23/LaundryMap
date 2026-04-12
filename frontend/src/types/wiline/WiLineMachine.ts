export interface WiLineMachine {
    wiline_machine_id: number;
    machine_number: number;
    nom: string;
    type_name: string;
    type: string;
    capacite: number;
    tarif: number;
    duree: number;
    hors_service: boolean;
}