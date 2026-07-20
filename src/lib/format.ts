import type { Currency } from "@prisma/client";

const currencyFormatters = new Map<Currency, Intl.NumberFormat>();

function getCurrencyFormatter(currency: Currency): Intl.NumberFormat {
  let f = currencyFormatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(currency, f);
  }
  return f;
}

export function formatCurrency(value: number, currency: Currency): string {
  if (!Number.isFinite(value)) return "-";
  return getCurrencyFormatter(currency).format(value);
}

export function formatSignedCurrency(value: number, currency: Currency): string {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${getCurrencyFormatter(currency).format(value)}`;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return "-";
  return percentFormatter.format(ratio);
}

export function formatSignedPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return "-";
  const sign = ratio > 0 ? "+" : "";
  return `${sign}${percentFormatter.format(ratio)}`;
}

const quantityFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
});

export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return quantityFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFormatter.format(d);
}

export function formatFetchedAt(fetchedAt: Date | string | null): string {
  if (!fetchedAt) return "n/a";
  const d = typeof fetchedAt === "string" ? new Date(fetchedAt) : fetchedAt;
  if (Number.isNaN(d.getTime())) return "n/a";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}
