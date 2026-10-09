import { create } from "zustand";
import {
  INCIDENT_CAPACITY,
  INCIDENT_CHUNK_SIZE,
  METRIC_CAPACITY,
  METRIC_CHUNK_SIZE,
} from "@/shared/config/stream";
import { appendChunked, createChunkedRing, type ChunkedRing } from "@/shared/lib/ringBuffer";
import type { Incident, MetricSample, StreamCounters, StreamPhase, ThreatFilterMap, ThreatType } from "./types";

export interface IncidentStreamState {
  phase: StreamPhase;
  incidents: ChunkedRing<Incident>;
  metrics: ChunkedRing<MetricSample>;
  counters: StreamCounters;
  filters: ThreatFilterMap;
  pushIncidents: (batch: Incident[]) => void;
  pushMetric: (sample: MetricSample) => void;
  toggleThreat: (threatType: ThreatType) => void;
}

let sequence = 0;

function emptyThreatCounts(): Record<ThreatType, number> {
  return {
    DDoS: 0,
    "CanBus Injection": 0,
    BruteForce: 0,
  };
}

const initialCounters: StreamCounters = {
  received: 0,
  retained: 0,
  droppedByOverflow: 0,
  ingestRate: 0,
  lastTimestamp: 0,
  byThreat: emptyThreatCounts(),
};

export const useIncidentStore = create<IncidentStreamState>()((set) => ({
  phase: "idle",
  incidents: createChunkedRing<Incident>(INCIDENT_CAPACITY, INCIDENT_CHUNK_SIZE),
  metrics: createChunkedRing<MetricSample>(METRIC_CAPACITY, METRIC_CHUNK_SIZE),
  counters: initialCounters,
  filters: {
    DDoS: true,
    "CanBus Injection": true,
    BruteForce: true,
  },
  pushIncidents: (batch) => {
    if (batch.length === 0) return;

    set((state) => {
      const byThreat = { ...state.counters.byThreat };
      for (let index = 0; index < batch.length; index += 1) {
        sequence += 1;
        batch[index].id = sequence;
        byThreat[batch[index].payloadType] += 1;
      }

      const incidents = appendChunked(state.incidents, batch);
      const overwritten = Math.max(0, state.incidents.size + batch.length - incidents.capacity);
      const lastTimestamp = batch[batch.length - 1].timestamp;
      const elapsed =
        state.counters.lastTimestamp === 0 ? 16 : Math.max(1, lastTimestamp - state.counters.lastTimestamp);
      const instantRate = (batch.length * 1000) / elapsed;
      const ingestRate =
        state.counters.received === 0 ? instantRate : state.counters.ingestRate * 0.85 + instantRate * 0.15;

      return {
        phase: "live",
        incidents,
        counters: {
          received: state.counters.received + batch.length,
          retained: incidents.size,
          droppedByOverflow: state.counters.droppedByOverflow + overwritten,
          ingestRate,
          lastTimestamp,
          byThreat,
        },
      };
    });
  },
  pushMetric: (sample) => {
    set((state) => ({
      metrics: appendChunked(state.metrics, [sample]),
    }));
  },
  toggleThreat: (threatType) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [threatType]: !state.filters[threatType],
      },
    }));
  },
}));
