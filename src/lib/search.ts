import type { AssetType, Currency } from "@prisma/client";

export type SearchResult = {
  key: string; // unique key for React lists
  ticker: string; // symbol user will store
  name: string;
  assetType: AssetType;
  currency: Currency;
  exchange?: string;
  logo?: string;
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
        source: "coingecko",
      })
    );
  } catch {
    return [];
  }
}

function scoreResult(r: SearchResult, q: string): number {
  const qu = q.toUpperCase();
  const tk = r.ticker.toUpperCase();
  const nm = r.name.toUpperCase();
  if (tk === qu) return 1000;
  if (tk.startsWith(qu)) return 500 - tk.length;
  if (nm === qu) return 400;
  if (nm.startsWith(qu)) return 200 - nm.length;
  if (nm.includes(qu)) return 100 - nm.length;
  if (tk.includes(qu)) return 60 - tk.length;
  return 0;
}

export async function searchAll(q: string): Promise<SearchResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < 1) return [];

  const [finnhub, gecko] = await Promise.all([
    searchFinnhub(trimmed),
    searchCoinGecko(trimmed),
  ]);

  const merged = [...finnhub, ...gecko];
  merged.sort((a, b) => scoreResult(b, trimmed) - scoreResult(a, trimmed));
  return merged.slice(0, 12);
}
