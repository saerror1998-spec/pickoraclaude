"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initial = email.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed", error);
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      title={`Signed in as ${email} — click to sign out`}
      aria-label={`Signed in as ${email}. Sign out`}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {signingOut ? "…" : initial}
    </button>
  );
}
