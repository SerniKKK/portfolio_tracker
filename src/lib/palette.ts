// Deterministic color palette for a string key (ticker, name).
// Same input always produces the same color, so charts stay stable
// as data reorders. No cycling artifacts even for >20 positions.

const HUES_STOPS = [172, 43, 210, 280, 340, 15, 130, 250, 60, 190];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function colorForKey(key: string): string {
  const h = hash(key.toUpperCase());
  const hue = HUES_STOPS[h % HUES_STOPS.length];
  const jitter = (h >> 8) & 0x1f; // -16..15 range
  const finalHue = (hue + jitter - 16 + 360) % 360;
  const saturation = 55 + ((h >> 13) & 0x0f); // 55-70
  const lightness = 55 + ((h >> 17) & 0x0f); // 55-70
  return `hsl(${finalHue} ${saturation}% ${lightness}%)`;
}
