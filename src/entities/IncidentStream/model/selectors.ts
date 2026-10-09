import { LOG_LIMIT } from "@/shared/config/stream";
import { readRecent } from "@/shared/lib/ringBuffer";
import type { IncidentStreamState } from "./store";
import type { Incident, StreamSnapshot } from "./types";

export function selectLogIncidents(state: IncidentStreamState): Incident[] {
  return readRecent(state.incidents, LOG_LIMIT, (incident) => state.filters[incident.payloadType]);
}

export function selectStreamSnapshot(state: IncidentStreamState): StreamSnapshot {
  return {
    phase: state.phase,
    received: state.counters.received,
    retained: state.counters.retained,
    droppedByOverflow: state.counters.droppedByOverflow,
    ingestRate: state.counters.ingestRate,
  };
}
