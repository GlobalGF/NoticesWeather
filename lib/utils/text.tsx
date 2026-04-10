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
