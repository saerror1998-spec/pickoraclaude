import Image from "next/image";
import Link from "next/link";
import { SearchIcon, BellIcon } from "./icons";
import { UserMenu } from "./UserMenu";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  const email = user?.email ?? null;
  const greetingName = email ? email.split("@")[0] : "there";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-panel-border px-6 py-5">
      <h1 className="text-xl text-text">Hi, {greetingName} 👋</h1>

      <div className="flex items-center gap-3">
        <label className="relative hidden sm:block">
          <span className="sr-only">Search</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            placeholder="Search order or product…"
            className="w-64 rounded-[var(--radius-pill)] border border-card-border bg-card py-2.5 pl-9 pr-4 text-sm text-text placeholder:text-text-faint focus-visible:outline-none"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-text-muted hover:text-text"
        >
          <BellIcon />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-negative" />
        </button>

        <Link
          href="/products/new"
          className="rounded-[var(--radius-pill)] bg-accent px-4 py-2 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-expo-out)] hover:scale-[1.03]"
        >
          + New Product
        </Link>

        {email ? (
          <UserMenu email={email} />
        ) : (
          <Image src="/pickora-icon.svg" alt="Pickora" width={32} height={32} />
        )}
      </div>
    </header>
  );
}
