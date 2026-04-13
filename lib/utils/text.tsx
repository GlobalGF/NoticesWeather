import React from "react";

/**
 * Very simple helper to parse basic markdown bold (**text**) 
 * into React components. Safe for static/trusted dynamic text.
 */
export function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Normalizes municipality names by removing slashes and trimming.
 */
export function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

/**
 * Deterministic hash for a string.
 */
export function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/**
 * Pick an item from an array deterministically using a hash.
 */
export function pick<T>(arr: T[], h: number, offset = 0): T {
  return arr[Math.abs(h + offset) % arr.length];
}

/**
 * Standard number formatter for es-ES locale.
 */
export function fmt(v: number | string | null | undefined, d = 0): string {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("es-ES", { maximumFractionDigits: d });
}
