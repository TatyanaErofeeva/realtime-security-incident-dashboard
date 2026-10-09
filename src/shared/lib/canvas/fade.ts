export function opacityFromAge(ageMs: number, lifetimeMs: number): number {
  if (lifetimeMs <= 0 || ageMs <= 0) return 1;
  if (ageMs >= lifetimeMs) return 0;
  return 1 - ageMs / lifetimeMs;
}

export function alphaBucket(opacity: number, bucketCount: number): number {
  if (bucketCount <= 1) return 0;
  if (opacity >= 1) return bucketCount - 1;
  if (opacity <= 0) return 0;
  return Math.min(bucketCount - 1, Math.floor(opacity * bucketCount));
}
