import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag
      className={`rounded-[var(--radius-card)] border border-card-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </Tag>
  );
}
