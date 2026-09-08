"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      const redirectTo = searchParams.get("redirectTo") || "/";
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setStatus("error");
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
            ? error.message
            : "Sign in failed";
      setErrorMessage(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-card-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
            P
          </div>
          <span className="text-sm font-medium tracking-[-0.03em] text-text">Pickora Admin</span>
        </div>

        <h1 className="mb-1 text-xl text-text">Sign in</h1>
        <p className="mb-6 text-sm text-text-muted">Store operations access only.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-text-muted">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[var(--radius-card-sm)] border border-card-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text-muted">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[var(--radius-card-sm)] border border-card-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline-none"
            />
          </label>

          {status === "error" && (
            <p role="alert" className="text-sm text-negative">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 rounded-[var(--radius-pill)] bg-text px-4 py-2.5 text-sm font-medium text-bg transition-transform duration-150 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
