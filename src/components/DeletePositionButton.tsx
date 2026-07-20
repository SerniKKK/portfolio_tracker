"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePositionButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this position?")) return;
    setBusy(true);
    const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      aria-label="Delete position"
      className="flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[color:var(--negative)]/10 hover:text-[color:var(--negative)] focus:opacity-100 disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </button>
  );
}
