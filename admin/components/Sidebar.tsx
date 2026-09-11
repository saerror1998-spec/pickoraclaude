"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  OverviewIcon,
  SalesIcon,
  AnalyticsIcon,
  StorageIcon,
  OrdersIcon,
  ProductsIcon,
  CustomersIcon,
  MarketingIcon,
  IntegrationsIcon,
  ApiKeysIcon,
  ActivityIcon,
  LogsIcon,
  ResourcesIcon,
  MenuIcon,
  ChevronIcon,
} from "./icons";

const NAV_SECTIONS = [
  {
    items: [
      { href: "/", label: "Overview", icon: OverviewIcon },
      { href: "/sales", label: "Sales", icon: SalesIcon },
      { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
      { href: "/storage", label: "Storage", icon: StorageIcon },
    ],
  },
  {
    items: [
      { href: "/orders", label: "Orders", icon: OrdersIcon },
      { href: "/products", label: "Products", icon: ProductsIcon },
      { href: "/customers", label: "Customers", icon: CustomersIcon },
      { href: "/marketing", label: "Marketing", icon: MarketingIcon },
    ],
  },
  {
    items: [
      { href: "/integrations", label: "Integrations", icon: IntegrationsIcon },
      { href: "/api-keys", label: "API Keys", icon: ApiKeysIcon },
      { href: "/activity", label: "Activity", icon: ActivityIcon },
      { href: "/logs", label: "Logs", icon: LogsIcon },
    ],
  },
  {
    items: [{ href: "/resources", label: "Resources", icon: ResourcesIcon, expandable: true }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin sections" className="flex flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section, i) => (
        <ul key={i} className="flex flex-col gap-0.5">
          {section.items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-[var(--radius-card-sm)] px-3 py-2 text-sm transition-colors duration-150 ease-[var(--ease-expo-out)] ${
                    isActive
                      ? "bg-accent-soft text-accent font-medium"
                      : "text-text-muted hover:bg-panel-border/30 hover:text-text"
                  }`}
                >
                  <Icon />
                  <span className="flex-1 truncate">{item.label}</span>
                  {"expandable" in item && item.expandable && <ChevronIcon className="text-text-faint" />}
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar with menu toggle */}
      <div className="flex items-center justify-between border-b border-panel-border bg-panel px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image src="/pickora-icon.svg" alt="Pickora" width={24} height={24} />
          <span className="text-sm font-medium tracking-[-0.03em] text-text">Pickora Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="rounded-md p-2 text-text-muted hover:text-text"
        >
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-panel-border bg-panel md:hidden">{nav}</div>
      )}

      {/* Desktop/tablet: icon+label sidebar, collapses to icons-only on tablet */}
      <aside className="hidden shrink-0 border-r border-panel-border bg-panel md:flex md:w-[72px] md:flex-col lg:w-[240px]">
        <div className="flex items-center gap-2 px-4 py-5">
          <Image src="/pickora-icon.svg" alt="Pickora" width={28} height={28} className="shrink-0" />
          <span className="hidden truncate text-sm font-medium tracking-[-0.03em] text-text lg:inline">
            Pickora Admin
          </span>
        </div>
        <div className="lg:hidden">
          <IconOnlyNav pathname={pathname} />
        </div>
        <div className="hidden lg:block">{nav}</div>
      </aside>
    </>
  );
}

function IconOnlyNav({ pathname }: { pathname: string }) {
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  return (
    <nav aria-label="Admin sections (collapsed)" className="flex flex-col gap-1 px-2 py-2">
      {allItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            title={item.label}
            className={`flex items-center justify-center rounded-[var(--radius-card-sm)] p-2.5 transition-colors duration-150 ease-[var(--ease-expo-out)] ${
              isActive ? "bg-accent-soft text-accent font-medium" : "text-text-muted hover:bg-panel-border/30 hover:text-text"
            }`}
          >
            <Icon />
          </Link>
        );
      })}
    </nav>
  );
}
