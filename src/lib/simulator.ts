// Monte Carlo simulator for portfolio value projections.
// Pure module: no I/O, no fetch, no computation of inputs from external state.
// The caller supplies volatility and expected return; the sim never reaches
// out to compute them. This lets the same code drive form-input scenarios
// today and historical-volatility scenarios tomorrow without touching the math.

export type SimulateInput = {
  initialValue: number;
  horizonMonths: number;
  expectedReturnAnnual: number; // e.g. 0.08 = 8%
  volatilityAnnual: number; // e.g. 0.15 = 15%
  monthlyContribution: number;
  numPaths?: number;
  seed?: number;
};

export type SimulateResult = {
  months: number[]; // 0..horizonMonths inclusive
  p10: number[];
  p50: number[];
  p90: number[];
};

export function simulate(input: SimulateInput): SimulateResult {
  const paths = input.numPaths ?? 500;
  const horizon = Math.max(1, Math.floor(input.horizonMonths));
  const seed = input.seed ?? Math.floor(Math.random() * 2 ** 32);
  const rng = mulberry32(seed);

  const monthlyDrift = input.expectedReturnAnnual / 12;
  const monthlyVol = input.volatilityAnnual / Math.sqrt(12);
  const contrib = input.monthlyContribution;
  const initial = input.initialValue;

  // valuesAtStep[step] holds the value across all paths at that step.
  const valuesAtStep: number[][] = Array.from({ length: horizon + 1 }, () => []);
  valuesAtStep[0] = Array(paths).fill(initial);

  for (let p = 0; p < paths; p++) {
    let v = initial;
    for (let m = 1; m <= horizon; m++) {
      const z = normalSample(rng);
      // Log-normal GBM step with Ito drift correction.
      v = v * Math.exp(monthlyDrift - 0.5 * monthlyVol * monthlyVol + monthlyVol * z);
      v += contrib;
      valuesAtStep[m].push(v);
    }
  }

  const months: number[] = [];
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  for (let m = 0; m <= horizon; m++) {
    months.push(m);
    const sorted = [...valuesAtStep[m]].sort((a, b) => a - b);
    p10.push(percentile(sorted, 0.1));
    p50.push(percentile(sorted, 0.5));
    p90.push(percentile(sorted, 0.9));
  }

  return { months, p10, p50, p90 };
}

// ---- helpers (exported for tests) ----

export function percentile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  if (q <= 0) return sortedAsc[0];
  if (q >= 1) return sortedAsc[sortedAsc.length - 1];
  const idx = q * (sortedAsc.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
}

// Mulberry32 — small, fast, deterministic PRNG. Perfect for reproducible sims.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform: two uniforms -> one standard normal.
// We discard the second sample for simplicity; halving performance is fine
// for the sizes we run here.
export function normalSample(rng: () => number): number {
  let u1 = rng();
  let u2 = rng();
  if (u1 < 1e-12) u1 = 1e-12;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
