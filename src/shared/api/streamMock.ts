import type { Incident, MetricSample, SeverityLevel } from "@/entities/IncidentStream/model/types";
import { WORLD_EAST, WORLD_NORTH, WORLD_SOUTH, WORLD_WEST } from "@/shared/lib/canvas/project";

const BATCH_MS = 16;
const METRIC_MS = 1000;
const MIN_BATCH = 5;
const MAX_BATCH = 30;
const BOUNDS_SPAN = 0.2;
const VIN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const PAYLOAD_TYPES = ["DDoS", "CanBus Injection", "BruteForce"] as const;
const SEVERITIES: readonly SeverityLevel[] = [1, 2, 3, 4, 5];

export interface MockStreamHandlers {
  onIncidents: (batch: Incident[]) => void;
  onMetric: (sample: MetricSample) => void;
}

export function startIncidentMock(handlers: MockStreamHandlers): () => void {
  let ticks = 0;
  let incidentsThisSecond = 0;
  let severitySum = 0;

  const publishIncidents = () => {
    const batch = createIncidentBatch(Date.now());
    ticks += 1;
    incidentsThisSecond += batch.length;
    for (let index = 0; index < batch.length; index += 1) {
      severitySum += batch[index].severity;
    }
    handlers.onIncidents(batch);
  };

  const publishMetric = () => {
    const packetRate = incidentsThisSecond;
    const threatLevel = packetRate === 0 ? 0 : (severitySum / packetRate / 5) * 100;
    const latencyMs = Math.random() < 0.2 ? 80 + Math.random() * 220 : 8 + Math.random() * 36;
    const cpuLoad = 18 + Math.random() * 32 + Math.min(40, packetRate / 28);
    handlers.onMetric({
      timestamp: Date.now(),
      threatLevel: clampPercent(threatLevel),
      cpuLoad: clampPercent(cpuLoad),
      packetThrottle: clampPercent(latencyMs / 3),
      ticks,
      packetRate,
      latencyMs,
    });
    incidentsThisSecond = 0;
    severitySum = 0;
  };

  const incidentTimer = window.setInterval(publishIncidents, BATCH_MS);
  const metricTimer = window.setInterval(publishMetric, METRIC_MS);

  return () => {
    window.clearInterval(incidentTimer);
    window.clearInterval(metricTimer);
  };
}

function createIncidentBatch(timestamp: number): Incident[] {
  const count = randomInt(MIN_BATCH, MAX_BATCH);
  const batch = new Array<Incident>(count);
  for (let index = 0; index < count; index += 1) {
    batch[index] = createIncident(timestamp);
  }
  return batch;
}

function createIncident(timestamp: number): Incident {
  const latitude = randomBetween(WORLD_SOUTH + BOUNDS_SPAN, WORLD_NORTH - BOUNDS_SPAN);
  const longitude = randomBetween(WORLD_WEST + BOUNDS_SPAN, WORLD_EAST - BOUNDS_SPAN);
  const payloadType = PAYLOAD_TYPES[Math.floor(Math.random() * PAYLOAD_TYPES.length)];
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];

  return {
    id: 0,
    vehicleId: createVehicleId(),
    bounds: {
      north: latitude + BOUNDS_SPAN,
      south: latitude - BOUNDS_SPAN,
      east: longitude + BOUNDS_SPAN,
      west: longitude - BOUNDS_SPAN,
    },
    severity,
    timestamp,
    payloadType,
  };
}

function createVehicleId(): string {
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += VIN_ALPHABET[Math.floor(Math.random() * VIN_ALPHABET.length)];
  }
  return `VIN-${suffix}`;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 100) return 100;
  return value;
}
