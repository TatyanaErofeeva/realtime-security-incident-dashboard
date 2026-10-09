import { TARGET_INCIDENTS_PER_SECOND } from "@/shared/config/stream";
import type { MetricSample } from "./types";

export interface MetricWindow {
  timestamp: number;
  eventCount: number;
  severitySum: number;
  dropped: number;
  ingestMs: number;
  paintMs: number;
  windowMs: number;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 100) return 100;
  return value;
}

export function buildMetricSample(windowSample: MetricWindow): MetricSample {
  const threatLevel =
    windowSample.eventCount === 0 ? 0 : (windowSample.severitySum / windowSample.eventCount / 5) * 100;
  const cpuLoad =
    windowSample.windowMs <= 0
      ? 0
      : ((windowSample.ingestMs + windowSample.paintMs) / windowSample.windowMs) * 100;
  const perSecond = windowSample.windowMs <= 0 ? 0 : (windowSample.eventCount * 1000) / windowSample.windowMs;
  const ratePressure = (perSecond / TARGET_INCIDENTS_PER_SECOND) * 100;
  const shed =
    windowSample.eventCount === 0 ? 0 : (Math.max(0, windowSample.dropped) / windowSample.eventCount) * 100;
  const packetThrottle = ratePressure * 0.5 + Math.min(100, shed) * 0.5;

  return {
    timestamp: windowSample.timestamp,
    threatLevel: clampPercent(threatLevel),
    cpuLoad: clampPercent(cpuLoad),
    packetThrottle: clampPercent(packetThrottle),
    ticks: windowSample.eventCount,
    packetRate: perSecond,
    latencyMs: Math.max(0, windowSample.dropped),
  };
}
