"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const ASSET_TYPES = ["STOCK", "ETF", "CRYPTO", "CASH"] as const;
const CURRENCIES = ["PLN", "EUR", "USD"] as const;

export function PositionForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      ticker: fd.get("ticker"),
      assetType: fd.get("assetType"),
      quantity: Number(fd.get("quantity")),
      purchasePrice: Number(fd.get("purchasePrice")),
      purchaseCurrency: fd.get("purchaseCurrency"),
      purchaseDate: fd.get("purchaseDate"),
    };

    const res = await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add position");
      return;
    }

    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Field label="Name">
        <input
          name="name"
          required
          placeholder="Apple"
          className={inputCls}
        />
      </Field>
      <Field label="Ticker">
        <input
          name="ticker"
          required
          placeholder="AAPL"
          className={inputCls}
        />
      </Field>
      <Field label="Type">
        <select name="assetType" required defaultValue="STOCK" className={inputCls}>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Currency">
        <select
          name="purchaseCurrency"
          required
          defaultValue="USD"
          className={inputCls}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Quantity">
        <input
          name="quantity"
          type="number"
          step="any"
          min="0"
          required
          placeholder="10"
          className={inputCls}
        />
      </Field>
      <Field label="Purchase price">
        <input
          name="purchasePrice"
          type="number"
          step="any"
          min="0"
          required
          placeholder="150.00"
          className={inputCls}
        />
      </Field>
      <Field label="Purchase date">
        <input
          name="purchaseDate"
          type="date"
          required
          defaultValue={today}
          className={inputCls}
        />
      </Field>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-[color:var(--background)] transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add position"}
        </button>
      </div>

      {error && (
        <p className="col-span-full text-sm text-[color:var(--negative)]">
          {error}
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)]/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
