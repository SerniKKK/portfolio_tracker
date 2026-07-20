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
import { Loader2, PlusCircle } from "lucide-react";

const ASSET_TYPES = ["STOCK", "ETF", "CRYPTO", "CASH"] as const;
const CURRENCIES = ["PLN", "EUR", "USD"] as const;

export function PositionForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<string>("STOCK");
  const [currency, setCurrency] = useState<string>("USD");
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      ticker: fd.get("ticker"),
      assetType,
      quantity: Number(fd.get("quantity")),
      purchasePrice: Number(fd.get("purchasePrice")),
      purchaseCurrency: currency,
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
    setAssetType("STOCK");
    setCurrency("USD");
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name">
          <Input id="name" name="name" required placeholder="Apple" />
        </Field>
        <Field id="ticker" label="Ticker">
          <Input
            id="ticker"
            name="ticker"
            required
            placeholder="AAPL"
            className="uppercase"
          />
        </Field>
        <Field label="Type">
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Purchase currency">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
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
          />
        </Field>
        <Field id="purchasePrice" label="Purchase price">
          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="any"
            min="0"
            required
            placeholder="150.00"
            className="tabular"
          />
        </Field>
        <Field id="purchaseDate" label="Purchase date">
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            required
            defaultValue={today}
          />
        </Field>
      </div>

      {error && (
        <p className="text-sm text-[color:var(--negative)]">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
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
