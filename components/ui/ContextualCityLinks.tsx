/**
 * ContextualCityLinks — Server component
 * Generates keyword-rich internal links to nearby cities and sub-pages.
 *
 * This is the core internal linking weapon: each anchor text is a
 * transactional keyword like "presupuesto placas solares en [city]"
 * or "precio instalación solar en [city]".
 */

import Link from "next/link";

type NearbyCity = {
  slug: string;
  municipio: string;
  provincia?: string;
  ahorroEstimado?: number | null;
};

type Props = {
  municipio: string;
  provincia: string;
  slug: string;
  comunidadSlug: string;
  provinciaSlug: string;
  nearbyCities: NearbyCity[];
};

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Keyword-rich anchor text variations for nearby cities
const NEARBY_ANCHORS = [
  (m: string) => `Presupuesto placas solares en ${m}`,
  (m: string) => `Instalación fotovoltaica en ${m}`,
  (m: string) => `Precio paneles solares en ${m}`,
  (m: string) => `Empresas de placas solares en ${m}`,
  (m: string) => `Ahorro solar en ${m}`,
  (m: string) => `Autoconsumo fotovoltaico en ${m}`,
];

export function ContextualCityLinks({
  municipio,
  provincia,
  slug,
  comunidadSlug,
  provinciaSlug,
  nearbyCities,
}: Props) {
  const muniClean = cleanName(municipio);
  const h = getStringHash(slug);
  const yearNow = new Date().getFullYear();

  // Filter out current city and limit
  const nearby = nearbyCities
    .filter(c => c.slug !== slug)
    .slice(0, 6);

  if (nearby.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-black">⛓</span>
          <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Estudios solares relacionados</p>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Instalaciones fotovoltaicas en {cleanName(provincia)}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Nearby cities with keyword-rich anchors */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Placas solares en municipios cercanos a {muniClean}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nearby.map((city, i) => {
              const anchorFn = NEARBY_ANCHORS[(h + i) % NEARBY_ANCHORS.length];
              return (
                <li key={city.slug}>
                  <Link
                    href={`/placas-solares/${city.slug}`}
                    className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 group-hover:bg-blue-600 transition-colors" />
                    <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium transition-colors">
                      {anchorFn(cleanName(city.municipio))}
                    </span>
                    {city.ahorroEstimado != null && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        {Math.round(city.ahorroEstimado)} €/año
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Deep links to sub-articles for current city */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            Análisis detallado para {muniClean}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/placas-solares/${slug}/precio`}
                className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600 text-xs shrink-0">💶</span>
                <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium">
                  Precio placas solares en {muniClean} ({yearNow})
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={`/placas-solares/${slug}/subvenciones`}
                className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-600 text-xs shrink-0">🇪🇺</span>
                <span className="text-sm text-slate-700 group-hover:text-emerald-700 font-medium">
                  Subvenciones y ayudas solares en {muniClean}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={`/placas-solares/${slug}/ahorro`}
                className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-amber-600 text-xs shrink-0">💰</span>
                <span className="text-sm text-slate-700 group-hover:text-amber-700 font-medium">
                  Ahorro con placas solares en {muniClean}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={`/calculadoras/placas-solares/${slug}`}
                className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-indigo-600 text-xs shrink-0">🔢</span>
                <span className="text-sm text-slate-700 group-hover:text-indigo-700 font-medium">
                  Calculadora solar para {muniClean}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={`/subvenciones-solares/${comunidadSlug}/${provinciaSlug}/${slug}`}
                className="group flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-100 text-teal-600 text-xs shrink-0">📋</span>
                <span className="text-sm text-slate-700 group-hover:text-teal-700 font-medium">
                  Informe de subvenciones en {muniClean} ({cleanName(provincia)})
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">
          Datos verificados · {cleanName(provincia)} · Actualizado {yearNow}
        </p>
      </div>
    </section>
  );
}
