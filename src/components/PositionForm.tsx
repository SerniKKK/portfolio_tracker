"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, X, LineChart, Coins } from "lucide-react";
import { TickerSearchInput } from "./TickerSearchInput";
import type { SearchResult } from "@/lib/search";
import type { AssetType, Currency } from "@prisma/client";

type Mode = "market" | "cash";

export function PositionForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("market");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Market mode
  const [selected, setSelected] = useState<SearchResult | null>(null);

  // Cash mode
  const [cashCurrency, setCashCurrency] = useState<Currency>("USD");

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);

    let payload: Record<string, unknown>;

    if (mode === "market") {
      if (!selected) {
        setError("Please pick a position from the search results.");
        setSubmitting(false);
        return;
      }
      payload = {
        name: selected.name,
        ticker: selected.ticker,
        assetType: selected.assetType satisfies AssetType,
        quantity: Number(fd.get("quantity")),
        purchasePrice: Number(fd.get("purchasePrice")),
        purchaseCurrency: selected.currency,
        purchaseDate: fd.get("purchaseDate"),
      };
    } else {
      payload = {
        name: `Cash ${cashCurrency}`,
        ticker: cashCurrency,
        assetType: "CASH" satisfies AssetType,
        quantity: Number(fd.get("amount")),
        purchasePrice: 1,
        purchaseCurrency: cashCurrency,
        purchaseDate: fd.get("purchaseDate"),
      };
    }

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
    setSelected(null);
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <ModeSwitch mode={mode} onChange={setMode} />

      {mode === "market" && (
        <>
          {selected ? (
            <SelectedChip result={selected} onClear={() => setSelected(null)} />
          ) : (
            <div>
              <Label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Find a stock, ETF or crypto
              </Label>
              <TickerSearchInput onSelect={(r) => setSelected(r)} />
              <p className="mt-2 text-[11px] text-[color:var(--muted)]">
                Search by company name or ticker. Data from Finnhub (stocks / ETFs) and
                CoinGecko (crypto).
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field id="quantity" label="Quantity">
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                required
                placeholder="10"
                className="tabular"
                disabled={!selected}
              />
            </Field>
            <Field
              id="purchasePrice"
              label={`Avg buy${selected ? ` (${selected.currency})` : ""}`}
            >
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="any"
                min="0"
                required
                placeholder="150.00"
                className="tabular"
                disabled={!selected}
              />
            </Field>
            <Field id="purchaseDate" label="Purchase date">
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                required
                defaultValue={today}
                disabled={!selected}
              />
            </Field>
          </div>
        </>
      )}

      {mode === "cash" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Currency">
            <Select value={cashCurrency} onValueChange={(v) => setCashCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["PLN", "EUR", "USD"] as const).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="amount" label={`Amount (${cashCurrency})`}>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="any"
              min="0"
              required
              placeholder="1000"
              className="tabular"
            />
          </Field>
          <Field id="purchaseDate" label="Date">
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              required
              defaultValue={today}
            />
          </Field>
        </div>
      )}

      {error && (
        <p className="text-sm text-[color:var(--negative)]">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting || (mode === "market" && !selected)}
          className="bg-[color:var(--accent-cream)] text-[color:var(--background)] hover:bg-[color:var(--accent-cream)]/90"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Adding
            </>
          ) : (
            <>
              <PlusCircle className="size-4" /> Add position
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const options: Array<{ id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "market", label: "Market position", icon: LineChart },
    { id: "cash", label: "Cash", icon: Coins },
  ];
  return (
    <div className="inline-flex rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1">
      {options.map((opt) => {
        const active = mode === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }`}
          >
            <Icon className="size-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectedChip({
  result,
  onClear,
}: {
  result: SearchResult;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[color:var(--accent-cream)]/40 bg-[color:var(--accent-cream)]/8 p-3">
      {result.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.logo}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full"
        />
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{
            color: "var(--accent-cream)",
            backgroundColor: "hsl(35 32% 78% / 0.15)",
          }}
        >
          {result.ticker.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{result.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
          <span className="font-mono uppercase tracking-wider">
            {result.ticker}
          </span>
          <span className="text-[color:var(--border-strong)]">·</span>
          <span>{result.assetType}</span>
          {result.exchange && (
            <>
              <span className="text-[color:var(--border-strong)]">·</span>
              <span>{result.exchange}</span>
            </>
          )}
          <span className="text-[color:var(--border-strong)]">·</span>
          <span>{result.currency}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Change position"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--foreground)]"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
