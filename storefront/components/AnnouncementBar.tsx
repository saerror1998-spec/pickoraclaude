"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Premium Refurbished Laptops • Dell, HP & Lenovo • Shop Pickora UAE",
  "Quality Refurbished Laptops at Better Prices — Shop Dell, HP & Lenovo",
  "Refurbished. Reliable. Ready for You. — Shop Laptops at Pickora",
];

const ROTATE_MS = 4500;

/** Slim strip beneath the header that fades through a rotating set of taglines. */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="border-b border-ink/5 bg-cream-warm py-2 text-center text-xs font-medium text-taupe">
      <p key={index} className="animate-[fade-slide-in_0.5s_var(--ease-expo-out)]">
        {MESSAGES[index]}
      </p>
    </div>
  );
}
