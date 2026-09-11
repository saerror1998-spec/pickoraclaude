"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";

export function PersonalInformation({ initialName, email }: { initialName: string; email: string | null }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSuccess(false);
    try {
      await updateProfile(name);
      setSuccess(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <h2 className="text-lg text-ink">Personal information</h2>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        <div>
          <label htmlFor="full-name" className="mb-1.5 block text-sm text-taupe">
            Full name
          </label>
          <input
            id="full-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuccess(false);
            }}
            placeholder="Your name"
            className="w-full rounded-[var(--radius-pill)] border border-ink/10 bg-white px-5 py-3 text-sm text-ink placeholder:text-taupe-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          />
        </div>

        <div>
          <label htmlFor="account-email" className="mb-1.5 block text-sm text-taupe">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            value={email ?? ""}
            disabled
            className="w-full cursor-not-allowed rounded-[var(--radius-pill)] border border-ink/10 bg-cream-warm px-5 py-3 text-sm text-taupe-light"
          />
        </div>

        {success && <p className="text-sm text-green-700">Saved.</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
