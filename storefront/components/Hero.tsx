"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HeroShaderBackground } from "./HeroShaderBackground";
import { WaveReveal } from "./WaveReveal";

type Step = {
  from: number;
  to: number;
  num: string;
  title: string;
  description: string;
  label: string;
  icon: ReactNode;
};

// Real, already-established claims (same copy as WhyPickora / product page
// trust badges) — not invented for this section.
const STEPS: Step[] = [
  {
    from: 0.05,
    to: 0.3,
    num: "01",
    label: "Warranty",
    title: "90-day warranty.",
    description: "Every laptop is covered from the day it ships — parts and workmanship.",
    icon: (
      <path
        d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    from: 0.3,
    to: 0.55,
    num: "02",
    label: "Shipping",
    title: "Free shipping.",
    description: "No surprises at checkout — free shipping, always.",
    icon: (
      <path
        d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    from: 0.55,
    to: 0.8,
    num: "03",
    label: "Price match",
    title: "Price match.",
    description: "Found it cheaper elsewhere? We'll match it.",
    icon: (
      <path
        d="M4 12a8 8 0 1 1 8 8 M4 12l3-3 M4 12l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    from: 0.8,
    to: 1.01,
    num: "04",
    label: "Certified",
    title: "Certified refurbished.",
    description: "Every laptop passes a full inspection before it's listed for sale.",
    icon: (
      <path
        d="M9 12l2 2 4-4M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

/**
 * Scroll-driven hero: a pinned full-viewport stage that cross-fades between
 * real product photos and reveals a step card as the visitor scrolls past.
 * Adapted from a "frame sequence" hero pattern that normally scrubs through
 * hundreds of pre-rendered animation frames — Pickora has no such asset (a
 * 900-frame laptop rotation), so this cross-fades between a handful of real
 * product photos instead, and drops the pattern's own nav bar since the
 * site already has a persistent Header above this.
 */
export function Hero({ images = [] }: { images?: string[] }) {
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    function onScroll() {
      const spacer = spacerRef.current;
      if (!spacer) return;
      const total = spacer.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
      setProgress(p);

      let idx = 0;
      for (let i = 0; i < STEPS.length; i++) {
        if (p >= STEPS[i].from) idx = i;
      }
      setActiveIdx(idx);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const step = STEPS[activeIdx];

  return (
    <div ref={spacerRef} className="relative" style={{ height: "400vh" }}>
      <section className="sticky top-0 h-screen overflow-hidden bg-ink text-white">
        {/* Background: cross-fading real product photos, or the shader when none are given. */}
        <div className="absolute inset-0">
          {images.length > 0 ? (
            images.map((src, i) => (
              <div
                key={src}
                className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-expo-out)]"
                style={{ opacity: i === activeIdx ? 1 : 0 }}
              >
                <Image src={src} alt="" fill sizes="100vw" className="object-cover" priority={i === 0} />
              </div>
            ))
          ) : (
            <HeroShaderBackground className="h-full w-full" />
          )}
        </div>
        {/* Contrast safety net — needed whether it's a shifting shader or a photo behind it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/50" />

        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col items-center justify-center px-[var(--gutter-mobile)] text-center md:px-[var(--gutter-desktop)]">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/60">Certified refurbished</p>

          <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-white">
            <WaveReveal as="span" className="block" text="Ask more of" />
            <WaveReveal as="span" className="block" text="your laptop." delay={250} />
          </h1>

          <p className="mt-6 max-w-xl text-balance text-[clamp(1rem,1.5vw,1.25rem)] text-white/70">
            Premium laptops, professionally inspected, restored, and warrantied — at up to 40% off
            retail.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-[var(--radius-pill)] bg-white px-8 py-3 text-sm font-medium text-ink transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-105"
            >
              Explore Laptops
            </Link>
            <Link
              href="/warranty"
              className="rounded-[var(--radius-pill)] border border-white/30 px-8 py-3 text-sm font-medium text-white transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-white/10"
            >
              Learn about our warranty
            </Link>
          </div>
        </div>

        {/* Step card: which trust point is "in view" as the visitor scrolls through the pinned stage. */}
        {/* Hidden below md: the headline, subheading, and two CTAs already fill
            a mobile h-screen viewport on their own — there's no room left for
            this without it overlapping them. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 hidden justify-end px-[var(--gutter-desktop)] md:flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-xs rounded-[var(--radius-card-secondary)] border border-white/15 bg-ink/70 p-5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  {step.num} / 0{STEPS.length}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-accent">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {step.icon}
                  </svg>
                </span>
              </div>
              <h3 className="mt-3 text-base text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-white/70">{step.description}</p>
              <span className="mt-3 block text-xs uppercase tracking-[0.15em] text-white/40">
                {step.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div
            className="h-full bg-white transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </section>
    </div>
  );
}
