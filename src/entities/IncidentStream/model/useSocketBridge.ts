"use client";

import { useEffect } from "react";
import { startIncidentMock } from "@/shared/api/streamMock";
import { useIncidentStore } from "./store";

export function useSocketBridge(): void {
  useEffect(() => {
    useIncidentStore.setState({ phase: "live" });
    const stop = startIncidentMock({
      onIncidents(batch) {
        useIncidentStore.getState().pushIncidents(batch);
      },
      onMetric(sample) {
        useIncidentStore.getState().pushMetric(sample);
      },
    });

    return () => {
      stop();
      useIncidentStore.setState({ phase: "idle" });
    };
  }, []);
}
