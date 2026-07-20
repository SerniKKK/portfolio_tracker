"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      className="text-xs text-[color:var(--muted)] transition hover:text-[color:var(--negative)] disabled:opacity-50"
    >
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}
