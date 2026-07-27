import { describe, expect, it } from "vitest";
import type { SearchResult } from "./search";
import { scoreResult } from "./search";

function stock(ticker: string, name: string): SearchResult {
  return {
    key: `f:${ticker}`,
    ticker,
    name,
    assetType: "STOCK",
    currency: "USD",
    source: "finnhub",
  };
}

function coin(
  ticker: string,
  name: string,
  rank?: number
): SearchResult {
  return {
    key: `c:${ticker}`,
    ticker,
    name,
    assetType: "CRYPTO",
    currency: "USD",
    rank,
    source: "coingecko",
  };
}

describe("scoreResult", () => {
  it("scores an exact ticker match highly", () => {
    expect(scoreResult(stock("AAPL", "Apple Inc"), "aapl")).toBeGreaterThan(900);
  });

  it("returns 0 when nothing matches", () => {
    expect(scoreResult(stock("AAPL", "Apple Inc"), "zzz")).toBe(0);
  });

  it("ranks the real equity above a coincidental-ticker memecoin", () => {
    // Query "apple": a junk coin literally tickered APPLE must not beat AAPL.
    const apple = scoreResult(stock("AAPL", "Apple Inc"), "apple");
    const junk = scoreResult(coin("APPLE", "dog with apple in mouth", 5329), "apple");
    expect(apple).toBeGreaterThan(junk);
  });

  it("ranks an established coin above a same-named stock", () => {
    // Query "bitcoin": BTC (#1) should beat a company merely named 'Bitcoin ...'.
    const btc = scoreResult(coin("BTC", "Bitcoin", 1), "bitcoin");
    const co = scoreResult(stock("ADE.DE", "Bitcoin Group SE"), "bitcoin");
    expect(btc).toBeGreaterThan(co);
  });

  it("keeps an exact ticker query on the real stock ahead of a token proxy", () => {
    const stockScore = scoreResult(stock("AAPL", "Apple Inc"), "aapl");
    const tokenScore = scoreResult(coin("AAPL", "Apple - Robinhood Token", 2645), "aapl");
    expect(stockScore).toBeGreaterThan(tokenScore);
  });

  it("penalizes rankless coins more than ranked ones", () => {
    const ranked = scoreResult(coin("FOO", "Foo", 50), "foo");
    const rankless = scoreResult(coin("FOO", "Foo"), "foo");
    expect(ranked).toBeGreaterThan(rankless);
  });

  it("rewards a lower market-cap rank", () => {
    const top = scoreResult(coin("FOO", "Foo", 1), "foo");
    const mid = scoreResult(coin("FOO", "Foo", 100), "foo");
    expect(top).toBeGreaterThan(mid);
  });
});
