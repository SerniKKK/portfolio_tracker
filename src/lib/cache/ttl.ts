export const CRYPTO_TTL_MS = 5 * 60 * 1000;
export const STOCK_TTL_MS = 15 * 60 * 1000;
export const FX_TTL_MS = 60 * 60 * 1000;

export function isStale(fetchedAt: Date | null | undefined, ttlMs: number): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > ttlMs;
}
