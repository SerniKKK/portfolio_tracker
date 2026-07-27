import type { AssetType, Currency } from "@prisma/client";

export type SearchResult = {
  key: string; // unique key for React lists
  ticker: string; // symbol user will store
  name: string;
  assetType: AssetType;
  currency: Currency;
  exchange?: string;
  logo?: string;
  rank?: number; // CoinGecko market_cap_rank; lower = more established
  source: "finnhub" | "coingecko";
};

function currencyFromSymbol(symbol: string): Currency {
  const upper = symbol.toUpperCase();
  if (upper.endsWith(".WA")) return "PLN";
  if (upper.endsWith(".DE") || upper.endsWith(".PA") || upper.endsWith(".AS"))
    return "EUR";
  return "USD";
}

function exchangeFromSymbol(symbol: string): string | undefined {
  const upper = symbol.toUpperCase();
  if (upper.endsWith(".WA")) return "GPW";
  if (upper.endsWith(".DE")) return "XETR";
  if (upper.endsWith(".PA")) return "EURONEXT";
  if (upper.endsWith(".AS")) return "EURONEXT";
  if (upper.includes(":")) return upper.split(":")[0];
  return undefined;
}

type FinnhubMatch = {
  description?: string;
  displaySymbol?: string;
  symbol?: string;
  type?: string;
};

export async function searchFinnhub(q: string): Promise<SearchResult[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];
  try {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: FinnhubMatch[] };
    const list = data.result ?? [];
    return list
      .filter((r) => r.symbol && r.description)
      .slice(0, 15)
      .map((r): SearchResult => {
        const symbol = r.displaySymbol || r.symbol!;
        const isEtf = r.type?.toLowerCase().includes("etf");
        return {
          key: `f:${symbol}`,
          ticker: symbol.toUpperCase(),
          name: r.description!,
          assetType: isEtf ? "ETF" : "STOCK",
          currency: currencyFromSymbol(symbol),
          exchange: exchangeFromSymbol(symbol),
          source: "finnhub",
        };
      });
  } catch {
    return [];
  }
}

type CoinGeckoCoin = {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

export async function searchCoinGecko(q: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { coins?: CoinGeckoCoin[] };
    const list = data.coins ?? [];
    return list.slice(0, 8).map(
      (c): SearchResult => ({
        key: `c:${c.id}`,
        ticker: c.symbol.toUpperCase(),
        name: c.name,
        assetType: "CRYPTO",
        currency: "USD",
        exchange: "CoinGecko",
        logo: c.thumb,
        rank: c.market_cap_rank ?? undefined,
        source: "coingecko",
      })
    );
  } catch {
    return [];
  }
}

// Base match score: how well the query matches the ticker/name. Ticker and
// name matches are kept close in value so a company-name query ("apple")
// isn't automatically beaten by a junk coin whose ticker happens to equal it.
function matchScore(r: SearchResult, qu: string): number {
  const tk = r.ticker.toUpperCase();
  const nm = r.name.toUpperCase();
  if (tk === qu) return 900;
  if (nm === qu) return 850;
  if (tk.startsWith(qu)) return 700 - tk.length;
  if (nm.startsWith(qu)) return 640 - nm.length;
  if (nm.includes(` ${qu}`)) return 400 - nm.length; // word-boundary hit
  if (nm.includes(qu)) return 250 - nm.length;
  if (tk.includes(qu)) return 150 - tk.length;
  return 0;
}

// Quality modifier: legitimacy of the instrument, independent of the query.
// Exchange-listed equities are real; established coins (low market-cap rank)
// are real; rankless CoinGecko hits are usually memecoins / tokenized proxies
// and get pushed down so they can't outrank the obvious match.
function qualityBonus(r: SearchResult): number {
  if (r.source === "finnhub") return 80;
  // Reward established coins (rank ~1 → +139) and penalize obscure / rankless
  // ones (memecoins, tokenized-stock proxies) down to a floor, so an exact
  // ticker match on a junk coin can't outrank a real equity or a top coin.
  const rank = r.rank ?? 9999;
  return Math.max(-400, 140 - rank);
}

// Exported for tests.
export function scoreResult(r: SearchResult, q: string): number {
  const qu = q.toUpperCase();
  const base = matchScore(r, qu);
  if (base <= 0) return 0;
  return base + qualityBonus(r);
}

// Sort by relevance, drop duplicates, cap the list. Pure so it can be tested
// without hitting the network. Finnhub returns the same symbol several times
// (e.g. "APP" once per listing/venue), which both duplicates rows and collides
// React keys; dedupe by asset type + ticker, keeping the best-scored entry.
// A crypto and a like-tickered stock stay distinct because assetType differs.
export function rankResults(
  results: SearchResult[],
  q: string,
  limit = 12
): SearchResult[] {
  const sorted = [...results].sort(
    (a, b) => scoreResult(b, q) - scoreResult(a, q)
  );
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of sorted) {
    const id = `${r.assetType}:${r.ticker.toUpperCase()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(r);
  }
  return deduped.slice(0, limit);
}

// Short-lived in-memory cache so repeated queries (typing the same thing,
// backspacing, several users searching "AAPL") don't burn the Finnhub quota
// of 60 req/min. Fluid Compute reuses instances, so this survives across
// requests on the same lambda. Keyed by the normalized query.
const SEARCH_TTL_MS = 60_000;
const searchCache = new Map<string, { at: number; results: SearchResult[] }>();

export async function searchAll(q: string): Promise<SearchResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) {
    return cached.results;
  }

  const [finnhub, gecko] = await Promise.all([
    searchFinnhub(trimmed),
    searchCoinGecko(trimmed),
  ]);

  const results = rankResults([...finnhub, ...gecko], trimmed);

  searchCache.set(cacheKey, { at: Date.now(), results });
  // Bound the map so a long-lived instance doesn't grow unboundedly.
  if (searchCache.size > 200) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }

  return results;
}
