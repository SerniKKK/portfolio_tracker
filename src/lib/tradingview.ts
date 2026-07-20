import type { AssetType } from "@prisma/client";

// Map an internal ticker to a TradingView symbol string.
// TradingView widgets accept either "EXCHANGE:SYMBOL" or plain "SYMBOL" (they
// resolve the exchange in the latter case, but explicit is faster + safer).
// Returns null for tickers that have no market widget (cash).
export function toTradingViewSymbol(
  ticker: string,
  assetType: AssetType
): string | null {
  const upper = ticker.toUpperCase();

  if (assetType === "CASH") return null;

  if (assetType === "CRYPTO") {
    // Default to Binance USDT pair, which covers the vast majority of tickers.
    return `BINANCE:${upper}USDT`;
  }

  // Stocks / ETFs — honor common exchange suffixes.
  if (upper.endsWith(".WA")) return `GPW:${upper.replace(".WA", "")}`;
  if (upper.endsWith(".DE")) return `XETR:${upper.replace(".DE", "")}`;
  if (upper.endsWith(".PA")) return `EURONEXT:${upper.replace(".PA", "")}`;
  if (upper.endsWith(".AS")) return `EURONEXT:${upper.replace(".AS", "")}`;

  // Unqualified — let TradingView resolve.
  return upper;
}
