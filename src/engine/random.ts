export function createRandom(seed?: number): () => number {
  if (seed === undefined) {
    return Math.random;
  }

  if (!Number.isFinite(seed)) {
    throw new Error('Simulation seed must be finite.');
  }

  let state = Math.floor(seed) >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
