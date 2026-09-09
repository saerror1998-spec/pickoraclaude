import Image from "next/image";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { AccountSignIn } from "@/components/AccountSignIn";
import { AccountSignOutButton } from "@/components/AccountSignOutButton";
import { AccountOrderList } from "@/components/AccountOrderList";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOrdersForEmail } from "@/lib/account-orders";

export const metadata = {
  title: "Your account — Pickora",
};

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-[900px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)]">
            <h1 className="text-2xl text-ink">Your account</h1>
            <AccountSignIn />
          </div>
        </main>
        <MobileDock />
      </>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  const orders = user.email ? await fetchOrdersForEmail(user.email) : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)]">
          <h1 className="text-2xl text-ink">Your account</h1>

          <div className="mt-8 flex items-center justify-between gap-4 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-medium text-white">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div>
                <p className="text-sm text-ink">{displayName}</p>
                {user.email && <p className="mt-0.5 text-xs text-taupe-light">{user.email}</p>}
              </div>
            </div>

            <AccountSignOutButton />
          </div>

          <h2 className="mt-10 text-lg text-ink">Order history</h2>
          <div className="mt-4">
            <AccountOrderList orders={orders} />
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
