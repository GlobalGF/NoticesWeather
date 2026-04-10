import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import Fallback from "@/components/solar/Fallback";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { cleanMunicipalitySlug, slugify } from "@/lib/utils/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalculadoraSolarCompleta } from "@/components/ui/CalculadoraSolarCompleta";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";
import { ServerSeoBlock } from "@/components/ui/ServerSeoBlock";
import { 
  Sun, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  Euro,
  ClipboardCheck,
  Rocket
} from "lucide-react";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Placas Solares" };

  return buildMetadata({
    title: `Calculadora de Placas Solares en ${data.municipio} — Autoconsumo y Ahorro`,
    description: `Estudio técnico fotovoltaico en ${data.municipio}: ${data.horas_sol ?? 2500}h de sol al año. Calcula tu ahorro con datos de PVGIS y bonificaciones IBI locales.`,
    pathname: `/calculadoras/placas-solares/${slug}`,
  });
}

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
  const { slug } = params;
  try {
    if (isBlockedSlug(slug)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: muniRows, error: muniError } = await supabase
    .from("municipios_energia")
    .select("*")
    .filter("slug", "ilike", `${slug}%`)
    .limit(20);
    
  if (muniError || !muniRows || muniRows.length === 0) {
    console.warn(`[PlacasSolaresMunicipioPage] 2b. NOT FOUND in DB for: ${slug}`);
    notFound();
  }
  
  // Find the canonical match
  const match = (muniRows as any[]).find((m: any) => {
    const mProvSlug = slugify(m.provincia);
    return cleanMunicipalitySlug(m.slug, mProvSlug) === slug;
  }) || (muniRows as any[]).find((m: any) => m.slug === slug);

  if (!match) notFound();

  const dbProvSlug = slugify(match.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(match.slug, dbProvSlug);

  // Canonical Redirect
  if (slug !== dbMuniSlug) {
      redirect(`/calculadoras/placas-solares/${dbMuniSlug}`);
  }

  const data = match;

  const municipio = data.municipio;
  const provincia = data.provincia;
  const irradiancia = data.irradiacion_solar ?? 1700;
  const precioMedioLuz = data.precio_medio_luz ?? 0.18;
  const precioInstalacion = data.precio_instalacion_medio_eur ?? undefined;
  const subvencionPct = data.subvencion_autoconsumo ? Number(data.subvencion_autoconsumo) : 0;
  const bonificacionIbi = data.bonificacion_ibi ? Number(data.bonificacion_ibi) : 0;

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-amber-100 pb-24">
      {/* ── CLEAN HERO SECTION ─────────────────────────────────────────── */}
      <section className="bg-white pt-12 pb-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <li><Link href="/" className="hover:text-amber-600 transition-colors">Portal</Link></li>
              <li>/</li>
              <li><Link href="/calculadoras" className="hover:text-amber-600 transition-colors">Calculadoras</Link></li>
              <li>/</li>
              <li className="text-slate-900 font-bold">{municipio}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
              Calculadora de Placas Solares en <span className="text-amber-500">{municipio}</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Basado en {irradiancia} kWh/m² de irradiación solar y las bonificaciones fiscales vigentes en {provincia}.
            </p>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR FOCUS SECTION ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 -mt-10">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/60 p-1 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estudio Técnico en Vivo</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-slate-400">
               <span>PROVINCIA: {provincia.toUpperCase()}</span>
               <span>IRRADIACIÓN: {irradiancia}</span>
            </div>
          </div>
          <div className="p-6 md:p-10">
            <CalculadoraSolarCompleta
              irradiancia={irradiancia}
              precioMedioLuz={precioMedioLuz}
              precioInstalacion={precioInstalacion}
              subvencionPct={subvencionPct}
              bonificacionIbi={bonificacionIbi}
              municipio={municipio}
              provincia={provincia}
              slug={dbMuniSlug}
            />
          </div>
        </div>
      </div>

      {/* ── ADDITIONAL INFO & SEO ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 mt-16 space-y-16">
        
        {/* Local data KPIs - Premium Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Irradiación", val: `${irradiancia}`, unit: "kWh/m²", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Horas de Sol", val: `${data.horas_sol ?? 2500}`, unit: "h/año", icon: Sun, color: "text-amber-600", bg: "bg-amber-50" },
             { label: "Ahorro Estimado", val: `${data.ahorro_estimado ?? 800}`, unit: "€/año", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
             { label: "Precio Luz", val: `${precioMedioLuz.toFixed(3)}`, unit: "€/kWh", icon: Euro, color: "text-slate-600", bg: "bg-slate-50" }
           ].map((kpi, i) => (
             <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute top-0 right-0 w-16 h-16 ${kpi.bg} -mr-8 -mt-8 rounded-full blur-xl group-hover:scale-150 transition-transform`} />
                <kpi.icon className={`w-5 h-5 ${kpi.color} mb-4 relative z-10`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 relative z-10">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900 relative z-10">{kpi.val} <span className="text-[10px] text-slate-400">{kpi.unit}</span></p>
             </div>
           ))}
        </div>


        {/* Honest SEO Content Block */}
        <ServerSeoBlock
          municipio={municipio}
          provincia={provincia}
          irradiacionAnual={irradiancia}
          horasSol={data.horas_sol}
          ahorroEstimado={data.ahorro_estimado}
          bonificacionIbi={bonificacionIbi}
          precioMedioLuz={precioMedioLuz}
          habitantes={data.habitantes}
        />

        {/* Process Steps - Premium Card */}
        <section>
          <div className="flex items-center gap-4 mb-8">
             <div className="h-px bg-slate-200 flex-1" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Ingeniería Paso a Paso</h2>
             <div className="h-px bg-slate-200 flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: "01", title: "Estudio técnico", desc: `Analizamos tu tejado en ${municipio} vía satélite.`, icon: MapPin },
              { step: "02", title: "Viabilidad", desc: "Un equipo técnico valida la estructura real.", icon: ClipboardCheck },
              { step: "03", title: "Burocracia", desc: "Gestionamos licencias en tu ayuntamiento.", icon: ShieldCheck },
              { step: "04", title: "Instalación", desc: "Montaje rápido por ingenieros locales.", icon: Rocket },
              { step: "05", title: "Autoconsumo", desc: "Control total desde tu cuenta de la luz.", icon: Zap }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                <span className="absolute top-4 right-4 text-xs font-black text-slate-100 group-hover:text-slate-200 transition-colors">{s.step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-slate-950 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tighter italic">Compromiso de Calidad Fotovoltaica</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: "Vida Útil", text: "Paneles Tier-1 con garantía de rendimiento de 25 años en toda España.", icon: ShieldCheck },
                { title: "Ingeniería", text: "Proyectos diseñados por ingenieros colegiados buscando el máximo ROI.", icon: Zap },
                { title: "Atención", text: "Soporte post-venta y monitorización activa de tu sistema.", icon: TrendingUp }
              ].map((item, i) => (
                <div key={i}>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black mb-4">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? provincia}
          slug={dbMuniSlug}
        />

        <footer className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Análisis de Autoconsumo · SolaryEco Ingeniería · 2026
          </p>
        </footer>
      </div>
    </main>
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(`[PlacasSolaresMunicipioPage] Fatal crash for ${slug}:`, error);
    return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
  }
}
