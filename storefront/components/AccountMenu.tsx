"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "./AuthProvider";

export function AccountMenu() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    try {
      await signInWithGoogle(pathname);
    } catch {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
  }

  if (loading) {
    return <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-ink/10" aria-hidden />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleSignIn}
        disabled={busy}
        className="rounded-[var(--radius-pill)] border border-ink/15 px-4 py-1.5 text-sm text-ink transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-ink/5 disabled:opacity-50"
      >
        Sign in
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      title={`Signed in as ${displayName} — click to sign out`}
      aria-label={`Signed in as ${displayName}. Sign out`}
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </button>
  );
}
