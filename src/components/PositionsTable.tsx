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
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className={`cursor-pointer select-none border-b border-[color:var(--border)] py-2.5 px-2 font-medium transition hover:text-[color:var(--foreground)] ${
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
            <th className="border-b border-[color:var(--border)] py-2.5 px-2 text-right" />
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
                className={`border-b border-[color:var(--border)]/40 transition ${
                  clickable ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-[color:var(--surface-2)]/70"
                    : "hover:bg-[color:var(--surface-2)]/40"
                }`}
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {m.position.name}
                      </div>
                      <div className="text-[11px] text-[color:var(--muted)]">
                        {m.position.ticker}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <AssetTypeBadge type={m.position.assetType} />
                </td>
                <td className="tabular py-2.5 px-2 text-right">
                  {formatQuantity(m.position.quantity)}
                </td>
                <td className="tabular py-2.5 px-2 text-right text-[color:var(--muted)]">
                  {formatCurrency(
                    m.position.purchasePrice,
                    m.position.purchaseCurrency
                  )}
                </td>
                <td className="tabular py-2.5 px-2 text-right">
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
                <td className="tabular py-2.5 px-2 text-right font-medium">
                  {formatCompactCurrency(m.currentValuePLN, "PLN")}
                </td>
                <td
                  className="tabular py-2.5 px-2 text-right"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedCompact(m.pnlPLN, "PLN")}
                </td>
                <td
                  className="tabular py-2.5 px-2 text-right"
                  style={{
                    color: positive ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {formatSignedPercent(m.pnlPct)}
                </td>
                <td className="py-2.5 px-2 text-[11px] text-[color:var(--muted)]">
                  {formatDate(m.position.purchaseDate)}
                </td>
                <td
                  className="py-2.5 px-2 text-right"
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

const ASSET_TYPE_STYLE: Record<
  string,
  { color: string; label: string }
> = {
  STOCK: { color: "var(--teal)", label: "Stock" },
  ETF: { color: "var(--gold)", label: "ETF" },
  CRYPTO: { color: "#c084fc", label: "Crypto" },
  CASH: { color: "var(--muted)", label: "Cash" },
};

function AssetTypeBadge({ type }: { type: string }) {
  const s = ASSET_TYPE_STYLE[type] ?? {
    color: "var(--muted)",
    label: type,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ color: s.color }}
    >
      <span
        className="h-1 w-1 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}
