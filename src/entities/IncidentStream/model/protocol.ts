import type { Incident } from "./types";

export interface WorkerStartCommand {
  type: "start";
  ratePerSecond: number;
}

export interface WorkerStopCommand {
  type: "stop";
}

export type WorkerCommand = WorkerStartCommand | WorkerStopCommand;

export interface WorkerBatchMessage {
  type: "batch";
  incidents: Incident[];
}
