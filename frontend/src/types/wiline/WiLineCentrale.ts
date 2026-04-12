import { WiLineMachine } from "./WiLineMachine";

export interface WiLineCentrale {
    id: number;
    nom: string;
    serial: string;
    machines: WiLineMachine[];
}