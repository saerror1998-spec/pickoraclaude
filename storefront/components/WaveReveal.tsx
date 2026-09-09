"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type WaveRevealProps = {
  text: string;
  /** Root element — pick one valid for where this is used (e.g. "span" when nested inside a heading you render yourself). */
  as?: "div" | "span" | "h1" | "h2" | "p";
  className?: string;
  /** Which way each letter travels in from. @default "down" */
  direction?: "up" | "down";
  mode?: "letter" | "word";
  duration?: string;
  /** Base delay in ms before the first letter/word starts. */
  delay?: number;
  /** WWDC-style blur-in alongside the slide. @default true */
  blur?: boolean;
  letterClassName?: string;
};

const STAGGER_MS = 40;

/**
 * Letter- or word-by-letter reveal animation. The visible, broken-up spans
 * are aria-hidden; a single sr-only span carries the real text so screen
 * readers get the sentence, not a stream of individual letters. Falls back
 * to an instant, unanimated render under prefers-reduced-motion.
 */
export function WaveReveal({
  text,
  as = "div",
  direction = "down",
  mode = "letter",
  className,
  duration = "1000ms",
  delay = 0,
  blur = true,
  letterClassName,
}: WaveRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;

  if (!text) return null;
  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.trim().split(/\s+/);
  const animationName = [direction === "up" ? "wave-reveal-up" : "wave-reveal-down", blur && "wave-reveal-blur"]
    .filter(Boolean)
    .join(", ");

  // The word-to-word gap is a CSS margin on each word span, not a separate
  // space element between them — Next's production HTML minifier merges
  // adjacent bare inline elements it considers equivalent, which silently
  // ate a sibling space/NBSP span in testing (it doesn't know inline-block
  // + whitespace-nowrap makes element boundaries load-bearing here). A
  // margin can't be merged away like that.
  let unitIndex = 0;

  return (
    <Tag className={className}>
      <span aria-hidden>
        {words.map((word, wordIndex) => {
          const units = mode === "word" ? [word] : Array.from(word);
          const isLastWord = wordIndex === words.length - 1;
          return (
            <span
              key={wordIndex}
              className={cn("inline-block whitespace-nowrap", !isLastWord && "mr-[0.28em]")}
            >
              {units.map((unit, i) => {
                const delayMs = delay + unitIndex * STAGGER_MS;
                unitIndex += 1;
                return (
                  <span
                    key={i}
                    className={cn("inline-block opacity-0", letterClassName)}
                    style={{
                      animationName,
                      animationDuration: duration,
                      animationTimingFunction: "ease-in-out",
                      animationFillMode: "forwards",
                      animationDelay: `${delayMs}ms`,
                    }}
                  >
                    {unit}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
