"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

/**
 * `hasPassword` is a best-effort signal (does this account have an "email"
 * identity, from lib/account-orders.ts's caller) — Google-only accounts
 * don't, so they get a simpler "create a password" form with no current
 * password to verify, since Supabase already has them signed in.
 */
export function PasswordManager({ email, hasPassword }: { email: string | null; hasPassword: boolean }) {
  const { signInWithPassword, setPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      if (hasPassword) {
        if (!email) throw new Error("Missing account email");
        // Verifying the current password this way (rather than trusting the
        // existing session) means a stolen, still-open session alone can't
        // silently take over the account's password.
        await signInWithPassword(email, currentPassword);
      }
      await setPassword(newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(hasPassword ? "Your current password is incorrect." : "Couldn't set your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <h2 className="text-lg text-ink">Password manager</h2>
      <p className="mt-1 text-sm text-taupe">
        {hasPassword
          ? "Update the password you use to sign in with your email."
          : "You signed up with Google. Set a password to also sign in with your email."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        {hasPassword && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="current-password" className="text-sm text-taupe">
                Password *
              </label>
              <Link href="/reset-password" className="text-sm text-taupe underline hover:text-ink">
                Forgot password?
              </Link>
            </div>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            />
          </div>
        )}

        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-sm text-taupe">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-sm text-taupe">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">Password updated.</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
