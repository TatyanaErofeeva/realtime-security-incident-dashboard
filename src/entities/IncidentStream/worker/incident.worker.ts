import { FRAME_BATCH_MS } from "../../../shared/config/stream";
import { createRng } from "../../../shared/lib/rng";
import {
  WORLD_EAST,
  WORLD_NORTH,
  WORLD_SOUTH,
  WORLD_WEST,
} from "../../../shared/lib/canvas/project";
import type { WorkerBatchMessage, WorkerCommand } from "../model/protocol";
import { THREAT_TYPES, type Incident, type SeverityLevel } from "../model/types";

interface FleetCluster {
  latitude: number;
  longitude: number;
  spread: number;
}

const CLUSTERS: readonly FleetCluster[] = [
  { latitude: 50.1, longitude: 10.4, spread: 14 },
  { latitude: 40.4, longitude: -86.9, spread: 18 },
  { latitude: 35.7, longitude: 139.7, spread: 8 },
  { latitude: 31.2, longitude: 121.4, spread: 10 },
  { latitude: 19.4, longitude: -99.1, spread: 8 },
  { latitude: -23.5, longitude: -46.6, spread: 8 },
  { latitude: 25.2, longitude: 55.3, spread: 6 },
  { latitude: 52.5, longitude: 13.4, spread: 5 },
];

const SEVERITIES: readonly SeverityLevel[] = [1, 2, 3, 4, 5];

interface WorkerHost {
  onmessage: ((event: MessageEvent<WorkerCommand>) => void) | null;
  postMessage: (message: WorkerBatchMessage) => void;
}

const host = globalThis as unknown as WorkerHost;
const random = createRng(0x5eed1234);
let ratePerSecond = 1000;
let running = false;
let localId = 0;
let timer = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createIncident(timestamp: number): Incident {
  localId += 1;
  const cluster = CLUSTERS[Math.floor(random() * CLUSTERS.length)];
  const latitude = clamp(
    cluster.latitude + (random() - 0.5) * cluster.spread,
    WORLD_SOUTH + 1,
    WORLD_NORTH - 1,
  );
  const longitude = clamp(
    cluster.longitude + (random() - 0.5) * cluster.spread,
    WORLD_WEST + 1,
    WORLD_EAST - 1,
  );
  const span = 0.05;
  const payloadType = THREAT_TYPES[Math.floor(random() * THREAT_TYPES.length)];
  const severity = SEVERITIES[Math.floor(random() * SEVERITIES.length)];

  return {
    id: 0,
    vehicleId: `VH-${1000 + (localId % 8000)}`,
    bounds: {
      north: latitude + span,
      south: latitude - span,
      east: longitude + span,
      west: longitude - span,
    },
    severity,
    timestamp,
    payloadType,
  };
}

function emitBatch(): void {
  const count = Math.max(1, Math.round((ratePerSecond * FRAME_BATCH_MS) / 1000));
  const timestamp = Date.now();
  const incidents = new Array<Incident>(count);
  for (let index = 0; index < count; index += 1) {
    incidents[index] = createIncident(timestamp);
  }
  host.postMessage({ type: "batch", incidents });
}

function schedule(nextAt: number): void {
  const delay = Math.max(0, nextAt - performance.now());
  timer = setTimeout(() => {
    if (!running) return;
    emitBatch();
    let following = nextAt + FRAME_BATCH_MS;
    const now = performance.now();
    if (following < now) following = now + FRAME_BATCH_MS;
    schedule(following);
  }, delay) as unknown as number;
}

host.onmessage = (event) => {
  if (event.data.type === "start") {
    ratePerSecond = event.data.ratePerSecond;
    if (running) return;
    running = true;
    schedule(performance.now() + FRAME_BATCH_MS);
    return;
  }

  running = false;
  clearTimeout(timer);
};
