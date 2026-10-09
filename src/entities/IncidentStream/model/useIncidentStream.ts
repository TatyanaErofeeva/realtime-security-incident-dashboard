"use client";

import { useSocketBridge } from "./useSocketBridge";

export function useIncidentStream(): void {
  useSocketBridge();
}
