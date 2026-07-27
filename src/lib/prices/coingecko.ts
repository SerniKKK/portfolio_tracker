// Fallback ticker -> CoinGecko coin id map for positions created before we
// persisted the coin id (externalId). New positions carry their own id.
const TICKER_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  BNB: "binancecoin",
  XRP: "ripple",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  LTC: "litecoin",
};

export type CryptoLookup = { ticker: string; externalId?: string | null };

export async function fetchCryptoPricesUSD(
  coins: CryptoLookup[]
): Promise<Map<string, number>> {
  // Resolve each ticker to a coin id: prefer the persisted externalId, fall
  // back to the hardcoded map for older positions. Dedupe by ticker.
  const byTicker = new Map<string, string>();
  for (const { ticker, externalId } of coins) {
    const t = ticker.toUpperCase();
    if (byTicker.has(t)) continue;
    const id = externalId?.trim() || TICKER_TO_ID[t];
    if (id) byTicker.set(t, id);
  }
  const idPairs = [...byTicker.entries()];

  if (idPairs.length === 0) return new Map();

  const idsParam = idPairs.map(([, id]) => id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`);

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const out = new Map<string, number>();
  for (const [ticker, id] of idPairs) {
    const price = data[id]?.usd;
    if (typeof price === "number") out.set(ticker, price);
  }
  return out;
}
