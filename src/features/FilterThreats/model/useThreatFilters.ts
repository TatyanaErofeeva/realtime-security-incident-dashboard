"use client";

import { useIncidentStore } from "@/entities/IncidentStream";

export function useThreatFilters() {
  const filters = useIncidentStore((state) => state.filters);
  const byThreat = useIncidentStore((state) => state.counters.byThreat);
  const toggleThreat = useIncidentStore((state) => state.toggleThreat);
  return { filters, byThreat, toggleThreat };
}
