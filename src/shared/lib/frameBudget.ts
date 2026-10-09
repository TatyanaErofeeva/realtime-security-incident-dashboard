let ingestMs = 0;
let paintMs = 0;

export function addIngestCost(milliseconds: number): void {
  ingestMs += milliseconds;
}

export function addPaintCost(milliseconds: number): void {
  paintMs += milliseconds;
}

export function consumeFrameBudget(): { ingestMs: number; paintMs: number } {
  const snapshot = { ingestMs, paintMs };
  ingestMs = 0;
  paintMs = 0;
  return snapshot;
}
