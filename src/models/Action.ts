
export type ActionType =
    | "compiling"
    | "debugging"
    | "refactoring"
    | "waiting"
    | "dongle_acquired"
    | "burned_out";

export class Action {
    public type: ActionType;
    public startTime: number;
    public endTime: number;
    public deadline: number;
    public compilationsDone: number;

    constructor(
        type: ActionType,
        startTime: number,
        endTime: number,
        deadline: number,
        compilationsDone: number
    ) {
        this.type = type;
        this.startTime = startTime;
        this.endTime = endTime;
        this.deadline = deadline;
        this.compilationsDone = compilationsDone;
    }
}
