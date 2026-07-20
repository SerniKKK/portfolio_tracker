import { prisma } from "@/lib/prisma";
import { getLivePrice } from "@/lib/prices";
import { PositionForm } from "@/components/PositionForm";
import { DeletePositionButton } from "@/components/DeletePositionButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--teal)]" />
        <span className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
          Portfolio Tracker
        </span>
      </header>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold">Add position</h2>
        <PositionForm />
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Positions</h2>
          <span className="text-xs text-[color:var(--muted)]">
            {positions.length} {positions.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {positions.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">
            No positions yet. Add your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--border)]">
            {positions.map((p) => {
              const live = getLivePrice(p.ticker, p.purchaseCurrency);
              const currentValue = live.price * p.quantity;
              const cost = p.purchasePrice * p.quantity;
              const pnl = currentValue - cost;
              const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
              const positive = pnl >= 0;

              return (
                <li
                  key={p.id}
                  className="grid grid-cols-2 items-center gap-4 py-4 sm:grid-cols-6"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-[color:var(--muted)]">
                      {p.ticker} · {p.assetType}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-[color:var(--muted)]">Qty</div>
                    <div>{p.quantity}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-[color:var(--muted)]">Buy</div>
                    <div>
                      {p.purchasePrice} {p.purchaseCurrency}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-[color:var(--muted)]">Now</div>
                    <div>
                      {live.isFallback ? (
                        <span className="text-[color:var(--muted)]">n/a</span>
                      ) : (
                        <>
                          {live.price} {live.currency}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-[color:var(--muted)]">Value</div>
                    <div>
                      {currentValue.toFixed(2)} {live.currency}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <div className="text-[color:var(--muted)]">P/L</div>
                      <div
                        style={{
                          color: positive
                            ? "var(--positive)"
                            : "var(--negative)",
                        }}
                      >
                        {positive ? "+" : ""}
                        {pnl.toFixed(2)} ({positive ? "+" : ""}
                        {pnlPct.toFixed(1)}%)
                      </div>
                    </div>
                    <DeletePositionButton id={p.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 text-xs text-[color:var(--muted)]">
          Prices are hardcoded in Stage 1. Real market data lands in Stage 3.
        </p>
      </section>
    </main>
  );
}
