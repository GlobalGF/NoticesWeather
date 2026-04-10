"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/placas-solares", label: "Placas Solares", sticky: true },
  { href: "/baterias-solares", label: "Baterías", sticky: true },
  { href: "/subvenciones-solares", label: "Subvenciones", sticky: true },
  { href: "/precio-luz", label: "Precio Luz", sticky: false }, // User: price-luz shouldn't have city slug
  { href: "/calculadoras", label: "Calculadoras", sticky: true },
];

// Modules where /module/[municipio] is a valid direct route for sticky nav
const MUNICIPALITY_MODULES = new Set([
  "/placas-solares",
  "/baterias-solares",
  "/calculadoras",
  "/subvenciones-solares",
]);

// List of calculator pages that are NOT city specific
const CALCULATOR_CATEGORIES = new Set([
  "placas-solares",
  "baterias",
  "excedentes",
  "financiacion"
]);

// Slugs that should NEVER be treated as cities (Regions/Provinces)
const FORBIDDEN_SLUGS = new Set([
  "andalucia", "aragon", "asturias", "principado-de-asturias", "illes-balears", "islas-baleares",
  "canarias", "cantabria", "castilla-y-leon", "castilla-la-mancha", "cataluna", "catalunya",
  "comunitat-valenciana", "valencia", "extremadura", "galicia", "comunidad-madrid", "madrid",
  "region-de-murcia", "murcia", "comunidad-foral-navarra", "navarra", "pais-vasco", "euskadi",
  "la-rioja", "ceuta", "melilla"
]);

interface CityContext {
  slug: string | null;
  ccaa: string | null;
  prov: string | null;
}

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";
  
  // 1. Detect context from current URL
  const segments = pathname.split("/").filter(Boolean);
  const urlModule = segments.length >= 1 ? `/${segments[0]}` : null;
  
  let urlContext: CityContext = { slug: null, ccaa: null, prov: null };

  if (urlModule === "/subvenciones-solares") {
      if (segments.length === 4) {
          urlContext = { ccaa: segments[1], prov: segments[2], slug: segments[3] };
      }
  } else if (urlModule === "/calculadoras") {
      if (segments.length === 3) {
          urlContext = { slug: segments[2], ccaa: null, prov: null };
      } else if (segments.length === 2 && !CALCULATOR_CATEGORIES.has(segments[1])) {
          urlContext = { slug: segments[1], ccaa: null, prov: null };
      }
  } else if (MUNICIPALITY_MODULES.has(urlModule!) && segments.length === 2 && segments[0] !== "geo") {
      urlContext = { slug: segments[1], ccaa: null, prov: null };
  }

  // Safety: Ensure urlContext never contains a forbidden slug
  if (urlContext.slug && FORBIDDEN_SLUGS.has(urlContext.slug)) {
      urlContext.slug = null;
  }

  // 2. Persisted state (Client-only hydration)
  const [persistedContext, setPersistedContext] = useState<CityContext>({ slug: null, ccaa: null, prov: null });

  // Hydrate from session storage on mount + Clean legacy junk
  useEffect(() => {
    const saved = sessionStorage.getItem("lastCityContext");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.slug && FORBIDDEN_SLUGS.has(parsed.slug)) {
            console.warn(`[SiteNav] Clearing forbidden city slug: ${parsed.slug}`);
            sessionStorage.removeItem("lastCityContext");
        } else {
            setPersistedContext(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Update session storage when URL context changes
  useEffect(() => {
    if (urlContext.slug && !FORBIDDEN_SLUGS.has(urlContext.slug)) {
      setPersistedContext(prev => {
        const updated = { ...prev, ...urlContext };
        sessionStorage.setItem("lastCityContext", JSON.stringify(updated));
        return updated;
      });
    }
  }, [urlContext.slug, urlContext.ccaa, urlContext.prov]);

  // Resolution: 
  // 1. Current page city takes priority.
  // 2. Fallback to persisted city from other pages.
  // This keeps "Piera" selected even when browsing regional Hubs.
  const context = urlContext.slug ? urlContext : persistedContext;

  const getLinkHref = (link: { href: string; sticky: boolean }) => {
    if (!link.sticky || !context.slug || FORBIDDEN_SLUGS.has(context.slug)) return link.href;

    // Special case for Subsidies - needs full path
    if (link.href === "/subvenciones-solares") {
      if (context.ccaa && context.prov) {
        return `/subvenciones-solares/${context.ccaa}/${context.prov}/${context.slug}`;
      }
      return link.href; // Fallback to generic
    }

    return `${link.href}/${context.slug}`;
  };

  return (
    <header className="bg-blue-900 border-b border-blue-800 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between md:px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            solaryeco
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const targetHref = getLinkHref(link);
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={targetHref}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white"
                    : "text-blue-200 hover:text-white hover:bg-blue-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/50 transition-colors"
          aria-label="Menú de navegación"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>

        {/* CTA Header Button */}
        <Link 
          href="/presupuesto-solar"
          className="hidden lg:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-orange-900/20 active:scale-95 ml-4"
        >
          Presupuesto Gratis
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-blue-800 bg-blue-900/95 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const targetHref = getLinkHref(link);
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={targetHref}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:text-white hover:bg-blue-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
