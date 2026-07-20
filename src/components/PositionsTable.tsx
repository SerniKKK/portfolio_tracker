"use client";

import { useMemo, useState } from "react";
import type { PositionMetrics } from "@/lib/finance";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatFetchedAt,
  formatQuantity,
  formatSignedCompact,
  formatSignedPercent,
} from "@/lib/format";
import { colorForKey } from "@/lib/palette";
import { DeletePositionButton } from "./DeletePositionButton";
import { ArrowDown, ArrowUp, ArrowUpDown, MousePointerClick } from "lucide-react";

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
  { key: "name", label: "Position" },
  { key: "assetType", label: "Type" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: "purchasePrice", label: "Avg buy", align: "right" },
  { key: "currentPrice", label: "Price", align: "right" },
  { key: "currentValuePLN", label: "Value", align: "right" },
  { key: "pnlPLN", label: "P/L", align: "right" },
  { key: "pnlPct", label: "%", align: "right" },
  { key: "purchaseDate", label: "Bought" },
];

export function PositionsTable({
  metrics,
  selectedId,
  onSelect,
}: {
  metrics: PositionMetrics[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
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
    <div className="-mx-2 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {COLUMNS.map((c) => {
              const active = sortKey === c.key;
              const SortIcon = active
                ? sortDir === "asc"
                  ? ArrowUp
                  : ArrowDown
                : ArrowUpDown;
              return (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`cursor-pointer select-none border-b border-[color:var(--border)] py-3 px-2 font-medium transition hover:text-[color:var(--foreground)] ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                    {c.label}
                    <SortIcon
                      className={`size-3 ${active ? "text-[color:var(--accent-gold)]" : "text-[color:var(--border-strong)]"}`}
                    />
                  </span>
                </th>
              );
            })}
            <th className="border-b border-[color:var(--border)] py-3 px-2 text-right" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const positive = m.pnlPLN >= 0;
            const isSelected = selectedId === m.position.id;
            const clickable = Boolean(onSelect) && m.position.assetType !== "CASH";
            const dotColor = colorForKey(m.position.ticker);
            return (
              <tr
                key={m.position.id}
                onClick={
                  clickable ? () => onSelect?.(m.position.id) : undefined
                }
                className={`group border-b border-[color:var(--border)]/60 transition-colors ${
                  clickable ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-[color:var(--surface-elevated)]"
                    : "hover:bg-[color:var(--surface-elevated)]/60"
                }`}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-[color:var(--background)]"
                      style={{ backgroundColor: dotColor }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{m.position.name}</span>
                        {clickable && isSelected && (
                          <MousePointerClick className="size-3 text-[color:var(--accent-gold)]" />
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--muted)]">
                        {m.position.ticker}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <AssetTypeBadge type={m.position.assetType} />
                </td>
                <td className="tabular py-3 px-2 text-right">
                  {formatQuantity(m.position.quantity)}
                </td>
                <td className="tabular py-3 px-2 text-right text-[color:var(--muted-strong)]">
                  {formatCurrency(
                    m.position.purchasePrice,
                    m.position.purchaseCurrency
                  )}
                </td>
                <td className="tabular py-3 px-2 text-right">
                  {m.livePrice.isFallback ? (
                    <span className="text-[color:var(--muted)]">n/a</span>
                  ) : (
                    <>
                      <div>
                        {formatCurrency(m.livePrice.price, m.livePrice.currency)}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{
                          color: m.livePrice.isStale
                            ? "var(--negative)"
                            : "var(--muted)",
                        }}
                      >
                        {formatFetchedAt(m.livePrice.fetchedAt)}
                      </div>
                    </>
                  )}
                </td>
                <td className="tabular py-3 px-2 text-right font-medium">
                  {formatCompactCurrency(m.currentValuePLN, "PLN")}
                </td>
                <td
                  className="tabular py-3 px-2 text-right"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedCompact(m.pnlPLN, "PLN")}
                </td>
                <td
                  className="tabular py-3 px-2 text-right"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedPercent(m.pnlPct)}
                </td>
                <td className="py-3 px-2 text-[11px] text-[color:var(--muted)]">
                  {formatDate(m.position.purchaseDate)}
                </td>
                <td
                  className="py-3 px-2 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
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

const ASSET_TYPE_STYLE: Record<string, { color: string; label: string }> = {
  STOCK: { color: "hsl(172 40% 55%)", label: "Stock" },
  ETF: { color: "hsl(38 45% 62%)", label: "ETF" },
  CRYPTO: { color: "hsl(280 30% 65%)", label: "Crypto" },
  CASH: { color: "hsl(30 5% 55%)", label: "Cash" },
};

function AssetTypeBadge({ type }: { type: string }) {
  const s = ASSET_TYPE_STYLE[type] ?? {
    color: "var(--muted)",
    label: type,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
      style={{
        color: s.color,
        borderColor: `${s.color}33`,
        backgroundColor: `${s.color}12`,
      }}
    >
      {s.label}
    </span>
  );
}
