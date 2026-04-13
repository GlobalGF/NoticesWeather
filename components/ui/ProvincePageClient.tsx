"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Municipio {
  slug: string;
  municipio: string;
}

interface Province {
  name: string;
  slug: string;
}

interface Props {
  hubName: string;
  baseRoute: string;
  provinceName: string;
  provinceSlug: string;
  municipios: Municipio[];
  allProvinces: Province[];
  stats: {
    totalMunicipios: number;
    avgSunHours: number;
    avgRadiation: number;
    avgSavings: number;
    avgIBI: number;
  };
  initialList?: React.ReactNode; // SSR list for SEO
}

export default function ProvincePageClient({
  hubName,
  baseRoute,
  provinceName,
  provinceSlug,
  municipios,
  allProvinces,
  stats,
  initialList,
}: Props) {
  const [search, setSearch] = useState("");
  const [provDropdownOpen, setProvDropdownOpen] = useState(false);
  const [provSearch, setProvSearch] = useState("");
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close province dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProvDropdownOpen(false);
        setProvSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Instant client-side filtering
  const filteredMunicipios = useMemo(() => {
    if (!search.trim()) return []; // We rely on initialList when search is empty
    const q = search.toLowerCase().trim();
    return municipios.filter((m) =>
      m.municipio.toLowerCase().includes(q)
    );
  }, [search, municipios]);

  // Province dropdown filtering
  const filteredProvinces = useMemo(() => {
    if (!provSearch.trim()) return allProvinces;
    const q = provSearch.toLowerCase().trim();
    return allProvinces.filter((p) => p.name.toLowerCase().includes(q));
  }, [provSearch, allProvinces]);

  const handleProvinceSwitch = (slug: string) => {
    setProvDropdownOpen(false);
    setProvSearch("");
    router.push(`${baseRoute}?provincia=${slug}`);
  };

  const kpiData = useMemo(() => [
    { label: "Municipios", value: stats.totalMunicipios.toLocaleString("es-ES"), color: "text-blue-700", bg: "bg-blue-50 border-blue-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg> },
    { label: "Horas Sol/Año", value: stats.avgSunHours.toLocaleString("es-ES"), color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> },
    { label: "Radiación", value: `${stats.avgRadiation.toLocaleString("es-ES")} kWh/m²`, color: "text-orange-600", bg: "bg-orange-50 border-orange-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { label: "Ahorro Medio", value: `${stats.avgSavings}€/año`, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: "Bonif. IBI Media", value: `${stats.avgIBI}%`, color: "text-purple-700", bg: "bg-purple-50 border-purple-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  ], [stats]);

  return (
    <div>
      {/* ── Province Context Bar ── */}
      <div className="mx-auto max-w-6xl px-4 -mt-6 relative z-30 mb-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <svg className="text-slate-300" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <Link href={baseRoute} className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
              {hubName}
            </Link>
            <svg className="text-slate-300" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-blue-700 font-bold">{provinceName}</span>
          </nav>

          {/* Mini Province Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProvDropdownOpen(!provDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm text-slate-600 font-medium transition-all hover:border-blue-300 group"
              aria-label="Cambiar de provincia"
            >
              <svg className="text-slate-400 group-hover:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Cambiar provincia
              <svg className={`transition-transform duration-200 ${provDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {provDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search within dropdown */}
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Buscar provincia..."
                      value={provSearch}
                      onChange={(e) => setProvSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <ul className="max-h-64 overflow-y-auto py-1">
                  {filteredProvinces.map((prov) => (
                    <li key={prov.slug}>
                      <button
                        type="button"
                        onClick={() => handleProvinceSwitch(prov.slug)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                          prov.slug === provinceSlug 
                            ? 'bg-blue-50 text-blue-700 font-bold' 
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span>{prov.name}</span>
                        {prov.slug === provinceSlug && (
                          <svg className="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    </li>
                  ))}
                  {filteredProvinces.length === 0 && (
                    <li className="px-4 py-3 text-sm text-slate-400 text-center">No se encontró ninguna provincia</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Province KPIs ── */}
      <div className="mx-auto max-w-6xl px-4 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {kpiData.map((kpi) => (
            <div key={kpi.label} className={`${kpi.bg} border rounded-2xl p-4 flex flex-col items-center text-center gap-1.5 transition-transform hover:scale-[1.02]`}>
              <div className={`${kpi.color} opacity-80`}>{kpi.icon}</div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">{kpi.label}</p>
              <p className={`text-xl sm:text-2xl font-black ${kpi.color} tabular-nums`}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Busca tu ciudad en {provinceName}</h2>
              <p className="text-xs text-slate-500">{stats.totalMunicipios} municipios disponibles — filtrado instantáneo</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              placeholder={`Escribe el nombre de tu ciudad en ${provinceName}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          {search && (
            <p className="mt-2 text-xs text-slate-400 font-medium">
              {filteredMunicipios.length === 0
                ? `No se encontró ningún municipio en ${provinceName} con "${search}"`
                : `${filteredMunicipios.length} municipio${filteredMunicipios.length !== 1 ? 's' : ''} encontrado${filteredMunicipios.length !== 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>
      </div>

      {/* ── Municipality Grid ── */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">
            {search ? "Resultados de búsqueda" : "Todos los municipios (A-Z)"}
          </h3>
          {!search && (
            <p className="text-xs text-slate-400 font-medium">{municipios.length} municipios en orden alfabético</p>
          )}
        </div>

        {!search ? (
           initialList
        ) : filteredMunicipios.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <p className="text-slate-500 font-medium mb-1">Sin resultados para &ldquo;{search}&rdquo;</p>
            <p className="text-sm text-slate-400">Prueba con otro nombre o revisa la ortografía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {filteredMunicipios.map((m) => (
              <Link
                key={m.slug}
                href={`${baseRoute}/${m.slug}`}
                className="group block bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate">{m.municipio}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
