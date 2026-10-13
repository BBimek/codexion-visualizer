import { Action } from "./Action";

export class Coder {
    public actions: Action[] = [];
    public lastCompileStart: number = 0;
    public deadline: number = 0;
    public compilationsDone: number = 0;
    public burnedOut: boolean = false;

    constructor(public id: number) {}
}