"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export type PillNavItem = { href: string; label: string };

/**
 * Desktop pill navigation: a rising-circle hover fill per pill, GSAP-driven
 * (matches the curtain-reveal mechanic already used in Footer.tsx). Mobile
 * navigation is handled separately by MobileDock, so this renders
 * desktop-only and has no hamburger/dropdown of its own.
 */
export function PillNav({ items }: { items: PillNavItem[] }) {
  const pathname = usePathname();
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width: w, height: h } = pill.getBoundingClientRect();
        const R = (w * w / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hoverLabel = pill.querySelector<HTMLElement>(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.5, ease: "power3.out", overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 0.4, ease: "power3.out", overwrite: "auto" }, 0);
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [items]);

  function handleEnter(i: number) {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.35, ease: "power3.out", overwrite: "auto" });
  }

  function handleLeave(i: number) {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.3, ease: "power3.out", overwrite: "auto" });
  }

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
      <ul role="menubar" className="flex items-stretch gap-1 list-none m-0 p-0">
        {items.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} role="none">
              <Link
                role="menuitem"
                href={item.href}
                aria-label={item.label}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                className="relative flex h-9 items-center justify-center overflow-hidden rounded-[var(--radius-pill)] px-4 text-sm font-medium text-white/80 transition-colors duration-200"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 bottom-0 z-[1] block rounded-full bg-white/10"
                  style={{ willChange: "transform" }}
                  ref={(el) => {
                    circleRefs.current[i] = el;
                  }}
                />
                <span className="relative z-[2] inline-block overflow-hidden py-1 leading-none">
                  <span className="pill-label relative z-[2] inline-block" style={{ willChange: "transform" }}>
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pill-label-hover absolute left-0 top-1 z-[3] inline-block w-full text-center text-white"
                    style={{ willChange: "transform, opacity" }}
                  >
                    {item.label}
                  </span>
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    data-testid="pill-nav-active-dot"
                    className="absolute -bottom-0.5 left-1/2 z-[4] h-1 w-1 -translate-x-1/2 rounded-full bg-glass-emerald"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
