import { auth, signOut } from "@/auth";

export async function UserMenu() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-xs text-[color:var(--muted)]">{user.email}</div>
      </div>
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={user.name ?? "User"}
          className="h-8 w-8 rounded-full border border-[color:var(--border)]"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-2)] text-xs">
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
          className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
