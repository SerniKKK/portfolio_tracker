"use client";

import { useMemo, useState } from "react";
import type { PositionMetrics } from "@/lib/finance";
import {
  formatCurrency,
  formatDate,
  formatQuantity,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/format";
import { DeletePositionButton } from "./DeletePositionButton";

type SortKey =
  | "name"
  | "assetType"
  | "quantity"
  | "purchasePrice"
  | "currentPrice"
  | "currentValuePLN"
  | "pnlPLN"
  | "pnlPct"
  | "purchaseDate";

type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Name" },
  { key: "assetType", label: "Type" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: "purchasePrice", label: "Buy", align: "right" },
  { key: "currentPrice", label: "Now", align: "right" },
  { key: "currentValuePLN", label: "Value (PLN)", align: "right" },
  { key: "pnlPLN", label: "P/L (PLN)", align: "right" },
  { key: "pnlPct", label: "P/L %", align: "right" },
  { key: "purchaseDate", label: "Bought" },
];

export function PositionsTable({ metrics }: { metrics: PositionMetrics[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("currentValuePLN");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...metrics];
    arr.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = Number(av);
      const bn = Number(bv);
      return sortDir === "asc" ? an - bn : bn - an;
    });
    return arr;
  }, [metrics, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "assetType" ? "asc" : "desc");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className={`cursor-pointer select-none py-3 font-medium transition hover:text-[color:var(--foreground)] ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.label}
                {sortKey === c.key && (
                  <span className="ml-1 text-[color:var(--teal)]">
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
            <th className="py-3 text-right"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const positive = m.pnlPLN >= 0;
            return (
              <tr
                key={m.position.id}
                className="border-b border-[color:var(--border)]/60 transition hover:bg-[color:var(--surface-2)]/40"
              >
                <td className="py-3">
                  <div className="font-medium">{m.position.name}</div>
                  <div className="text-xs text-[color:var(--muted)]">
                    {m.position.ticker}
                  </div>
                </td>
                <td className="py-3">
                  <AssetTypeBadge type={m.position.assetType} />
                </td>
                <td className="py-3 text-right tabular-nums">
                  {formatQuantity(m.position.quantity)}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {formatCurrency(
                    m.position.purchasePrice,
                    m.position.purchaseCurrency
                  )}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {m.livePrice.isFallback ? (
                    <span className="text-[color:var(--muted)]">n/a</span>
                  ) : (
                    formatCurrency(m.livePrice.price, m.livePrice.currency)
                  )}
                </td>
                <td className="py-3 text-right tabular-nums font-medium">
                  {formatCurrency(m.currentValuePLN, "PLN")}
                </td>
                <td
                  className="py-3 text-right tabular-nums"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedCurrency(m.pnlPLN, "PLN")}
                </td>
                <td
                  className="py-3 text-right tabular-nums"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedPercent(m.pnlPct)}
                </td>
                <td className="py-3 text-[color:var(--muted)]">
                  {formatDate(m.position.purchaseDate)}
                </td>
                <td className="py-3 text-right">
                  <DeletePositionButton id={m.position.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getSortValue(m: PositionMetrics, key: SortKey): string | number {
  switch (key) {
    case "name":
      return m.position.name.toLowerCase();
    case "assetType":
      return m.position.assetType;
    case "quantity":
      return m.position.quantity;
    case "purchasePrice":
      return m.position.purchasePrice;
    case "currentPrice":
      return m.livePrice.price;
    case "currentValuePLN":
      return m.currentValuePLN;
    case "pnlPLN":
      return m.pnlPLN;
    case "pnlPct":
      return m.pnlPct;
    case "purchaseDate":
      return new Date(m.position.purchaseDate).getTime();
  }
}

function AssetTypeBadge({ type }: { type: string }) {
  const color = {
    STOCK: "var(--teal)",
    ETF: "var(--gold)",
    CRYPTO: "var(--teal)",
    CASH: "var(--muted)",
  }[type] ?? "var(--muted)";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-xs"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {type}
    </span>
  );
}
