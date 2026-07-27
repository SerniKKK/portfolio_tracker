"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SearchResult } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

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
  const [searched, setSearched] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const listboxId = useId();
  const optionId = (idx: number) => `${listboxId}-opt-${idx}`;
  const trimmed = query.trim();
  const showNoResults =
    open && searched && !loading && trimmed.length >= MIN_CHARS && results.length === 0;

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      setSearched(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setOpen(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setHighlight(data.results.length > 0 ? 0 : -1);
        setSearched(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setHighlight(-1);
          setSearched(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

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
    setSearched(false);
    setHighlight(-1);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < results.length) pick(results[highlight]);
    }
  }

  const listOpen = open && (results.length > 0 || showNoResults);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--muted)]" />
        <Input
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && highlight >= 0 && results.length > 0
              ? optionId(highlight)
              : undefined
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => (results.length > 0 || showNoResults) && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-[color:var(--muted)]" />
        )}
      </div>

      {listOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-[320px] overflow-y-auto rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] shadow-2xl"
        >
          {results.length > 0 ? (
            results.map((r, idx) => (
              <div
                id={optionId(idx)}
                role="option"
                aria-selected={idx === highlight}
                key={r.key}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => pick(r)}
                className={`flex w-full cursor-pointer items-center gap-3 border-b border-[color:var(--border)]/60 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
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
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-[13px] text-[color:var(--muted)]">
              No results for{" "}
              <span className="font-medium text-[color:var(--foreground)]">
                &ldquo;{trimmed}&rdquo;
              </span>
            </div>
          )}
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
