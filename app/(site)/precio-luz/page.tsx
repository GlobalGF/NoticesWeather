import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats, getPrecioLuzHoy } from "@/lib/data/solar";
import { getProvinceStats, getAllProvinces } from "@/lib/data/getProvinceStats";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";
import ProvincePageClient from "@/components/ui/ProvincePageClient";
import { PrecioLuzWidget } from "@/components/ui/PrecioLuzWidget";
import { cachePolicy } from "@/lib/cache/policy";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { getPvpcAnalysis } from "@/lib/data/pvpc";

export const revalidate = 3600; // 1h — PVPC updates hourly

type Props = {
  searchParams: { provincia?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { provincia } = searchParams;

  if (provincia) {
    const stats = await getProvinceStats(provincia);
    const name = stats?.provinceName ?? provincia;
    return buildMetadata({
      title: `Precio luz hoy en ${name} (PVPC)`,
      description: `Precio de la luz hoy en ${name}: tarifa PVPC en €/kWh hora a hora. Compara precios, tarifas de consumo y potencia contratada. Ahorro en factura y compensación de excedentes solares por municipio.`,
      pathname: `/precio-luz?provincia=${provincia}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: "Precio de la luz hoy hora a hora PVPC",
    description: "Precio de la luz hoy hora a hora con gráfico 24h en vivo. PVPC actualizado de Red Eléctrica: horas baratas, predicción de mañana y cuándo poner la lavadora. Datos REE.",
    pathname: "/precio-luz",
    noIndex: true,
  });
}

export default async function PrecioLuzRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  // ── Province-specific Landing ──────────────────────────────────
  if (provincia) {
    const [provStats, allProvs] = await Promise.all([
      getProvinceStats(provincia),
      getAllProvinces(),
    ]);

    if (!provStats) {
      return <GenericPrecioLuzPage />;
    }

    const meta = getProvinceMetadata(provincia);

    return (
      <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

        {/* ── Province Hero with Background ── */}
        <div className="relative pb-24 pt-16 overflow-hidden shadow-lg">
          <div className="absolute inset-0">
            <img
              src={meta.backgroundUrl}
              alt={provStats.provinceName}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
            <div className="inline-flex items-center gap-3 mb-5 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <p className="text-amber-300 font-bold tracking-widest uppercase text-[10px]">
                Mercado Eléctrico Regulado en {provStats.provinceName}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Precio de la Luz en <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{provStats.provinceName}</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Encuentra tu localidad en {provStats.provinceName} y descubre la tarifa de compensación de excedentes para placas solares y el coste de la electricidad hoy.
            </p>
          </div>
        </div>

        {/* ── Province Client Section ── */}
        <ProvincePageClient
          hubName="Precio de la Luz"
          baseRoute="/precio-luz"
          provinceName={provStats.provinceName}
          provinceSlug={provStats.provinceSlug}
          municipios={provStats.municipios}
          allProvinces={allProvs}
          stats={{
            totalMunicipios: provStats.totalMunicipios,
            avgSunHours: provStats.avgSunHours,
            avgRadiation: provStats.avgRadiation,
            avgSavings: provStats.avgSavings,
            avgIBI: provStats.avgIBI,
          }}
        />
      </main>
    );
  }

  // ── Generic / No Province Selected ─────────────────────────────
  return <GenericPrecioLuzPage />;
}

// ── Extracted generic page (no province selected) ────────────────
async function GenericPrecioLuzPage() {
  const [stats, precioLuz, pvpc] = await Promise.all([
    getNationalStats(),
    getPrecioLuzHoy(),
    getPvpcAnalysis(),
  ]);

  const hoy = pvpc.hoy;
  const manana = pvpc.manana;
  const fmt = (n: number) => n.toFixed(3);
  const tendenciaIcon = pvpc.tendencia === "sube" ? "↑" : pvpc.tendencia === "baja" ? "↓" : "→";
  const tendenciaColor = pvpc.tendencia === "sube" ? "text-red-600" : pvpc.tendencia === "baja" ? "text-emerald-600" : "text-slate-500";
  const tendenciaLabel = pvpc.tendencia === "sube" ? "Sube vs ayer" : pvpc.tendencia === "baja" ? "Baja vs ayer" : "Estable vs ayer";

  // Time-of-day classifications
  const horasNoche = hoy?.horas.filter(h => h.hora >= 0 && h.hora < 8) ?? [];
  const horasManana = hoy?.horas.filter(h => h.hora >= 8 && h.hora < 14) ?? [];
  const horasTarde = hoy?.horas.filter(h => h.hora >= 14 && h.hora < 24) ?? [];
  const avgPeriod = (arr: typeof horasNoche) =>
    arr.length > 0 ? arr.reduce((s, h) => s + h.precio_kwh, 0) / arr.length : 0;
  const mediaNoche = avgPeriod(horasNoche);
  const mediaManana = avgPeriod(horasManana);
  const mediaTarde = avgPeriod(horasTarde);

  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-slate-50 min-h-screen font-sans">

      {/* ── Hero ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <p className="text-amber-400 font-bold tracking-widest uppercase text-[10px]">PVPC en Tiempo Real · Datos REE</p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3">
            Precio de la Luz Hoy<br className="hidden md:block" />
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">por Horas y Tramos</span>
          </h1>

          <p className="text-lg md:text-2xl text-amber-200 font-semibold mb-6 capitalize">{fechaHoy}</p>

          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Gráfico 24 h en vivo del precio PVPC, horas más baratas para poner la lavadora,
            predicción de mañana y tendencia semanal. Fuente oficial: Red Eléctrica de España.
          </p>

          <LocationSearchBar baseRoute="/placas-solares" placeholder="Tu municipio: calcula cuánto ahorrarías con placas..." />
        </div>
      </div>

      {/* ── Live KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
          <div className="flex flex-col items-center text-center px-1 sm:px-2">
            <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-blue-200/50 scale-90 sm:scale-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </span>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Precio Medio Hoy</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{hoy ? fmt(hoy.media) : fmt(precioLuz)}€</p>
            <p className="text-[10px] font-bold text-blue-600 hidden sm:block">€/kWh PVPC</p>
          </div>
          <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8">
            <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-emerald-200/50 scale-90 sm:scale-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </span>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Hora Más Barata</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{hoy?.min ? `${String(hoy.min.hora).padStart(2, "0")}:00` : "–"}</p>
            <p className="text-[10px] font-bold text-emerald-600 hidden sm:block">{hoy?.min ? `${fmt(hoy.min.precio_kwh)} €/kWh` : "sin datos"}</p>
          </div>
          <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8 mt-4 sm:mt-0 border-t border-slate-100 md:border-t-0 pt-4 sm:pt-0">
            <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-red-200/50 scale-90 sm:scale-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
            </span>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Hora Más Cara</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{hoy?.max ? `${String(hoy.max.hora).padStart(2, "0")}:00` : "–"}</p>
            <p className="text-[10px] font-bold text-red-600 hidden sm:block">{hoy?.max ? `${fmt(hoy.max.precio_kwh)} €/kWh` : "sin datos"}</p>
          </div>
          <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8 mt-4 sm:mt-0 border-t border-slate-100 md:border-t-0 pt-4 sm:pt-0">
            <span className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl mb-3 sm:mb-4 shadow-inner scale-90 sm:scale-100 ${pvpc.tendencia === "sube" ? "bg-red-100 text-red-600 border border-red-200/50" : pvpc.tendencia === "baja" ? "bg-emerald-100 text-emerald-600 border border-emerald-200/50" : "bg-amber-100 text-amber-600 border border-amber-200/50"}`}>
              <span className="text-xl font-black">{tendenciaIcon}</span>
            </span>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Tendencia</p>
            <p className={`text-2xl sm:text-3xl font-black tabular-nums ${tendenciaColor}`}>{tendenciaLabel.split(" ")[0]}</p>
            <p className={`text-[10px] font-bold hidden sm:block ${tendenciaColor}`}>vs ayer ({fmt(pvpc.mediaAyer)}€)</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 pb-24">

        {/* ── Live 24h Chart ── */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-6">
            Gráfico PVPC 24 h en vivo — {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h2>
          <PrecioLuzWidget initialPrecio={hoy?.media ?? precioLuz} />
        </section>

        {/* ── Precio por franja (resumen compacto) ── */}
        {hoy && hoy.horas.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Precio medio por franja horaria hoy
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Resumen del precio PVPC por franja del día — consulta el <Link href="/precio-luz/horas-baratas" className="text-emerald-600 font-semibold underline underline-offset-2">análisis completo hora a hora</Link>.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Noche (00–08h)</p>
                <p className="text-3xl font-black text-indigo-700 tabular-nums">{fmt(mediaNoche)} €</p>
                <p className="text-xs text-slate-500 mt-1">Franja valle — la más barata</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Mañana (08–14h)</p>
                <p className="text-3xl font-black text-amber-700 tabular-nums">{fmt(mediaManana)} €</p>
                <p className="text-xs text-slate-500 mt-1">Incluye punta (10–14h)</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Tarde (14–00h)</p>
                <p className="text-3xl font-black text-orange-700 tabular-nums">{fmt(mediaTarde)} €</p>
                <p className="text-xs text-slate-500 mt-1">Punta vespertina (18–22h)</p>
              </div>
            </div>
          </section>
        )}

        {/* ── ¿Cuándo es más barata la luz hoy? ── */}
        {hoy && hoy.horasBaratas.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              ¿Cuándo es más barata la luz hoy?
            </h2>
            <p className="text-slate-500 mb-6">
              Las 6 horas con el PVPC más bajo de hoy. Ideal para programar
              lavadora, lavavajillas, carga del coche eléctrico o termo de agua.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              {hoy.horasBaratas
                .sort((a, b) => a.hora - b.hora)
                .map((h) => (
                  <div
                    key={h.hora}
                    className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                  >
                    <span className="text-2xl font-black text-emerald-700 tabular-nums">
                      {String(h.hora).padStart(2, "0")}:00
                    </span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">
                      {fmt(h.precio_kwh)} €
                    </span>
                  </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Evita estas horas</p>
                <div className="flex flex-wrap gap-2">
                  {hoy.horasCaras
                    .sort((a, b) => a.hora - b.hora)
                    .map((h) => (
                      <span key={h.hora} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-bold text-red-700 tabular-nums">
                        {String(h.hora).padStart(2, "0")}:00
                        <span className="text-red-400 text-xs">{fmt(h.precio_kwh)}€</span>
                      </span>
                    ))}
                </div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Resumen del día</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex justify-between"><span>Precio medio</span><strong className="tabular-nums">{fmt(hoy.media)} €/kWh</strong></li>
                  <li className="flex justify-between"><span>Mínimo</span><strong className="tabular-nums">{hoy.min ? `${fmt(hoy.min.precio_kwh)} € (${String(hoy.min.hora).padStart(2, "0")}:00)` : "–"}</strong></li>
                  <li className="flex justify-between"><span>Máximo</span><strong className="tabular-nums">{hoy.max ? `${fmt(hoy.max.precio_kwh)} € (${String(hoy.max.hora).padStart(2, "0")}:00)` : "–"}</strong></li>
                  <li className="flex justify-between"><span>Media 7 días</span><strong className="tabular-nums">{fmt(pvpc.media7d)} €/kWh</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/precio-luz/horas-baratas"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition-colors"
              >
                Ver análisis completo de horas baratas
                <span className="text-emerald-300">→</span>
              </Link>
            </div>
          </section>
        )}

        {/* ── Predicción de mañana ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Precio de la luz mañana — Predicción PVPC
          </h2>
          {manana && manana.horas.length > 0 ? (
            <>
              <p className="text-slate-500 mb-6">
                Precios PVPC publicados por REE para mañana {manana.fecha}. Disponibles a partir de las 20:15 h del día anterior.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Media</p>
                  <p className="text-3xl font-black text-slate-800 tabular-nums">{fmt(manana.media)}€</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">Mínimo</p>
                  <p className="text-3xl font-black text-emerald-700 tabular-nums">{manana.min ? fmt(manana.min.precio_kwh) : "–"}€</p>
                  <p className="text-xs text-emerald-600">{manana.min ? `a las ${String(manana.min.hora).padStart(2, "0")}:00` : ""}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Máximo</p>
                  <p className="text-3xl font-black text-red-700 tabular-nums">{manana.max ? fmt(manana.max.precio_kwh) : "–"}€</p>
                  <p className="text-xs text-red-600">{manana.max ? `a las ${String(manana.max.hora).padStart(2, "0")}:00` : ""}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">vs Hoy</p>
                  {hoy ? (
                    <>
                      <p className={`text-3xl font-black tabular-nums ${manana.media > hoy.media ? "text-red-600" : "text-emerald-600"}`}>
                        {manana.media > hoy.media ? "+" : ""}{((manana.media - hoy.media) * 100 / (hoy.media || 1)).toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500">{manana.media > hoy.media ? "más cara" : "más barata"}</p>
                    </>
                  ) : (
                    <p className="text-3xl font-black text-slate-400">–</p>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Mejores horas para mañana</p>
                <div className="flex flex-wrap gap-2">
                  {manana.horasBaratas
                    .sort((a, b) => a.hora - b.hora)
                    .map((h) => (
                      <span key={h.hora} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-bold text-emerald-700 tabular-nums">
                        {String(h.hora).padStart(2, "0")}:00
                        <span className="text-emerald-400 text-xs">{fmt(h.precio_kwh)}€</span>
                      </span>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-sm font-semibold text-amber-800 mb-1">Precios de mañana aún no disponibles</p>
              <p className="text-xs text-amber-600">
                Red Eléctrica publica los precios del día siguiente a partir de las 20:15 h.
                Vuelve después de esa hora para ver la predicción de mañana.
              </p>
            </div>
          )}
        </section>

        {/* ── ¿Qué es el mercado regulado de la luz? ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
            ¿Qué es el mercado regulado de la luz?
          </h2>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <p>
              En España existen dos opciones para contratar la electricidad: el <strong>mercado regulado (PVPC)</strong> y
              el <strong>mercado libre</strong>. El mercado regulado está supervisado por el Gobierno y su precio se
              fija cada hora según la subasta del mercado mayorista, gestionado por <strong>OMIE</strong> y publicado
              por <strong>Red Eléctrica de España (REE)</strong> a través de la plataforma ESIOS.
            </p>
            <p>
              El PVPC (Precio Voluntario para el Pequeño Consumidor) está disponible para consumidores con
              potencia contratada <strong>≤ 10 kW</strong>. A diferencia de las tarifas del mercado libre, donde
              la comercializadora fija un precio por kWh estable, el PVPC varía las 24 horas del día,
              lo que permite ahorrar concentrando el consumo en las horas más baratas.
            </p>
            <p>
              Las <strong>comercializadoras de referencia</strong> (COR) son las únicas autorizadas a ofrecer la tarifa
              PVPC. Según la <strong>CNMC</strong>, aproximadamente el 35% de los hogares españoles se acogen a esta tarifa.
              La principal ventaja es la transparencia: los precios son públicos y se publican con antelación.
            </p>
          </div>
        </section>

        {/* ── ¿Qué franjas horarias están incluidas en la tarifa PVPC? ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
            ¿Qué franjas horarias están incluidas en la tarifa PVPC?
          </h2>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <p>
              Desde junio de 2021, la tarifa regulada 2.0TD aplica <strong>discriminación horaria con tres tramos</strong>:
              punta, llano y valle. Cada tramo tiene un coste de energía diferente, por lo que elegir bien
              cuándo consumir puede suponer un ahorro de hasta el 40% en la factura.
            </p>
            <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Tramos horarios de la tarifa 2.0TD</h3>
            <div className="grid md:grid-cols-3 gap-4 not-prose mb-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Punta (la más cara)</p>
                <p className="text-sm text-slate-700 font-semibold">10:00 – 14:00 y 18:00 – 22:00</p>
                <p className="text-xs text-slate-500 mt-1">Lunes a viernes (excepto festivos nacionales)</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Llano (intermedia)</p>
                <p className="text-sm text-slate-700 font-semibold">08:00 – 10:00, 14:00 – 18:00, 22:00 – 00:00</p>
                <p className="text-xs text-slate-500 mt-1">Lunes a viernes (excepto festivos nacionales)</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">Valle (la más barata)</p>
                <p className="text-sm text-slate-700 font-semibold">00:00 – 08:00</p>
                <p className="text-xs text-slate-500 mt-1">Todos los días + fines de semana y festivos completos</p>
              </div>
            </div>
            <p>
              Con <strong>placas solares en autoconsumo</strong>, produces tu propia electricidad durante
              las horas de sol (punta y llano), que es precisamente cuando la tarifa PVPC es más cara.
              Esto significa que <strong>evitas comprar kWh al precio más alto</strong> y, si generas excedentes,
              los compensas a un precio de mercado (en torno a 0,05 €/kWh), reduciendo aún más tu factura.
            </p>
          </div>
        </section>

        {/* ── ¿Cómo se calcula el precio PVPC? ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
            ¿Cómo se calcula el precio de la luz PVPC?
          </h2>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <p>
              El precio PVPC de cada hora se compone de varios conceptos regulados. El más importante es el
              <strong> coste de la energía</strong>, que proviene de la subasta diaria del mercado mayorista (OMIE).
              Cada día, a las 12:00, se celebra la subasta para las 24 horas del día siguiente, donde
              se cruzan las ofertas de generadores (centrales nucleares, renovables, ciclos combinados)
              con la demanda prevista.
            </p>
            <p>
              Al coste de energía se le suman los <strong>peajes de acceso</strong> (regulados por la CNMC),
              los <strong>cargos del sistema</strong> (déficit de tarifa, incentivos renovables) y los
              <strong> pagos por capacidad</strong>. Finalmente, se aplica el <strong>IVA del 21%</strong> y el
              <strong> Impuesto Especial sobre la Electricidad (IEE)</strong>.
            </p>
            <p>
              ¿Por qué varía tanto? Porque el mercado mayorista refleja en tiempo real factores como:
              la producción eólica y solar (cuando hay mucho viento o sol, el precio baja), la demanda
              (más alta en invierno por calefacción), el precio del gas natural (que fija el coste de
              las centrales de ciclo combinado) y las interconexiones con Francia y Portugal.
            </p>
          </div>
        </section>

        {/* ── Preguntas frecuentes ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-6">
            Preguntas frecuentes sobre el precio de la luz
          </h2>
          <div className="space-y-6">
            <details className="group" open>
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Cuándo es más barata la luz hoy?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                {hoy?.horasBaratas
                  ? `Hoy las horas más baratas son ${hoy.horasBaratas.sort((a, b) => a.hora - b.hora).map(h => `${String(h.hora).padStart(2, "0")}:00`).join(", ")} con precios entre ${fmt(hoy.horasBaratas[0]?.precio_kwh ?? 0)} y ${fmt(hoy.horasBaratas[hoy.horasBaratas.length - 1]?.precio_kwh ?? 0)} €/kWh. `
                  : "Los precios se actualizan cada hora. "}
                Generalmente, las horas valle (00:00 – 08:00) ofrecen el precio PVPC más bajo,
                aunque el precio exacto varía cada día según la demanda y la generación renovable.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Qué diferencia hay entre mercado regulado y mercado libre?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                En el mercado regulado (PVPC) el precio cambia cada hora según el mercado mayorista: pagas
                el coste real de la energía. En el mercado libre, la comercializadora te ofrece un precio
                fijo (o indexado) que ya incluye su margen. El PVPC suele ser más barato si desplazas consumo
                a horas valle, pero implica más variabilidad. El mercado libre ofrece previsibilidad a cambio
                de un sobrecoste medio del 10-20%.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Qué es el precio indexado de la luz?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                El precio indexado es una tarifa del mercado libre donde el coste del kWh se vincula al
                precio del mercado mayorista (como el PVPC), pero la comercializadora añade un margen fijo
                por gestión (0,005–0,015 €/kWh). Es un punto intermedio: ofrece precios cercanos al PVPC
                con la flexibilidad de poder contratar potencia superior a 10 kW y servicios adicionales.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Por qué sube y baja el precio de la luz cada hora?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                El precio varía porque refleja la subasta horaria del mercado eléctrico. Cuando hay mucha
                generación renovable (eólica + solar) y baja demanda (noches, fines de semana), el precio
                cae. Cuando la demanda sube (mañanas y tardes laborables) y se necesitan centrales de gas
                o ciclo combinado más caras, el precio aumenta. También influyen el precio del gas natural,
                los derechos de emisión de CO₂ y las interconexiones internacionales con Francia y Portugal.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Cuándo es más barata la luz los fines de semana?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                Los sábados, domingos y festivos nacionales son <strong>todo valle durante las 24 horas</strong>.
                No hay distinción entre punta, llano y valle. Aprovecha estos días para las tareas de
                mayor consumo: horno, secadora, plancha, carga del coche eléctrico, etc.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿A qué hora poner la lavadora para ahorrar?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                Lo ideal es programarla entre las 02:00 y las 06:00 (hora valle). Un ciclo consume entre
                1 y 1,5 kWh. A precio valle puedes ahorrar entre 0,10 € y 0,20 € por lavado frente a
                hora punta. Si acumulas 5 lavados/semana, son 30–50 € al año solo en lavadora.
                {hoy && mediaNoche > 0 && mediaManana > 0 && ` Hoy la diferencia noche vs mañana es de ${fmt(mediaManana - mediaNoche)} €/kWh.`}
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-amber-700 transition-colors">
                  ¿Cómo puedo dejar de depender del precio de la luz?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-0">
                Instalando placas solares en autoconsumo produces tu propia electricidad durante las
                horas de sol (justo cuando la tarifa PVPC es más cara). Un hogar medio en España puede
                cubrir el 60–80% de su consumo diurno con paneles, reduciendo su factura entre 600 y 1.200 €/año.
                Los excedentes se compensan en tu factura a precio de mercado (~0,05 €/kWh).
              </p>
            </details>
          </div>
        </section>

        {/* ── Solar CTA ── */}
        <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
            ¿Cansado de depender del precio de la luz?
          </h2>
          <p className="text-indigo-200 max-w-2xl mx-auto mb-8">
            Con placas solares generas tu propia electricidad a coste fijo durante 25+ años.
            Calcula gratis cuánto ahorrarías en tu municipio con datos reales de irradiación solar y tarifa PVPC.
          </p>
          <LocationSearchBar baseRoute="/placas-solares" placeholder="Tu municipio: calcula tu ahorro solar..." />
        </section>

        {/* ── Geo Directory ── */}
        <section>
          <div className="mb-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">Ahorro solar por provincia</h2>
            <p className="text-slate-500">
              Selecciona tu provincia para calcular cuánto ahorrarías con placas solares
              frente al precio actual de la red eléctrica.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <GeoDirectory
              level="provincias"
              baseRoute="/placas-solares"
              queryParam="provincia"
            />
          </div>
        </section>

        {/* ── Fuentes ── */}
        <footer className="text-center text-xs text-slate-400 pt-4">
          <p>
            Datos PVPC publicados por <strong>Red Eléctrica de España (REE)</strong> vía API ESIOS.
            Actualización automática cada hora. Última sincronización: {new Date(pvpc.updatedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}.
          </p>
        </footer>
      </div>

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "¿Cuándo es más barata la luz hoy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Las horas más baratas suelen ser entre las 00:00 y las 08:00 (horario valle de la tarifa 2.0TD). ${hoy?.horasBaratas ? `Hoy las mejores son ${hoy.horasBaratas.sort((a, b) => a.hora - b.hora).map(h => String(h.hora).padStart(2, "0") + ":00").join(", ")}.` : ""}`,
                },
              },
              {
                "@type": "Question",
                name: "¿Qué diferencia hay entre mercado regulado y mercado libre?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "En el mercado regulado (PVPC) el precio cambia cada hora según el mayorista. En el libre, la comercializadora fija un precio que incluye su margen. El PVPC suele ser más barato si desplazas consumo a horas valle.",
                },
              },
              {
                "@type": "Question",
                name: "¿Por qué sube y baja el precio de la luz cada hora?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El precio refleja la subasta horaria del mercado eléctrico. Con mucha generación renovable y baja demanda el precio cae. Cuando se necesitan centrales de gas más caras, sube. También influyen el precio del gas, los derechos de CO₂ y las interconexiones internacionales.",
                },
              },
              {
                "@type": "Question",
                name: "¿A qué hora poner la lavadora para ahorrar?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Lo ideal es programarla entre las 02:00 y las 06:00 (hora valle). Un ciclo consume entre 1 y 1,5 kWh, ahorrando 0,10–0,20 € por lavado frente a hora punta.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cuándo es más barata la luz los fines de semana?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Los sábados, domingos y festivos nacionales tienen tarifa valle las 24 horas. Todas las horas se cobran al tramo más barato.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cómo puedo dejar de depender del precio de la luz?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Instalando placas solares en autoconsumo produces tu propia electricidad durante las horas de sol. Un hogar medio puede cubrir el 60–80% de su consumo diurno, ahorrando entre 600 y 1.200 €/año.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}