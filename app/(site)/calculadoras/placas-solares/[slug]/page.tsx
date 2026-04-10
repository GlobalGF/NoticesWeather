import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { CalculadoraSolarCompleta } from "@/components/ui/CalculadoraSolarCompleta";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Placas Solares" };

  return buildMetadata({
    title: `Instalación de Placas Solares en ${data.municipio} — Ahorro y Amortización`,
    description: `Calcula cuántos paneles solares necesitas en ${data.municipio}: ${data.horas_sol ?? 2500}h de sol al año. Genera tu propia energía 100% verde y ahorra hasta ${data.ahorro_estimado ?? 800}€/año.`,
    pathname: `/calculadoras/placas-solares/${slug}`,
  });
}

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;
  const provincia = data.provincia;
  const irradiancia = data.irradiacion_solar ?? 1700;
  const precioMedioLuz = data.precio_medio_luz ?? 0.18;
  const precioInstalacion = data.precio_instalacion_medio_eur ?? undefined;
  const subvencionPct = data.subvencion_autoconsumo ? Number(data.subvencion_autoconsumo) : 0;
  const bonificacionIbi = data.bonificacion_ibi ? Number(data.bonificacion_ibi) : 0;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras/placas-solares" className="hover:text-white transition-colors">Placas solares</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">{municipio}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-amber-300 font-bold tracking-widest uppercase text-[10px]">Datos locales de {municipio}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Placas Solares en{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              {municipio}
            </span>
          </h1>
          <h2 className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Genera tu propia energía 100% verde desde tu tejado en {municipio}. Simulador con irradiación real: {irradiancia} kWh/m²/año.
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 -mt-6 relative z-20 pb-24">
        {/* Local data KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Irradiación</p>
            <p className="text-xl font-black text-blue-600">{irradiancia} <span className="text-xs font-bold text-blue-400">kWh/m²</span></p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Horas de sol</p>
            <p className="text-xl font-black text-amber-600">{data.horas_sol ?? 2500} <span className="text-xs font-bold text-amber-400">h/año</span></p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Precio medio</p>
            <p className="text-xl font-black text-slate-700">{precioMedioLuz.toFixed(3)} <span className="text-xs font-bold text-slate-400">€/kWh</span></p>
          </div>
          {precioInstalacion && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Precio instalación</p>
              <p className="text-xl font-black text-slate-700">{precioInstalacion.toLocaleString("es-ES")} <span className="text-xs font-bold text-slate-400">€</span></p>
            </div>
          )}
          {subvencionPct > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-1">Subvención</p>
              <p className="text-xl font-black text-emerald-600">{subvencionPct} <span className="text-xs font-bold text-emerald-400">%</span></p>
            </div>
          )}
          {bonificacionIbi > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1">Bonificación IBI</p>
              <p className="text-xl font-black text-blue-600">{bonificacionIbi} <span className="text-xs font-bold text-blue-400">€/año</span></p>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro estimado</p>
            <p className="text-xl font-black text-emerald-600">{data.ahorro_estimado ?? 800} <span className="text-xs font-bold text-emerald-400">€/año</span></p>
          </div>
        </div>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
          <CalculadoraSolarCompleta
            irradiancia={irradiancia}
            precioMedioLuz={precioMedioLuz}
            precioInstalacion={precioInstalacion}
            subvencionPct={subvencionPct}
            bonificacionIbi={bonificacionIbi}
            municipio={municipio}
            provincia={provincia}
            slug={slug}
          />
        </section>

        {/* Un proceso sencillo */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Tu instalación en {municipio}: un proceso sencillo</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Estudio gratuito", desc: `Simulamos tu ahorro en ${municipio} con datos de PVGIS.` },
              { step: "02", title: "Viabilidad", desc: "Un experto revisa tu tejado y optimiza el diseño." },
              { step: "03", title: "Trámites", desc: "Gestionamos subvenciones y licencias en tu ayuntamiento." },
              { step: "04", title: "Instalación", desc: "Equipos locales certificados instalan en tiempo récord." },
              { step: "05", title: "Producción", desc: "¡Listo! Empieza a ahorrar desde el primer día." }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <span className="text-4xl font-black text-slate-100 absolute -top-2 -right-2 group-hover:text-blue-50 transition-colors">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios - Confianza */}
        <section className="bg-slate-900 rounded-[2rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-10 tracking-tight">¿Por qué confiar en nuestra plataforma?</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Garantía total</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Instalaciones con garantías de hasta 25 años en paneles y 10 años en mano de obra en {municipio}.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Máxima eficiencia</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Nuestros colaboradores utilizan componentes de primera línea para maximizar el rendimiento de tu tejado.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500/30 transition-colors border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Estética Premium</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Paneles Full Black que se integran perfectamente en la estética de tu hogar en {municipio}.</p>
              </div>
            </div>
          </div>
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? provincia}
          slug={slug}
        />

        <footer className="text-center text-xs text-slate-400">
          <p>Datos de irradiación para {municipio} basados en PVGIS (JRC). Cálculos orientativos.</p>
        </footer>
      </div>
    </main>
  );
}
