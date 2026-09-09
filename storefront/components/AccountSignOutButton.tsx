"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AccountSignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className="rounded-[var(--radius-pill)] border border-ink/15 px-4 py-1.5 text-sm text-ink transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-ink/5 disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
