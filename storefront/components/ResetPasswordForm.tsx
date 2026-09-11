"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LoginBackgroundPaths } from "./LoginBackgroundPaths";

/**
 * Two unrelated states share this one route, matching how Supabase's
 * password-recovery email link works:
 *  - "request": the normal landing state — enter your email, get a link.
 *  - "confirm": you arrived *from* that emailed link. Supabase's browser
 *    client auto-detects the recovery token in the URL hash and opens a
 *    session, firing a PASSWORD_RECOVERY auth event — we just listen for it.
 */
export function ResetPasswordForm() {
  const { sendPasswordReset, setPassword } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("confirm");
    }
  }, []);

  async function handleRequestReset(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      setError("Couldn't send a reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetNewPassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setPassword(password);
      setDone(true);
      setTimeout(() => router.push("/account"), 1500);
    } catch {
      setError("Couldn't update your password. The reset link may have expired.");
      setBusy(false);
    }
  }

  return (
    <main className="relative lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-cream-warm p-10 lg:flex">
        <LoginBackgroundPaths position={1} />
        <Link href="/" className="relative z-10 w-fit">
          <Image src="/fevicon.svg" alt="Pickora" width={689} height={198} className="h-8 w-auto" />
        </Link>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center bg-cream p-[var(--gutter-mobile)] md:p-[var(--gutter-desktop)]">
        <Link
          href="/login"
          className="absolute left-5 top-7 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-2 text-sm text-taupe transition-colors hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sign in
        </Link>

        <div className="mx-auto w-full max-w-sm space-y-6">
          <Link href="/" className="block w-fit lg:hidden">
            <Image src="/fevicon.svg" alt="Pickora" width={689} height={198} className="h-7 w-auto" />
          </Link>

          {mode === "request" ? (
            sent ? (
              <div className="space-y-2">
                <h1 className="text-2xl text-ink">Check your email</h1>
                <p className="text-base text-taupe">
                  We sent a password reset link to <span className="text-ink">{email}</span>.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl text-ink">Reset your password</h1>
                  <p className="mt-1 text-base text-taupe">
                    Enter your email and we&apos;ll send you a link to reset it.
                  </p>
                </div>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="mb-1.5 block text-sm text-taupe">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center rounded-[var(--radius-pill)] bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
                  >
                    {busy ? "Sending link…" : "Send reset link"}
                  </button>
                </form>
              </>
            )
          ) : done ? (
            <div className="space-y-2">
              <h1 className="text-2xl text-ink">Password updated</h1>
              <p className="text-base text-taupe">Taking you to your account…</p>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl text-ink">Set a new password</h1>
                <p className="mt-1 text-base text-taupe">Choose a new password for your account.</p>
              </div>
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="mb-1.5 block text-sm text-taupe">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm text-taupe">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {busy ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
