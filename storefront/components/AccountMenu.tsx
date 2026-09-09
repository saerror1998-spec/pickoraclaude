"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AccountMenu() {
  const { user, loading, signInWithGoogle } = useAuth();
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
    <Link
      href="/account"
      title={`Signed in as ${displayName} — view account`}
      aria-label={`Signed in as ${displayName}. View account`}
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-medium text-white transition-opacity hover:opacity-80"
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </Link>
  );
}
