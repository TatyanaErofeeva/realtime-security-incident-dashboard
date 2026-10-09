export interface ChunkedRing<T> {
  readonly chunks: readonly (readonly T[])[];
  readonly writeChunk: number;
  readonly writeOffset: number;
  readonly size: number;
  readonly capacity: number;
}

export function createChunkedRing<T>(capacity: number, chunkSize: number): ChunkedRing<T> {
  if (capacity <= 0 || chunkSize <= 0 || capacity % chunkSize !== 0) {
    throw new Error(`Ring capacity ${capacity} must be a positive multiple of chunk size ${chunkSize}`);
  }

  const chunkCount = capacity / chunkSize;
  return {
    chunks: Array.from({ length: chunkCount }, () => [] as T[]),
    writeChunk: 0,
    writeOffset: 0,
    size: 0,
    capacity,
  };
}

export function appendChunked<T>(ring: ChunkedRing<T>, batch: readonly T[]): ChunkedRing<T> {
  if (batch.length === 0) return ring;

  const chunkCount = ring.chunks.length;
  const chunkSize = ring.capacity / chunkCount;
  if (batch.length >= ring.capacity) {
    return ringFromItems(batch.slice(batch.length - ring.capacity), ring.capacity, chunkSize);
  }

  const chunks = ring.chunks.slice() as T[][];
  let writeChunk = ring.writeChunk;
  let writeOffset = ring.writeOffset;
  let size = ring.size;
  let current: T[] | null = null;

  for (let index = 0; index < batch.length; index += 1) {
    if (current === null) current = chunks[writeChunk].slice();
    current[writeOffset] = batch[index];
    writeOffset += 1;
    if (size < ring.capacity) size += 1;

    if (writeOffset === chunkSize) {
      chunks[writeChunk] = current;
      current = null;
      writeChunk = (writeChunk + 1) % chunkCount;
      writeOffset = 0;
    }
  }

  if (current !== null) chunks[writeChunk] = current;

  return {
    chunks,
    writeChunk,
    writeOffset,
    size,
    capacity: ring.capacity,
  };
}

export function readRecent<T>(
  ring: ChunkedRing<T>,
  limit: number,
  predicate?: (item: T) => boolean,
): T[] {
  if (ring.size === 0 || limit <= 0) return [];

  const chunkCount = ring.chunks.length;
  const chunkSize = ring.capacity / chunkCount;
  let chunk = ring.writeChunk;
  let offset = ring.writeOffset - 1;
  if (ring.writeOffset === 0) {
    chunk = (ring.writeChunk - 1 + chunkCount) % chunkCount;
    offset = chunkSize - 1;
  }

  const picked: T[] = [];
  for (let seen = 0; seen < ring.size && picked.length < limit; seen += 1) {
    const item = ring.chunks[chunk][offset];
    if (!predicate || predicate(item)) picked.push(item);
    offset -= 1;
    if (offset < 0) {
      offset = chunkSize - 1;
      chunk = (chunk - 1 + chunkCount) % chunkCount;
    }
  }

  return picked;
}

export function itemAt<T>(ring: ChunkedRing<T>, index: number): T {
  const chunkCount = ring.chunks.length;
  const chunkSize = ring.capacity / chunkCount;
  const origin = ring.size === ring.capacity ? ring.writeChunk * chunkSize + ring.writeOffset : 0;
  const logical = origin + index;
  const wrapped = logical >= ring.capacity ? logical - ring.capacity : logical;
  return ring.chunks[(wrapped / chunkSize) | 0][wrapped % chunkSize];
}

export function forEachChronological<T>(ring: ChunkedRing<T>, visit: (item: T) => void): void {
  if (ring.size === 0) return;

  const chunkCount = ring.chunks.length;
  const chunkSize = ring.capacity / chunkCount;
  let chunk = 0;
  let offset = 0;
  if (ring.size === ring.capacity) {
    chunk = ring.writeChunk;
    offset = ring.writeOffset;
  }

  for (let seen = 0; seen < ring.size; seen += 1) {
    visit(ring.chunks[chunk][offset]);
    offset += 1;
    if (offset === chunkSize) {
      offset = 0;
      chunk = (chunk + 1) % chunkCount;
    }
  }
}

function ringFromItems<T>(items: readonly T[], capacity: number, chunkSize: number): ChunkedRing<T> {
  const chunkCount = capacity / chunkSize;
  const chunks: T[][] = Array.from({ length: chunkCount }, () => []);
  const size = items.length;
  for (let index = 0; index < size; index += 1) {
    chunks[Math.floor(index / chunkSize)][index % chunkSize] = items[index];
  }

  return {
    chunks,
    writeChunk: Math.floor(size / chunkSize) % chunkCount,
    writeOffset: size % chunkSize,
    size,
    capacity,
  };
}
