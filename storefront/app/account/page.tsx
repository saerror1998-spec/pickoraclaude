import Image from "next/image";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { AccountSignIn } from "@/components/AccountSignIn";
import { AccountDashboard } from "@/components/AccountDashboard";
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
  // Google-only accounts have no "email" identity (see PasswordManager) —
  // used to decide whether Password Manager asks for a current password.
  const hasPassword = user.identities?.some((identity) => identity.provider === "email") ?? false;

  const orders = user.email ? await fetchOrdersForEmail(user.email) : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-medium text-white">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div>
              <h1 className="text-2xl text-ink">{displayName}</h1>
              {user.email && <p className="mt-0.5 text-sm text-taupe-light">{user.email}</p>}
            </div>
          </div>

          <AccountDashboard displayName={displayName} email={user.email ?? null} hasPassword={hasPassword} orders={orders} />
        </div>
      </main>
      <MobileDock />
    </>
  );
}
