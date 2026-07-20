"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export function TickerSearchInput({
  onSelect,
  placeholder = "Search by name or ticker (e.g. Apple, AAPL, bitcoin)",
}: {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setHighlight(0);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(r: SearchResult) {
    onSelect(r);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--muted)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-[color:var(--muted)]" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-[320px] overflow-y-auto rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] shadow-2xl">
          {results.map((r, idx) => (
            <button
              type="button"
              key={r.key}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => pick(r)}
              className={`flex w-full items-center gap-3 border-b border-[color:var(--border)]/60 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
                idx === highlight
                  ? "bg-[color:var(--surface-strong)]"
                  : "hover:bg-[color:var(--surface-strong)]/60"
              }`}
            >
              {r.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.logo}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full bg-[color:var(--surface)]"
                />
              ) : (
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold uppercase"
                  style={{
                    color: typeColor(r.assetType),
                    backgroundColor: `${typeColor(r.assetType)}22`,
                  }}
                >
                  {r.assetType[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{r.name}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
                  <span className="font-mono uppercase tracking-wider">
                    {r.ticker}
                  </span>
                  <span className="text-[color:var(--border-strong)]">·</span>
                  <span>{r.assetType}</span>
                  {r.exchange && (
                    <>
                      <span className="text-[color:var(--border-strong)]">·</span>
                      <span>{r.exchange}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="tabular text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
                {r.currency}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function typeColor(t: string) {
  switch (t) {
    case "STOCK":
      return "hsl(172 40% 55%)";
    case "ETF":
      return "hsl(38 45% 62%)";
    case "CRYPTO":
      return "hsl(280 30% 65%)";
    default:
      return "hsl(30 5% 55%)";
  }
}
