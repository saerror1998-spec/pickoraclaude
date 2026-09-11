"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function EmailPasswordLoginForm({ redirectPath = "/account" }: { redirectPath?: string }) {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      window.location.assign(redirectPath);
    } catch {
      setError("That email and password don't match. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm text-taupe">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm text-taupe">
            Password
          </label>
          <Link href="/reset-password" className="text-sm text-taupe underline hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center rounded-[var(--radius-pill)] bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
