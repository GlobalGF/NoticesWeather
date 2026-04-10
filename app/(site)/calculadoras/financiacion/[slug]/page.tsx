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
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";
import { 
  Wallet, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp,
  Euro,
  FileText,
  BadgePercent
} from "lucide-react";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Financiación de Placas Solares" };

  return buildMetadata({
    title: `Financiación Solar en ${data.municipio} — Cuotas y Rentabilidad`,
    description: `Calcula la cuota de tu préstamo solar en ${data.municipio}. Compara el ahorro mensual en tu cuenta de la luz vs la cuota de financiación. Análisis de economía fotovoltaica.`,
    pathname: `/calculadoras/financiacion/${slug}`,
  });
}

export default async function FinanciacionMunicipioPage({ params }: Props) {
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
    console.warn(`[FinanciacionMunicipioPage] 2b. NOT FOUND in DB for: ${slug}`);
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
      redirect(`/calculadoras/financiacion/${dbMuniSlug}`);
  }

  const data = match;

  const municipio = data.municipio;
  const costeMedio = data.precio_instalacion_medio_eur ?? 5000;
  const ahorroAnual = data.ahorro_estimado ?? 800;

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100">
      {/* ── DARK HERO SECTION ─────────────────────────────────────────── */}
      <section className="bg-slate-950 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-12">
            <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <li><Link href="/" className="hover:text-slate-300 transition-colors">Portal</Link></li>
              <li className="text-slate-800">/</li>
              <li><Link href="/calculadoras" className="hover:text-slate-300 transition-colors">Calculadoras</Link></li>
              <li className="text-slate-800">/</li>
              <li><Link href="/calculadoras/financiacion" className="hover:text-slate-300 transition-colors">Financiación</Link></li>
              <li className="text-slate-800">/</li>
              <li className="text-emerald-400 font-bold">{municipio}</li>
            </ol>
          </nav>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Análisis de Rentabilidad Local</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Financia tu Energía en <span className="bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-400 bg-clip-text text-transparent italic">{municipio}</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Simulamos tu **proyecto fotovoltaico** en {municipio} para que la cuota se pague sola con el ahorro en tu **cuenta de la luz**.
            </p>
          </div>
        </div>
      </section>

      {/* ── LIGHT CONTENT SECTION ───────────────────────────────────────── */}
      <div className="relative z-10 -mt-12 mx-auto max-w-7xl px-6 pb-32 space-y-16">
        
        {/* Financing Data KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/40">
              <Euro className="w-6 h-6 text-emerald-600 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inversión Media</p>
              <p className="text-3xl font-black text-slate-900">{costeMedio.toLocaleString("es-ES")} €</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Basado en instalaciones tipo en {data.provincia}.</p>
           </div>
           <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/40">
              <TrendingUp className="w-6 h-6 text-emerald-600 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ahorro Anual</p>
              <p className="text-3xl font-black text-emerald-600">{ahorroAnual.toLocaleString("es-ES")} €</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Estimación real según irradiación en {municipio}.</p>
           </div>
           <div className="bg-emerald-950 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-xl rounded-full" />
              <BadgePercent className="w-6 h-6 text-emerald-400 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Interés Estimado</p>
              <p className="text-3xl font-black text-white">4.99% <span className="text-[10px] text-emerald-400">TIN</span></p>
              <p className="text-xs text-emerald-200/60 mt-2 font-medium">Condiciones preferentes para proyectos verdes.</p>
           </div>
        </div>

        {/* Componente Calculadora */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-12">
          <SolarFinancingCalculator municipio={municipio} costeMedio={costeMedio} ahorroAnual={ahorroAnual} />
        </section>

        {/* Honest SEO Content Block (Inline for Finance) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-8">
              ¿Por qué financiar tu **economía** energética en {municipio}?
           </h2>
           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Apostar por un **proyecto fotovoltaico** en **{municipio}** mediante financiación es la forma más inteligente de mejorar tu **economía** doméstica. Al pagar una cuota mensual inferior al ahorro en tu **cuenta de la luz**, el sistema se autofinancia desde el primer día.
                 </p>
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Nuestra **empresa** colabora con entidades que ofrecen **atención** preferente a la **energía solar**. Con un **equipo** de asesores financieros, adaptamos el préstamo a cada **cliente** de **{data.provincia}** buscando el punto óptimo de amortización.
                 </p>
              </div>
              <div className="space-y-6">
                 <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    La **calidad** de cada **panel** instalado influye directamente en la rentabilidad. Un **sistema** de alto rendimiento en **{municipio}** asegura que el flujo de **energía** sea constante, cubriendo sobradamente los intereses bancarios y generando beneficios netos a corto plazo.
                 </p>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-sm text-slate-500 leading-relaxed">
                    "En **{municipio}**, el 70% de las nuevas instalaciones optan por modelos de financiación flexibles. Es una decisión de **economía** circular: usas el dinero que antes pagabas a la eléctrica para ser dueño de tu propia **luz**."
                 </div>
              </div>
           </div>
        </section>

        {/* Comparison Table */}
        <section>
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
              <div className="bg-slate-950 p-6 md:p-10">
                 <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Evolución de tu Economía Solar en {municipio}</h3>
                 <p className="text-slate-400 text-sm mt-2">Estimación basada en un sistema de 5kWp financiado a 10 años.</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-slate-100">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Hito Temporal</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Impacto en la Cuenta</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Económico</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-6 font-bold text-slate-900">Mes 1</td>
                          <td className="p-6 text-slate-600">Ahorro {">"} Cuota</td>
                          <td className="p-6"><span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Beneficio Diario</span></td>
                       </tr>
                       <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-6 font-bold text-slate-900">Año 7</td>
                          <td className="p-6 text-slate-600">Amortización Técnica</td>
                          <td className="p-6"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">Capital Recuperado</span></td>
                       </tr>
                       <tr className="hover:bg-slate-50 transition-colors">
                          <td className="p-6 font-bold text-slate-900">Año 25</td>
                          <td className="p-6 text-slate-600">Energía Gratuita</td>
                          <td className="p-6"><span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Libertad Total</span></td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={data.provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
          slug={dbMuniSlug}
        />

        <footer className="text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Análisis de Viabilidad Financiera · SolaryEco Ingeniería · 2026
           </p>
        </footer>
      </div>
    </main>
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(`[FinanciacionMunicipioPage] Fatal crash for ${slug}:`, error);
    return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
  }
}
