"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

type Step = "email" | "otp" | "password";

/**
 * Three-step signup: email -> a 6-digit code sent to that inbox -> set a
 * password once the code is verified (which also signs the user in, since
 * verifyOtp opens a session). Reused as-is for "sign up" and, via
 * PasswordManager, for a Google-only user adding a password to their
 * existing account.
 */
export function EmailSignupForm({ redirectPath = "/account" }: { redirectPath?: string }) {
  const { sendEmailOtp, verifyEmailOtp, setPassword } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendEmailOtp(email);
      setStep("otp");
    } catch {
      setError("Couldn't send a code to that email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyEmailOtp(email, otp);
      setStep("password");
    } catch {
      setError("That code isn't right or has expired. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreatePassword(event: FormEvent) {
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
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("Couldn't set your password. Please try again.");
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm text-taupe">
            Email
          </label>
          <input
            id="signup-email"
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
          {busy ? "Sending code…" : "Send verification code"}
        </button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <p className="text-sm text-taupe">
          We sent a 6-digit code to <span className="text-ink">{email}</span>.
        </p>
        <div>
          <label htmlFor="signup-otp" className="mb-1.5 block text-sm text-taupe">
            Verification code
          </label>
          <input
            id="signup-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-center text-lg tracking-[0.3em] text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center rounded-[var(--radius-pill)] bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Verify code"}
        </button>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-center text-sm text-taupe hover:text-ink"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCreatePassword} className="space-y-4">
      <p className="text-sm text-taupe">Email verified. Now create a password for your account.</p>
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm text-taupe">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="Enter password"
          className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        />
      </div>
      <div>
        <label htmlFor="signup-confirm-password" className="mb-1.5 block text-sm text-taupe">
          Confirm password
        </label>
        <input
          id="signup-confirm-password"
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
        {busy ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
