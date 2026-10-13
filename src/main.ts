
import "./style.css";

import { Simulation } from "./models/Simulation";
import { LogParser } from "./parser/LogParser";
import { IntervalReconstructor } from "./parser/IntervalReconstructor";
import { Timeline } from "./visualization/Timeline";

const form = document.querySelector<HTMLFormElement>(
    "#simulation-form"
);
const logInput = document.querySelector<HTMLTextAreaElement>(
    "#log-input"
);
const fileInput = document.querySelector<HTMLInputElement>(
    "#log-file"
);
const status = document.querySelector<HTMLParagraphElement>(
    "#status"
);
const timelineContainer = document.querySelector<HTMLDivElement>(
    "#timeline"
);

if (!form || !logInput || !fileInput || !status || !timelineContainer) {
    throw new Error("Could not find required HTML elements.");
}

const timeline = new Timeline(timelineContainer);

fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];

    if (file) {
        logInput.value = await file.text();
    }
});

form.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    const input = logInput.value.trim();

    if (!input) {
        status.textContent = "Upload a file or paste simulation output.";
        return;
    }

    const values = new FormData(form);

    const numberSetting = (name: string): number =>
        Number(values.get(name));

    const scheduler = values.get("scheduler");

    if (scheduler !== "fifo" && scheduler !== "edf") {
        status.textContent = "Invalid scheduler.";
        return;
    }

    const numberOfCoders = numberSetting("numberOfCoders");

    if (!Number.isInteger(numberOfCoders) || numberOfCoders < 1) {
        status.textContent = "Number of coders must be a positive integer.";
        return;
    }

    const simulation = new Simulation({
        numberOfCoders,
        timeToBurnout: numberSetting("timeToBurnout"),
        timeToCompile: numberSetting("timeToCompile"),
        timeToDebug: numberSetting("timeToDebug"),
        timeToRefactor: numberSetting("timeToRefactor"),
        numberOfCompilesRequired: numberSetting(
            "numberOfCompilesRequired"
        ),
        dongleCooldown: numberSetting("dongleCooldown"),
        scheduler
    });

    LogParser.parse(input, simulation);
    IntervalReconstructor.reconstruct(simulation);
    timeline.render(simulation);

    status.textContent =
        `Loaded ${simulation.coders.length} coders successfully.`;
});
