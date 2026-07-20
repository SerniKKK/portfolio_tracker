"use client";

import { useEffect, useRef } from "react";

// TradingView Symbol Overview widget — dashboard-friendly. Clean area chart
// with time-range tabs (1D / 1M / 1Y / All). Lighter and less busy than the
// full Advanced Chart, which is designed for trading terminals.
export function MarketWidget({
  symbol,
  displayName,
}: {
  symbol: string;
  displayName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = `<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [[displayName, `${symbol}|1D`]],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "en",
      colorTheme: "dark",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      lineColor: "rgb(212, 176, 106)",
      topColor: "rgba(212, 176, 106, 0.28)",
      bottomColor: "rgba(212, 176, 106, 0.01)",
      lineWidth: 2,
      headerFontSize: "medium",
      backgroundColor: "rgba(20, 17, 15, 1)",
      gridLineColor: "rgba(58, 51, 45, 0.4)",
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, displayName]);

  return (
    <div
      ref={containerRef}
      key={symbol}
      className="tradingview-widget-container scale-in aspect-[4/3] w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] sm:aspect-[16/10] lg:aspect-[16/9]"
    />
  );
}
