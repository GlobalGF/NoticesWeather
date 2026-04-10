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
import { parseMarkdown } from "@/lib/utils/text";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";
import { 
  Zap, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp,
  Euro,
  BarChart3,
  Lightbulb
} from "lucide-react";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Excedentes Solares" };

  return buildMetadata({
    title: `Compensación de Excedentes en ${data.municipio} — Monetiza tu Sol`,
    description: `Calcula cuánto recibes por la energía sobrante de tus placas solares en ${data.municipio}. Simulador basado en precios OMIE y rendimiento técnico en ${data.provincia}.`,
    pathname: `/calculadoras/excedentes/${slug}`,
  });
}

export default async function ExcedentesMunicipioPage({ params }: Props) {
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
    console.warn(`[ExcedentesMunicipioPage] 2b. NOT FOUND in DB for: ${slug}`);
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
      redirect(`/calculadoras/excedentes/${dbMuniSlug}`);
  }

  const data = match;

  const municipio = data.municipio;
  const irradiancia = data.irradiacion_solar ?? 1700;
  const precioMedioLuz = data.precio_medio_luz ?? 0.18;

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-teal-100">
      {/* ── DARK HERO SECTION ─────────────────────────────────────────── */}
      <section className="bg-slate-950 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-12">
            <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <li><Link href="/" className="hover:text-slate-300 transition-colors">Portal</Link></li>
              <li className="text-slate-800">/</li>
              <li><Link href="/calculadoras" className="hover:text-slate-300 transition-colors">Calculadoras</Link></li>
              <li className="text-slate-800">/</li>
              <li><Link href="/calculadoras/excedentes" className="hover:text-slate-300 transition-colors">Excedentes</Link></li>
              <li className="text-slate-800">/</li>
              <li className="text-teal-400 font-bold">{municipio}</li>
            </ol>
          </nav>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 mb-8">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Monetización Energética Real</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Vende tu Sol en <span className="bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-400 bg-clip-text text-transparent italic">{municipio}</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              {parseMarkdown(`Calculamos el valor de la **energía generada** que no consumes para reducir tu **cuenta de la luz** mediante la **compensación OMIE**.`)}
            </p>
          </div>
        </div>
      </section>

      {/* ── LIGHT CONTENT SECTION ───────────────────────────────────────── */}
      <div className="relative z-10 -mt-12 mx-auto max-w-7xl px-6 pb-32 space-y-16">
        
        {/* Surplus KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Irradiación", val: `${irradiancia}`, unit: "kWh/m²", icon: Lightbulb, color: "text-blue-600" },
             { label: "Rendimiento", val: "80", unit: "% PR", icon: BarChart3, color: "text-amber-600" },
             { label: "Compensación", val: "0.05", unit: "€/kWh", icon: Euro, color: "text-emerald-600" },
             { label: "Horas Sol", val: `${data.horas_sol ?? 2500}`, unit: "h/año", icon: Zap, color: "text-teal-500" }
           ].map((kpi, i) => (
             <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform" />
                <kpi.icon className={`w-5 h-5 ${kpi.color} mb-3`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                <p className="text-xl font-black text-slate-900">{kpi.val} <span className="text-[10px] text-slate-400 font-bold">{kpi.unit}</span></p>
             </div>
           ))}
        </div>

        {/* Componente Calculadora */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-12">
          <SurplusCompensationCalculator municipio={municipio} irradiancia={irradiancia} precioMedioLuz={precioMedioLuz} />
        </section>

        {/* Honest SEO Content Block (Inline for Surplus) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-8">
              {parseMarkdown(`La **economía** del vertido a red en ${municipio}`)}
           </h2>
           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    {parseMarkdown(`Convertir tu tejado en una fuente de ingresos en **${municipio}** es posible gracias a la **compensación de excedentes**. Cada vatio de **energía solar** que no utilizas se vierte a la red, y tu **empresa** comercializadora te lo descuenta directamente en la **cuenta de la luz**.`)}
                 </p>
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    {parseMarkdown(`Nuestro **equipo** técnico evalúa el **proyecto** basándose en el precio diario del mercado **OMIE**. Para un **cliente** en **${data.provincia}**, esto puede suponer una reducción adicional de hasta el 40% en la factura neta, mejorando la rentabilidad de cada **panel**.`)}
                 </p>
              </div>
              <div className="space-y-6">
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    {parseMarkdown(`La **calidad** del inversor es determinante: solo los **sistemas** inteligentes gestionan el vertido de forma eficiente para maximizar el retorno. En **${municipio}**, con una **energía generada** superior a la media nacional, la gestión de excedentes es el pilar de un ahorro veraz.`)}
                 </p>
                 <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 italic text-sm text-teal-800 leading-relaxed">
                    "{parseMarkdown(`Instalar en **${municipio}** sin activar la compensación es perder dinero. Con la radiación de **${data.provincia}**, el **sistema fotovoltaico** produce mucho más de lo que una familia consume en horas valle. Esa **luz** sobrante es tu mayor activo financiero.`)}"
                 </div>
              </div>
           </div>
        </section>

        {/* Surplus Tips */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "Batería Virtual", text: "Acumula el valor de tus excedentes para pagar la cuenta de la luz de meses nublados.", icon: Zap },
             { title: "Precios OMIE", text: "Tu luz se compensa a precio de mercado mayorista, asegurando transparencia total.", icon: BarChart3 },
             { title: "Sin Comisiones", text: "La comercializadora debe aplicar el RD 244/2019 sin cargos ocultos en su gestión.", icon: ShieldCheck }
           ].map((tip, i) => (
             <div key={i} className="bg-slate-950 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <tip.icon className="w-6 h-6 text-teal-400 mb-4" />
                <h3 className="text-lg font-black mb-2">{tip.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{tip.text}</p>
             </div>
           ))}
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={data.provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
          slug={dbMuniSlug}
        />

        <footer className="text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Gestión de Excedentes Fotovoltaicos · SolaryEco Ingeniería · 2026
           </p>
        </footer>
      </div>
    </main>
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(`[ExcedentesMunicipioPage] Fatal crash for ${slug}:`, error);
    return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
  }
}
