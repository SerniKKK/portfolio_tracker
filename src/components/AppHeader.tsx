import { auth, signOut } from "@/auth";
import { formatFetchedAt } from "@/lib/format";
import type { FxResult } from "@/lib/fx";
import { Activity, LogOut, TrendingUp } from "lucide-react";

export async function AppHeader({ fx }: { fx: FxResult }) {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <a href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-gradient-to-br from-[color:var(--surface-elevated)] to-[color:var(--surface)] shadow-sm">
              <TrendingUp className="size-4 text-[color:var(--accent-cream)]" strokeWidth={2.2} />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-[15px] font-medium tracking-tight">
                Portfolio Tracker
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Personal
              </div>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <FxPill fx={fx} />
          {user && (
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] py-1 pl-1 pr-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "User"}
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--surface-strong)] text-xs font-medium">
                  {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-[11px] font-medium">
                  {user.name?.split(" ")[0] ?? "User"}
                </div>
                <div className="text-[10px] text-[color:var(--muted)]">
                  {user.email}
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/signin" });
                }}
              >
                <button
                  type="submit"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--foreground)]"
                  aria-label="Sign out"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function FxPill({ fx }: { fx: FxResult }) {
  const danger = fx.isFallback || fx.isStale;
  const dotColor = danger ? "var(--negative)" : "var(--positive)";
  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-[11px] md:flex"
      title={
        fx.isFallback
          ? "NBP unavailable, using hardcoded fallback rates"
          : "FX rates from NBP"
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
          style={{ backgroundColor: dotColor }}
        />
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      </span>
      <Activity className="size-3 text-[color:var(--muted)]" />
      <span className="tabular text-[color:var(--muted-strong)]">
        EUR {fx.rates.EUR.toFixed(3)}
      </span>
      <span className="text-[color:var(--border-strong)]">·</span>
      <span className="tabular text-[color:var(--muted-strong)]">
        USD {fx.rates.USD.toFixed(3)}
      </span>
      <span className="text-[color:var(--border-strong)]">·</span>
      <span className="text-[color:var(--muted)]">
        {fx.isFallback ? "fallback" : formatFetchedAt(fx.fetchedAt)}
      </span>
    </div>
  );
}
