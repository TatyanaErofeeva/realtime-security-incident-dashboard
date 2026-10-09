"use client";

import { useStoreWithEqualityFn } from "zustand/traditional";
import { shallowEqual } from "@/shared/lib/shallow";
import { useIncidentStore, type IncidentStreamState } from "./store";

export function useIncidentSelector<T>(
  selector: (state: IncidentStreamState) => T,
  equalityFn: (left: T, right: T) => boolean = shallowEqual,
): T {
  return useStoreWithEqualityFn(useIncidentStore, selector, equalityFn);
}
