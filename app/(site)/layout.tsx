"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/placas-solares", label: "Placas Solares" },
  { href: "/baterias-solares", label: "Baterías" },
  { href: "/subvenciones-solares", label: "Subvenciones" },
  { href: "/precio-luz", label: "Precio Luz" },
  { href: "/calculadoras", label: "Calculadoras" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";

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
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
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
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-blue-800 bg-blue-900/95 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
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
    </div>
  );
}

