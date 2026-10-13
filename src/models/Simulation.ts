import { Coder } from "./Coder";

export type SchedulerType = "fifo" | "edf";

export interface SimulationSettings {
    numberOfCoders: number;
    timeToBurnout: number;
    timeToCompile: number;
    timeToDebug: number;
    timeToRefactor: number;
    numberOfCompilesRequired: number;
    dongleCooldown: number;
    scheduler: SchedulerType;
}


export class Simulation {
    public coders: Coder[] = [];
    public settings: SimulationSettings;

    constructor(settings: SimulationSettings) {
        this.settings = settings;

        for (let i = 0; i < settings.numberOfCoders; i++) {
            this.coders.push(new Coder(i));
        }
    }
}
