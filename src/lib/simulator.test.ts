import { describe, expect, it } from "vitest";
import { mulberry32, normalSample, percentile, simulate } from "./simulator";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("gives different streams for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("percentile", () => {
  const data = [1, 2, 3, 4, 5];
  it("returns endpoints for q<=0 and q>=1", () => {
    expect(percentile(data, 0)).toBe(1);
    expect(percentile(data, 1)).toBe(5);
  });
  it("interpolates linearly between ranks", () => {
    expect(percentile(data, 0.5)).toBe(3);
    expect(percentile(data, 0.25)).toBe(2);
  });
  it("returns 0 for an empty array", () => {
    expect(percentile([], 0.5)).toBe(0);
  });
});

describe("normalSample", () => {
  it("has approximately zero mean and unit variance", () => {
    const rng = mulberry32(123);
    const n = 20000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const z = normalSample(rng);
      sum += z;
      sumSq += z * z;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(variance).toBeGreaterThan(0.9);
    expect(variance).toBeLessThan(1.1);
  });
});

describe("simulate", () => {
  const base = {
    initialValue: 100_000,
    horizonMonths: 120,
    expectedReturnAnnual: 0.08,
    volatilityAnnual: 0.15,
    monthlyContribution: 1000,
    numPaths: 300,
    seed: 42,
  };

  it("is reproducible for a fixed seed", () => {
    const a = simulate(base);
    const b = simulate(base);
    expect(a.p50).toEqual(b.p50);
    expect(a.p10).toEqual(b.p10);
    expect(a.p90).toEqual(b.p90);
  });

  it("returns horizon+1 points starting at month 0", () => {
    const r = simulate(base);
    expect(r.months).toHaveLength(121);
    expect(r.months[0]).toBe(0);
    expect(r.months[120]).toBe(120);
  });

  it("keeps the fan ordered p10 <= p50 <= p90 at every step", () => {
    const r = simulate(base);
    for (let i = 0; i < r.months.length; i++) {
      expect(r.p10[i]).toBeLessThanOrEqual(r.p50[i]);
      expect(r.p50[i]).toBeLessThanOrEqual(r.p90[i]);
    }
  });

  it("starts every percentile at the initial value", () => {
    const r = simulate(base);
    expect(r.p10[0]).toBe(base.initialValue);
    expect(r.p50[0]).toBe(base.initialValue);
    expect(r.p90[0]).toBe(base.initialValue);
  });

  it("grows the median with positive drift and contributions", () => {
    const r = simulate(base);
    expect(r.p50[r.p50.length - 1]).toBeGreaterThan(base.initialValue);
  });

  it("widens the p10/p90 spread as the horizon extends", () => {
    const r = simulate(base);
    const early = r.p90[12] - r.p10[12];
    const late = r.p90[120] - r.p10[120];
    expect(late).toBeGreaterThan(early);
  });
});
