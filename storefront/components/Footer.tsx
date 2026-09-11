"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "./MagneticButton";
import { PaymentBadges } from "./PaymentBadges";
import { prefersReducedMotion } from "@/lib/motion";

const YEAR = new Date().getFullYear();
const SUPPORT_EMAIL = "hello@pickoraonline.com";
const WHATSAPP_NUMBER = "971524078652"; // Same real number as WhatsAppButton.tsx.

const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All laptops", href: "/shop" },
      { label: "Laptops under 500 AED", href: "/laptops-under-500-aed" },
      { label: "Why refurbished", href: "/#why-pickora" },
      { label: "Our certification process", href: "/certification" },
      { label: "Warranty", href: "/warranty" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your account", href: "/account" },
      { label: "Cart", href: "/cart" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Support center", href: "/support" },
      { label: "Delivery & coverage", href: "/delivery" },
      { label: `Email ${SUPPORT_EMAIL}`, href: `mailto:${SUPPORT_EMAIL}` },
      { label: "WhatsApp +971 52 407 8652", href: `https://wa.me/${WHATSAPP_NUMBER}` },
    ],
  },
] as const;

function FooterColumns({ headingClassName, linkClassName }: { headingClassName: string; linkClassName: string }) {
  return (
    <>
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.heading}>
          <p className={headingClassName}>{column.heading}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/pickora.online",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@pickora.online",
    icon: (
      <path
        d="M14 3v10.5a3 3 0 1 1-2-2.83V13a1 1 0 0 0-1-1 1 1 0 0 0 0 2 1 1 0 0 0 1-1V3h2Zm2.5 2.2A4.2 4.2 0 0 0 20 8.5v2a6.2 6.2 0 0 1-3.5-1.07V13a5 5 0 1 1-5-5c.17 0 .33.01.5.03v2.02A3 3 0 1 0 15 13V3h1.5v2.2Z"
        fill="currentColor"
      />
    ),
  },
];

function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          title={social.name}
          className={className}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {social.icon}
          </svg>
        </a>
      ))}
    </>
  );
}

/**
 * Cinematic "curtain reveal" footer for desktop: the outer wrapper sits in
 * normal flow with a clip-path, so the inner `fixed` footer beneath it only
 * becomes visible once the page has scrolled far enough to reveal its
 * bounding box — a fixed-position footer without the usual scroll-jank.
 * Desktop only (hidden lg:block) — the GSAP parallax, magnetic buttons, and
 * giant background text don't translate to touch, and the fixed positioning
 * would collide with MobileDock's own fixed bottom nav on small screens;
 * SimpleFooter below covers mobile instead.
 */
export function Footer() {
  return (
    <>
      <div className="hidden lg:block">
        <CinematicFooter />
      </div>
      <div className="lg:hidden">
        <SimpleFooter />
      </div>
    </>
  );
}

function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const giantTextRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !wrapperRef.current) return;

    // Matches SmoothScrollProvider's defensive pattern: GSAP/ScrollTrigger
    // registration touches browser APIs (matchMedia) that aren't always
    // present (e.g. jsdom in tests), so this shouldn't crash the page if
    // that fails — the footer still works, just without the parallax.
    try {
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.fromTo(
          giantTextRef.current,
          { y: "8vh", opacity: 0 },
          {
            y: "0vh",
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 },
          }
        );
        gsap.fromTo(
          [headingRef.current, linksRef.current],
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 },
          }
        );
      }, wrapperRef);

      return () => ctx.revert();
    } catch (error) {
      console.error("Footer: failed to initialize GSAP scroll animations", error);
      return undefined;
    }
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  return (
    <div ref={wrapperRef} className="relative h-screen w-full" style={{ clipPath: "inset(0 0 0 0)" }}>
      <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-ink text-white">
        {/* Ambient glow + grid, purely decorative — same ink-to-accent-blue
            treatment as the Hero's shader, so this reads as the same brand
            rather than a generic dark-UI gradient. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-accent) 30%, transparent) 0%, color-mix(in oklab, var(--color-accent) 10%, transparent) 50%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
          }}
        />

        <div
          ref={giantTextRef}
          aria-hidden
          className="pointer-events-none absolute -bottom-[4vh] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[18vw] font-black leading-none tracking-tighter text-accent/[0.09]"
        >
          PICKORA
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-[var(--gutter-desktop)]">
          <h2 ref={headingRef} className="mb-12 text-center text-5xl font-black tracking-tighter text-white md:text-7xl">
            Find your next laptop.
          </h2>

          <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full flex-wrap justify-center gap-4">
              <MagneticButton
                as={Link}
                href="/shop"
                className="rounded-[var(--radius-pill)] bg-accent px-10 py-5 text-base font-medium text-white transition-colors hover:brightness-110"
              >
                Shop laptops
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/support"
                className="rounded-[var(--radius-pill)] border border-white/15 bg-white/5 px-10 py-5 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                Contact support
              </MagneticButton>
            </div>

            <div className="mt-2 flex w-full flex-wrap justify-center gap-3">
              {[
                { label: "Warranty", href: "/warranty" },
                { label: "Your account", href: "/account" },
                { label: "Support", href: "/support" },
              ].map((link) => (
                <MagneticButton
                  key={link.href}
                  as={Link}
                  href={link.href}
                  className="rounded-[var(--radius-pill)] border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/60 backdrop-blur-md transition-colors hover:text-white"
                >
                  {link.label}
                </MagneticButton>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 px-[var(--gutter-desktop)] pb-10 sm:grid-cols-3">
          <FooterColumns
            headingClassName="text-xs font-semibold uppercase tracking-widest text-white/40"
            linkClassName="text-sm text-white/70 transition-colors hover:text-white"
          />
        </div>

        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 border-t border-white/10 px-[var(--gutter-desktop)] pb-8 pt-8 md:flex-row">
          <p className="order-2 text-xs font-semibold uppercase tracking-widest text-white/40 md:order-1">
            © {YEAR} Pickora. All rights reserved.
          </p>

          <p className="order-1 flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/50 md:order-2">
            Every laptop, inspected and warrantied.
          </p>

          <div className="order-3 flex items-center gap-3">
            <SocialLinks className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-md transition-colors hover:text-white" />

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-md transition-colors hover:text-white"
            >
              <span className="sr-only">Back to top</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 10l7-7m0 0l7 7m-7-7v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SimpleFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink px-[var(--gutter-mobile)] py-12 text-white">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-lg font-medium">Pickora</p>
        <p className="mt-2 max-w-sm text-sm text-white/60">
          Certified refurbished laptops — inspected, restored, and warrantied.
        </p>

        <nav aria-label="Footer" className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
          <FooterColumns
            headingClassName="text-xs font-semibold uppercase tracking-widest text-white/40"
            linkClassName="text-sm text-white/70 transition-colors hover:text-white"
          />
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <SocialLinks className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:text-white" />
        </div>

        <div className="mt-6">
          <PaymentBadges badgeClassName="border-white/10 bg-white/[0.03] text-white/60" />
        </div>

        <p className="mt-8 text-xs text-white/40">© {YEAR} Pickora. All rights reserved.</p>
      </div>
    </footer>
  );
}
