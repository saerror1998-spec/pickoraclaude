"use client";

import { useState } from "react";
import { PersonalInformation } from "./PersonalInformation";
import { AccountOrderList } from "./AccountOrderList";
import { AccountEmptySection } from "./AccountEmptySection";
import { PasswordManager } from "./PasswordManager";
import { AccountSignOutButton } from "./AccountSignOutButton";
import type { AccountOrder } from "@/lib/account-orders";

type SectionId = "personal" | "orders" | "address" | "payment" | "password";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "personal", label: "Personal Information" },
  { id: "orders", label: "My Orders" },
  { id: "address", label: "Manage Address" },
  { id: "payment", label: "Payment Method" },
  { id: "password", label: "Password Manager" },
];

export function AccountDashboard({
  displayName,
  email,
  hasPassword,
  orders,
}: {
  displayName: string;
  email: string | null;
  hasPassword: boolean;
  orders: AccountOrder[];
}) {
  // Defaults to "orders" (rather than the first tab) since that's the
  // account page's most common reason for a visit — checking on an order.
  const [active, setActive] = useState<SectionId>("orders");

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      <nav aria-label="Account sections" className="flex flex-col gap-1.5">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActive(section.id)}
            aria-current={active === section.id ? "page" : undefined}
            className={`rounded-[var(--radius-card-secondary)] px-4 py-3 text-left text-sm transition-colors duration-200 ease-[var(--ease-expo-out)] ${
              active === section.id
                ? "bg-ink text-white"
                : "bg-white text-ink shadow-[var(--shadow-soft)] hover:bg-cream-warm"
            }`}
          >
            {section.label}
          </button>
        ))}
        <div className="pt-1.5">
          <AccountSignOutButton />
        </div>
      </nav>

      <div>
        {active === "personal" && <PersonalInformation initialName={displayName} email={email} />}
        {active === "orders" && <AccountOrderList orders={orders} />}
        {active === "address" && (
          <AccountEmptySection
            title="No saved addresses yet"
            description="Checkout is handled securely by Nomod, which collects your shipping address at payment time — we don't store a separate address book here yet."
          />
        )}
        {active === "payment" && (
          <AccountEmptySection
            title="No saved payment methods"
            description="Pickora never stores your card details. Payment is handled securely by Nomod at checkout each time."
          />
        )}
        {active === "password" && <PasswordManager email={email} hasPassword={hasPassword} />}
      </div>
    </div>
  );
}
