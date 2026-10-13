import { Simulation } from "../models/Simulation";
import { Action } from "../models/Action";
import type { ActionType } from "../models/Action";

export class LogParser {
    public static parse(
        input: string,
        simulation: Simulation
    ): void {
        const lines = input.split(/\r?\n/);

        for (const line of lines) {
            if (line.trim() === "") {
                continue;
            }

            const match = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);

            if (!match) {
                continue;
            }

            const time = Number(match[1]);
            const coderId = Number(match[2]);
            const message = match[3].trim();

            const coder = simulation.coders[coderId];

            if (!coder) {
                continue;
            }

            const type = this.getActionType(message);

            if (!type) {
                continue;
            }

            if (type === "compiling") {
                coder.lastCompileStart = time;
                coder.deadline = time + simulation.settings.timeToBurnout;
                coder.compilationsDone++;
            }

            if (type === "burned_out") {
                coder.burnedOut = true;
            }

            coder.actions.push(
                new Action(
                    type,
                    time,
                    time,
                    coder.deadline,
                    coder.compilationsDone
                )
            );
        }
    }

    private static getActionType(message: string): ActionType | null {
        if (
            message.includes("has burned out") ||
            message.includes("burned out")
            ) {
            return "burned_out";
        }

        if (message.includes("has taken a dongle")) {
            return "dongle_acquired";
        }

        if (message.includes("is compiling")) {
            return "compiling";
        }

        if (message.includes("is debugging")) {
            return "debugging";
        }

        if (message.includes("is refactoring")) {
            return "refactoring";
        }

        if (message.includes("is waiting")) {
            return "waiting";
        }

        return null;
    }
}