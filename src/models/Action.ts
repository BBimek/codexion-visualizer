export type ActionType =
    | "compiling"
    | "debugging"
    | "refactoring"
    | "waiting"
    | "dongle_acquired"
    | "burned_out";

export class Action {
    constructor(
        public type: ActionType,
        public startTime: number,
        public endTime: number,
        public deadline: number,
        public compilationsDone: number
    ) {}
}