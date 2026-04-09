import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Baterías Solares" };

  return buildMetadata({
    title: `Instalación de Baterías Solares en ${data.municipio} — Ahorro y Autonomía`,
    description: `Dimensiona tu batería solar en ${data.municipio}: ${data.horas_sol ?? 2500}h de sol al año. Maximiza tu ahorro y autonomía energética con una batería a medida.`,
    pathname: `/calculadoras/baterias/${slug}`,
  });
}

export default async function BateriasMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;
  const horasSol = data.horas_sol ?? 2500;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras/baterias" className="hover:text-white transition-colors">Baterías</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">{municipio}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <p className="text-fuchsia-300 font-bold tracking-widest uppercase text-[10px]">Datos locales de {municipio}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Baterías Solares en{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              {municipio}
            </span>
          </h1>
          <h2 className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Logra tu independencia energética en {municipio}. Dimensionador con {horasSol} horas de sol anuales.
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 -mt-6 relative z-20 pb-24">
        <section>
          <BatteryNeedsCalculator municipio={municipio} annualSunHours={horasSol} />
        </section>

        {/* Proceso */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Tu autonomía en {municipio}: un proceso sencillo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Estudio Local", desc: `Analizamos tu consumo y excedentes en ${municipio}.` },
              { step: "02", title: "Configuración", desc: "Elegimos la capacidad (5kWh, 10kWh...) que necesitas." },
              { step: "03", title: "Instalación", desc: "Equipos certificados en tu zona para un montaje seguro." },
              { step: "04", title: "Puesta en Marcha", desc: "Empieza a ahorrar el 100% de tu producción solar." }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-fuchsia-300 transition-colors">
                <span className="text-4xl font-black text-slate-100 absolute -top-2 -right-2 group-hover:text-fuchsia-50 transition-colors">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <h2 className="text-2xl md:text-3xl font-black mb-8 relative z-10">¿Por qué sumar baterías en {municipio}?</h2>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div>
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Independencia energética</h3>
              <p className="text-sm text-slate-400">Pasa del 50% al 90% de independencia en {municipio} utilizando tu propia energía nocturna.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Seguridad y Resiliencia</h3>
              <p className="text-sm text-slate-400">Protección frente a cortes de luz y variaciones de precio en el mercado eléctrico.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Eficiencia Máxima</h3>
              <p className="text-sm text-slate-400">Sistemas inteligentes que optimizan la carga y descarga para ahorrar cada céntimo.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Más calculadoras para {municipio}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href={`/calculadoras/placas-solares/${slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm shrink-0">P</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Placas Solares en {municipio}</p>
                <p className="text-xs text-slate-500">Paneles, ahorro y amortización</p>
              </div>
            </Link>
            <Link href={`/calculadoras/financiacion/${slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">F</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">Financiación en {municipio}</p>
                <p className="text-xs text-slate-500">Simula cuotas y rentabilidad</p>
              </div>
            </Link>
            <Link href={`/calculadoras/excedentes/${slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-teal-50 hover:border-teal-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-teal-100 text-teal-700 font-bold text-sm shrink-0">E</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">Excedentes en {municipio}</p>
                <p className="text-xs text-slate-500">Monetiza tu energía sobrante</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400">
          <p>Datos de horas de sol para {municipio} basados en PVGIS (JRC). Cálculos orientativos.</p>
        </footer>
      </div>
    </main>
  );
}
