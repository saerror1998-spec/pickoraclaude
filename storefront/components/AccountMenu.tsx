"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AccountMenu() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="rounded-[var(--radius-pill)] border border-white/15 px-4 py-1.5 text-sm text-white/80 transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-white/10 hover:text-white"
      >
        Sign in
      </Link>
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
