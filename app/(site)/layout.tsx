"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/ui/Footer";

const navLinks = [
  { href: "/placas-solares", label: "Placas Solares", sticky: true },
  { href: "/baterias-solares", label: "Baterías", sticky: true },
  { href: "/subvenciones-solares", label: "Subvenciones", sticky: true },
  { href: "/precio-luz", label: "Precio Luz", sticky: true },
  { href: "/calculadoras", label: "Calculadoras", sticky: true },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // Extraer el slug del municipio si existe (último segmento de la ruta)
  const segments = pathname.split("/").filter(Boolean);
  const currentSlug = segments.length >= 2 ? segments[segments.length - 1] : null;

  const getLinkHref = (link: { href: string; sticky: boolean }) => {
    // Si el enlace soporta "sticky" y tenemos un slug de municipio actual
    if (link.sticky && currentSlug) {
      return `${link.href}/${currentSlug}`;
    }
    return link.href;
  };

  return (
    <div className="flex flex-col min-h-screen">
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
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

