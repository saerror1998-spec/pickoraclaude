"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AccountSignIn() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    try {
      await signInWithGoogle("/account");
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
      <p className="text-taupe">Sign in to view your account and order history.</p>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in with Google"}
      </button>
    </div>
  );
}
