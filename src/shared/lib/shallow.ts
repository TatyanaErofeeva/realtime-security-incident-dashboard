export function shallowEqual<T>(left: T, right: T): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== "object" || typeof right !== "object" || left === null || right === null) {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);
  if (leftKeys.length !== rightKeys.length) return false;

  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index];
    if (!Object.prototype.hasOwnProperty.call(rightRecord, key)) return false;
    if (!Object.is(leftRecord[key], rightRecord[key])) return false;
  }

  return true;
}
