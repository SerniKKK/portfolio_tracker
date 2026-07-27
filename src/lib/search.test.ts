import { describe, expect, it } from "vitest";
import type { SearchResult } from "./search";
import { rankResults, scoreResult } from "./search";

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

describe("rankResults", () => {
  it("collapses duplicate asset-type + ticker entries (Finnhub repeats)", () => {
    // Finnhub returns the same symbol several times -> one row after dedupe.
    const out = rankResults(
      [
        stock("APP", "AppLovin Corp - Class A"),
        stock("APP", "AppLovin Corp"),
        stock("APP", "AppLovin Corp - Class A"),
      ],
      "app"
    );
    expect(out).toHaveLength(1);
    expect(out[0].ticker).toBe("APP");
  });

  it("produces unique React keys (regression: two children with key f:APP)", () => {
    const out = rankResults(
      [stock("APP", "AppLovin Corp"), stock("APP", "AppLovin Corp - Class A")],
      "app"
    );
    const keys = out.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps a stock and a like-tickered crypto as separate rows", () => {
    const out = rankResults(
      [stock("AAPL", "Apple Inc"), coin("AAPL", "Apple Robinhood Token", 2645)],
      "aapl"
    );
    expect(out).toHaveLength(2);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 30 }, (_, i) => stock(`T${i}`, `Name ${i}`));
    expect(rankResults(many, "name", 12)).toHaveLength(12);
  });
});
