// Minimal ticker -> CoinGecko coin id map. Extend as needed.
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

export async function fetchCryptoPricesUSD(
  tickers: string[]
): Promise<Map<string, number>> {
  const uniqueTickers = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const idPairs = uniqueTickers
    .map((t) => [t, TICKER_TO_ID[t]] as const)
    .filter(([, id]) => Boolean(id));

  if (idPairs.length === 0) return new Map();

  const idsParam = idPairs.map(([, id]) => id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`);

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const out = new Map<string, number>();
  for (const [ticker, id] of idPairs) {
    const price = data[id]?.usd;
    if (typeof price === "number") out.set(ticker, price);
  }
  return out;
}
