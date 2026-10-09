import type { Incident } from "./types";
import type { WorkerBatchMessage, WorkerCommand } from "./protocol";

export interface IncidentSource {
  start: (onIncident: (incident: Incident) => void) => () => void;
}

export function createWorkerIncidentSource(ratePerSecond: number): IncidentSource {
  return {
    start(onIncident) {
      const worker = new Worker(new URL("../worker/incident.worker.ts", import.meta.url));
      const startCommand: WorkerCommand = { type: "start", ratePerSecond };
      worker.postMessage(startCommand);
      worker.onmessage = (event: MessageEvent<WorkerBatchMessage>) => {
        if (event.data.type !== "batch") return;
        const incidents = event.data.incidents;
        for (let index = 0; index < incidents.length; index += 1) {
          onIncident(incidents[index]);
        }
      };

      return () => {
        const stopCommand: WorkerCommand = { type: "stop" };
        worker.postMessage(stopCommand);
        worker.terminate();
      };
    },
  };
}
