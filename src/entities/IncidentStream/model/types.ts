export const THREAT_TYPES = ["DDoS", "CanBus Injection", "BruteForce"] as const;

export type ThreatType = (typeof THREAT_TYPES)[number];

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export type StreamPhase = "idle" | "live";

export interface CoordinateBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Incident {
  id: number;
  vehicleId: string;
  bounds: CoordinateBounds;
  severity: SeverityLevel;
  timestamp: number;
  payloadType: ThreatType;
}

export interface MetricSample {
  timestamp: number;
  threatLevel: number;
  cpuLoad: number;
  packetThrottle: number;
  ticks: number;
  packetRate: number;
  latencyMs: number;
}

export interface StreamCounters {
  received: number;
  retained: number;
  droppedByOverflow: number;
  ingestRate: number;
  lastTimestamp: number;
  byThreat: Record<ThreatType, number>;
}

export type ThreatFilterMap = Record<ThreatType, boolean>;

export interface StreamSnapshot {
  phase: StreamPhase;
  received: number;
  retained: number;
  droppedByOverflow: number;
  ingestRate: number;
}
