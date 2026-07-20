import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-gradient-to-br from-[color:var(--surface-elevated)] to-[color:var(--surface)]">
            <TrendingUp className="size-4 text-[color:var(--accent-cream)]" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Portfolio Tracker</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Personal
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-medium leading-tight tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted-strong)]">
          Access is limited to allowlisted Google accounts. If you should have
          access and cannot sign in, contact the owner.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="mt-6"
        >
          <Button
            type="submit"
            className="h-11 w-full gap-3 bg-[color:var(--accent-cream)] text-[color:var(--background)] hover:bg-[color:var(--accent-cream)]/90"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-[color:var(--negative)]/30 bg-[color:var(--negative)]/10 px-3 py-2 text-sm text-[color:var(--negative)]">
            {error === "AccessDenied"
              ? "This Google account is not on the allowlist."
              : "Sign-in failed. Please try again."}
          </p>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
