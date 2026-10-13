
import type { Simulation } from "../models/Simulation";
import type { Action } from "../models/Action";

const COLORS: Record<string, string> = {
    compiling: "#16a34a",
    debugging: "#eab308",
    refactoring: "#64748b",
    waiting: "#cbd5e1",
    dongle_acquired: "#9333ea",
    burned_out: "#dc2626"
};

export class Timeline {
    private readonly leftMargin = 100;
    private readonly rightMargin = 30;
    private readonly topMargin = 45;
    private readonly rowHeight = 55;
    private readonly barHeight = 25;
    private readonly minMarkerWidth = 8;
    
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public render(simulation: Simulation): void {
        const width = 1200;
        const height =
            this.topMargin +
            simulation.coders.length * this.rowHeight +
            40;

        const allActions = simulation.coders.flatMap(
            coder => coder.actions
        );

        // Stop the entire chart at the first burnout.
        const burnoutTimes = allActions
            .filter(action => action.type === "burned_out")
            .map(action => action.startTime);

        const firstBurnout = burnoutTimes.length > 0
            ? Math.min(...burnoutTimes)
            : undefined;

        const maxTime = firstBurnout !== undefined
            ? Math.max(1, firstBurnout)
            : Math.max(
                1,
                ...allActions.map(action => action.endTime)
            );

        const plotWidth =
            width - this.leftMargin - this.rightMargin;

        let svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 ${width} ${height}"
                width="100%"
                style="min-width: 800px; font-family: sans-serif"
            >
        `;

        // Time axis.
        const tickCount = 10;

        for (let i = 0; i <= tickCount; i++) {
            const time = maxTime * i / tickCount;
            const x =
                this.leftMargin + plotWidth * i / tickCount;

            svg += `
                <line
                    x1="${x}" y1="${this.topMargin - 15}"
                    x2="${x}" y2="${height - 25}"
                    stroke="#e2e8f0"
                />
                <text
                    x="${x}" y="20"
                    text-anchor="middle"
                    font-size="12"
                    fill="#475569"
                >${Math.round(time)}</text>
            `;
        }

        svg += `
            <text
                x="${this.leftMargin + plotWidth / 2}"
                y="38"
                text-anchor="middle"
                font-size="11"
                fill="#64748b"
            >Time (ms)</text>
        `;

        // One row per coder.
        simulation.coders.forEach((coder, row) => {
            const y =
                this.topMargin + row * this.rowHeight;

            svg += `
                <text
                    x="12" y="${y + 17}"
                    font-size="14"
                    font-weight="600"
                    fill="#172033"
                >Coder ${coder.id}</text>
            `;

            const activities: Action[] = coder.actions.filter(
                action =>
                    [
                        "compiling",
                        "debugging",
                        "refactoring",
                        "waiting"
                    ].includes(action.type)
            );

            const markers: Action[] = coder.actions.filter(
                action =>
                    [
                        "dongle_acquired",
                        "burned_out"
                    ].includes(action.type)
            );

            for (const action of [...activities, ...markers]) {
                // Do not display events after the first burnout.
                if (
                    firstBurnout !== undefined &&
                    action.startTime > firstBurnout
                ) {
                    continue;
                }

                const startTime = action.startTime;
                const endTime = Math.min(
                    action.endTime,
                    maxTime
                );

                const startX =
                    this.leftMargin +
                    plotWidth * startTime / maxTime;

                const endX =
                    this.leftMargin +
                    plotWidth * endTime / maxTime;

                const isMarker =
                    action.type === "dongle_acquired" ||
                    action.type === "burned_out";

                const visualWidth = isMarker
                    ? this.minMarkerWidth
                    : Math.max(0, endX - startX);

                const x = isMarker
                    ? startX - this.minMarkerWidth / 2
                    : startX;

                const color =
                    COLORS[action.type] ?? "#94a3b8";

                const tooltip = [
                    `Coder: ${coder.id}`,
                    `Action: ${action.type}`,
                    `Start: ${action.startTime} ms`,
                    `End: ${endTime} ms`,
                    `Deadline: ${action.deadline} ms`,
                    `Compilations done: ${action.compilationsDone}`
                ].join("\n");

                svg += `
                    <rect
                        x="${x}"
                        y="${y}"
                        width="${visualWidth}"
                        height="${this.barHeight}"
                        rx="3"
                        fill="${color}"
                    >
                        <title>${this.escapeXml(tooltip)}</title>
                    </rect>
                `;
            }

            svg += `
                <line
                    x1="${this.leftMargin}"
                    y1="${y + this.barHeight + 8}"
                    x2="${width - this.rightMargin}"
                    y2="${y + this.barHeight + 8}"
                    stroke="#f1f5f9"
                />
            `;
        });

        svg += "</svg>";

        this.container.innerHTML = svg;
        this.container.style.overflowX = "auto";
    }

    private escapeXml(value: string): string {
        return value.replace(/[<>&"']/g, character => {
            const entities: Record<string, string> = {
                "<": "&lt;",
                ">": "&gt;",
                "&": "&amp;",
                '"': "&quot;",
                "'": "&apos;"
            };

            return entities[character];
        });
    }
}
