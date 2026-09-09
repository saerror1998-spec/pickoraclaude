import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class lists, resolving conflicting Tailwind utilities in favor of the later one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
