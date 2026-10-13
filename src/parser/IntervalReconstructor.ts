
import { Action } from "../models/Action";
import type { Simulation } from "../models/Simulation";

export class IntervalReconstructor {
    public static reconstruct(
        simulation: Simulation,
        simulationEndTime?: number
    ): void {
        for (const coder of simulation.coders) {
            const actions = coder.actions;

            const burnoutAction = actions.find(
                action => action.type === "burned_out"
            );

            const burnoutTime = burnoutAction?.startTime;

            actions.sort(
                (a, b) => a.startTime - b.startTime
            );

            const activities = actions.filter(action =>
                [
                    "compiling",
                    "debugging",
                    "refactoring",
                    "waiting"
                ].includes(action.type)
            );

            const addedActions: Action[] = [];

            for (let i = 0; i < activities.length; i++) {
                const current = activities[i];
                const next = activities[i + 1];

                switch (current.type) {
                    case "compiling":
                        current.endTime =
                            current.startTime +
                            simulation.settings.timeToCompile;
                        break;

                    case "debugging":
                        current.endTime =
                            current.startTime +
                            simulation.settings.timeToDebug;
                        break;

                    case "refactoring":
                        current.endTime =
                            current.startTime +
                            simulation.settings.timeToRefactor;

                        if (
                            next &&
                            next.startTime > current.endTime
                        ) {
                            addedActions.push(
                                new Action(
                                    "waiting",
                                    current.endTime,
                                    next.startTime,
                                    current.deadline,
                                    current.compilationsDone
                                )
                            );
                        }
                        break;

                    case "waiting":
                        current.endTime = next
                            ? Math.max(
                                current.startTime,
                                next.startTime
                            )
                            : simulationEndTime !== undefined
                                ? Math.max(
                                    current.startTime,
                                    simulationEndTime
                                )
                                : current.startTime;
                        break;
                }

                // Stop activities at this coder's own burnout.
                if (burnoutTime !== undefined) {
                    current.endTime = Math.min(
                        current.endTime,
                        burnoutTime
                    );
                }
            }

            coder.actions.push(...addedActions);

            coder.actions.sort(
                (a, b) => a.startTime - b.startTime
            );
        }
    }
}
