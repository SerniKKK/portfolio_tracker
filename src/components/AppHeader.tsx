import { auth, signOut } from "@/auth";
import { formatFetchedAt } from "@/lib/format";
import type { FxResult } from "@/lib/fx";

export async function AppHeader({ fx }: { fx: FxResult }) {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[color:var(--teal)] to-[color:var(--gold)]">
            <div className="h-3.5 w-3.5 rounded-sm bg-[color:var(--background)]" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              Portfolio Tracker
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">
              Personal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FxPill fx={fx} />
          {user && (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-[11px] text-[color:var(--muted)]">
                  {user.email}
                </div>
              </div>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "User"}
                  className="h-8 w-8 rounded-full border border-[color:var(--border)]"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-2)] text-xs font-medium">
                  {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/signin" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2.5 py-1.5 text-[11px] text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function FxPill({ fx }: { fx: FxResult }) {
  const danger = fx.isFallback || fx.isStale;
  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1 text-[10px] uppercase tracking-wider md:flex"
      title={
        fx.isFallback
          ? "NBP unavailable, using hardcoded fallback rates"
          : "FX rates from NBP"
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: danger ? "var(--negative)" : "var(--positive)",
        }}
      />
      <span className="text-[color:var(--muted)]">FX</span>
      <span className="tabular">
        EUR {fx.rates.EUR.toFixed(3)} · USD {fx.rates.USD.toFixed(3)}
      </span>
      <span className="text-[color:var(--muted)]">
        · {fx.isFallback ? "fallback" : formatFetchedAt(fx.fetchedAt)}
      </span>
    </div>
  );
}
