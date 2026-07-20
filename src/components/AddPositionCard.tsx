"use client";

import { useState } from "react";
import { PositionForm } from "./PositionForm";

export function AddPositionCard() {
  const [open, setOpen] = useState(false);

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Add position</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Enter a stock, ETF, crypto or cash holding you already own.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--teal)] hover:text-[color:var(--teal)]"
          aria-expanded={open}
        >
          {open ? "Close" : "+ New position"}
        </button>
      </div>
      {open && (
        <div className="mt-5 border-t border-[color:var(--border)] pt-5">
          <PositionForm />
        </div>
      )}
    </section>
  );
}
