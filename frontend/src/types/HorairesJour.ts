export interface PlageHoraire {
    ouverture: string;
    fermeture: string;
}

export interface HorairesJour {
    ouvert: boolean;
    plages: PlageHoraire[];
}