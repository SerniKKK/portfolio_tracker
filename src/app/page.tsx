export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-10 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--teal)]" />
          <span className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
            Portfolio Tracker
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your portfolio,{" "}
          <span className="text-[color:var(--gold)]">at a glance</span>.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--muted)]">
          Stocks, ETFs, crypto and cash across multiple currencies. Live prices,
          clear charts, total value converted to PLN.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Stocks", color: "var(--teal)" },
            { label: "ETFs", color: "var(--gold)" },
            { label: "Crypto", color: "var(--teal)" },
            { label: "Cash", color: "var(--gold)" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-center text-sm"
            >
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: chip.color }}
              />
              {chip.label}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-[color:var(--muted)]">
          Stage 0 ready. Next up: data model and adding positions.
        </p>
      </div>
    </main>
  );
}
