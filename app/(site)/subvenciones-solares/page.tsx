import { Metadata } from "next";
import Link from "next/link";
import CitySearchInput from "@/components/ui/CitySearchInput";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

export const metadata: Metadata = {
  title: "Subvenciones Placas Solares 2026 | Ayudas por Comunidad Autónoma — Solaryeco",
  description: "Guía actualizada de subvenciones, deducciones IRPF, bonificaciones de IBI e ICIO para instalar placas solares en España. Busca las ayudas disponibles en tu municipio.",
};

const CCAA_SLUGS: Record<string, string> = {
  "Andalucía": "andalucia",
  "Aragón": "aragon",
  "Asturias": "principado-de-asturias",
  "Islas Baleares": "illes-balears",
  "Canarias": "canarias",
  "Cantabria": "cantabria",
  "Castilla y León": "castilla-y-leon",
  "Castilla-La Mancha": "castilla-la-mancha",
  "Cataluña": "cataluna",
  "Comunidad Valenciana": "comunitat-valenciana",
  "Extremadura": "extremadura",
  "Galicia": "galicia",
  "Comunidad de Madrid": "comunidad-madrid",
  "Región de Murcia": "region-de-murcia",
  "Navarra": "comunidad-foral-navarra",
  "País Vasco": "pais-vasco",
  "La Rioja": "la-rioja",
  "Ceuta": "ceuta-ceuta",
  "Melilla": "melilla-melilla",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  activa: { label: "Convocatoria activa", className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
  fiscal: { label: "Deducción fiscal", className: "text-blue-700 bg-blue-50 border border-blue-200" },
  agotada: { label: "Agotada", className: "text-red-700 bg-red-50 border border-red-200" },
};

const CCAA_STATUS: Record<string, "activa" | "fiscal" | "agotada"> = {
  "Andalucía": "activa",
  "Aragón": "fiscal",
  "Asturias": "fiscal",
  "Islas Baleares": "activa",
  "Canarias": "activa",
  "Cantabria": "fiscal",
  "Castilla y León": "activa",
  "Castilla-La Mancha": "fiscal",
  "Cataluña": "activa",
  "Comunidad Valenciana": "activa",
  "Extremadura": "activa",
  "Galicia": "activa",
  "Comunidad de Madrid": "activa",
  "Región de Murcia": "fiscal",
  "Navarra": "fiscal",
  "País Vasco": "activa",
  "La Rioja": "activa",
  "Ceuta": "fiscal",
  "Melilla": "fiscal",
};

export const revalidate = 3600;

export default async function SubvencionesSolaresRootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: ccaaRows } = await supabase
    .from("subvenciones_solares_ccaa_es")
    .select("comunidad_autonoma, subvencion_porcentaje, max_subvencion_euros, programa, fecha_fin")
    .order("subvencion_porcentaje", { ascending: false });

  // Build a lookup by name for easy access
  const byName: Record<string, any> = {};
  (ccaaRows as any[] ?? []).forEach(r => { byName[r.comunidad_autonoma] = r; });

  const activeCount = Object.values(CCAA_STATUS).filter(s => s === "activa").length;

  return (
    <main className="bg-white min-h-screen font-sans">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] bg-center" />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-500 flex items-center gap-2 mb-10" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span className="text-slate-700">›</span>
            <span className="text-slate-400">Subvenciones Solares</span>
          </nav>

          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3 space-y-5">
              <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">{activeCount} Comunidades con convocatoria abierta · 2026</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Subvenciones para<br />
                <span className="text-emerald-400">Placas Solares</span>{" "}
                <span className="text-slate-300">en España</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                Consulta el programa vigente en tu Comunidad Autónoma, compara los porcentajes de subvención y encuentra las bonificaciones de IBI e ICIO de tu Ayuntamiento.
              </p>

              <div className="flex flex-wrap gap-5 pt-2">
                {[
                  { label: "IRPF estatal", value: "Hasta 60%" },
                  { label: "Bonificación IBI", value: "Hasta 50%" },
                  { label: "Descuento ICIO", value: "Hasta 95%" },
                ].map((item) => (
                  <div key={item.label} className="border border-slate-700 bg-slate-800/60 rounded-lg px-4 py-2.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">{item.label}</p>
                    <p className="text-xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <p className="text-white font-bold mb-1 text-base">Busca tu municipio</p>
                <p className="text-slate-400 text-sm mb-4">Localiza las ayudas exactas de tu ciudad en segundos.</p>
                <CitySearchInput />
                <p className="text-slate-600 text-xs mt-3 text-center">Más de 8.100 municipios indexados en España</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Datos actualizados 2026</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subvenciones por Comunidad Autónoma
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Tabla comparativa con el porcentaje máximo de subvención, el tope de importe y el programa vigente en cada región.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Convocatoria abierta</span>
            <span className="flex items-center gap-1.5 text-blue-700 font-medium"><span className="h-2 w-2 rounded-full bg-blue-400"></span> Solo fiscal</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comunidad Autónoma</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Subvención</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tope máximo</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Programa activo</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(CCAA_SLUGS).map(([name, slug], i) => {
                const db = byName[name];
                const pct = db?.subvencion_porcentaje ?? "—";
                const maxEur = db?.max_subvencion_euros;
                const programa = db?.programa ?? "Consultar convocatoria autonómica";
                const status = CCAA_STATUS[name] || "fiscal";
                const s = STATUS_LABELS[status];
                return (
                  <tr key={slug} className={`group hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{name}</span>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      {pct !== "—" ? (
                        <span className="text-xl font-black text-slate-800">{pct}<span className="text-sm font-normal text-slate-400">%</span></span>
                      ) : <span className="text-slate-400 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center hidden md:table-cell">
                      {maxEur ? (
                        <span className="font-bold text-emerald-700">{Number(maxEur).toLocaleString("es-ES")} €</span>
                      ) : <span className="text-slate-400 text-sm">Variable</span>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-slate-600 leading-snug line-clamp-1 text-xs">{programa}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap ${s.className}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/subvenciones-solares/${slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors whitespace-nowrap"
                      >
                        Ver detalle
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-slate-400 text-xs mt-4 text-center">
          Los importes son orientativos. Consulta siempre la resolución oficial de la convocatoria en vigor antes de tramitar.
        </p>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">¿Cómo se tramitan las subvenciones?</h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">El proceso es burocrático pero muy rentable. El orden cronológico es crucial.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: "01", title: "Solicitud previa", desc: "Se presenta telemáticamente ANTES de instalar. Este es el error más común: hacerlo al revés invalida la subvención." },
              { step: "02", title: "Memoria técnica", desc: "Tu instalador elabora la documentación de diseño, presupuesto detallado y certificados energéticos requeridos." },
              { step: "03", title: "Instalación y legalización", desc: "Una vez aprobada la solicitud, se instalan los paneles y se legaliza el sistema ante el organismo de Industria." },
              { step: "04", title: "Justificación y cobro", desc: "Se aportan facturas y justificantes bancarios. La administración abona la ayuda una vez verificada." },
            ].map((item) => (
              <div key={item.step} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-3xl font-black text-emerald-500/40 mb-3">{item.step}</p>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Sin coste, sin compromiso</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              ¿Quieres que un instalador certificado gestione toda la subvención?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Los instaladores de nuestra red tramitan el expediente completo, desde la solicitud previa hasta el cobro de la ayuda. Solo pagas si avanzas.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/presupuesto-solar" className="block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
              Pedir Presupuesto Gratis →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}