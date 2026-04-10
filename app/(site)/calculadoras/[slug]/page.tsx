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
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";
import { ServerSeoBlock } from "@/components/ui/ServerSeoBlock";
import { 
  Sun, 
  Battery as BatteryIcon, 
  Wallet, 
  Zap, 
  ArrowRight, 
  MapPin, 
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = {
  params: { slug: string };
};

const CALCULATORS = [
  {
    id: "placas-solares",
    title: "Placas Solares",
    subtitle: "Rendimiento Técnico",
    description: "Cálculo de módulos necesarios y ahorro anual basado en irradiación real.",
    icon: Sun,
    color: "amber"
  },
  {
    id: "baterias",
    title: "Baterías",
    subtitle: "Autonomía de Red",
    description: "Estudio de almacenamiento e independencia energética para tu vivienda.",
    icon: BatteryIcon,
    color: "fuchsia"
  },
  {
    id: "financiacion",
    title: "Financiación",
    subtitle: "Rentabilidad ROI",
    description: "Simulación de cuotas bancarias y periodo de retorno de inversión.",
    icon: Wallet,
    color: "emerald"
  },
  {
    id: "excedentes",
    title: "Excedentes",
    subtitle: "Compensación OMIE",
    description: "Estimación de ingresos por vertido de excedentes a la red eléctrica.",
    icon: Zap,
    color: "teal"
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadoras Solares" };

  return buildMetadata({
    title: `Calculadoras Solares en ${data.municipio} · Análisis Técnico`,
    description: `Accede al ecosistema completo de cálculo solar para ${data.municipio} (${data.provincia}). Datos de PVGIS/OMIE para placas, baterías y financiación.`,
    pathname: `/calculadoras/${slug}`,
  });
}

export default async function CalculadoraMunicipioPage({ params }: Props) {
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
    console.warn(`[CalculadoraMunicipioPage] 2b. NOT FOUND in DB for: ${slug}`);
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
      redirect(`/calculadoras/${dbMuniSlug}`);
  }

  const data = match;

  const municipio = data.municipio;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
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
              <li className="text-blue-400 font-bold">{municipio}</li>
            </ol>
          </nav>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-8">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Análisis Localizado: {data.provincia}</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Calculadoras Solares en{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400 bg-clip-text text-transparent italic">
                {municipio}
              </span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Hemos sincronizado nuestros algoritmos con los datos de irradiancia solar y bonificaciones locales vigentes para <span className="text-white">{municipio}</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ── LIGHT CONTENT SECTION ───────────────────────────────────────── */}
      <div className="relative z-10 -mt-12 mx-auto max-w-7xl px-6 pb-32 space-y-16">
        {/* Municipality Switcher (Light Premium Card) */}
        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={data.provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
          slug={dbMuniSlug}
        />

        {/* Honest SEO Content Block */}
        <ServerSeoBlock
          municipio={municipio}
          provincia={data.provincia}
          irradiacionAnual={data.irradiacion_solar}
          ahorroEstimado={data.ahorro_estimado}
          bonificacionIbi={data.bonificacion_ibi}
          precioMedioLuz={data.precio_medio_luz ?? 0.18}
          habitantes={data.habitantes}
        />

        {/* Section Divider */}
        <div className="flex items-center gap-4">
           <div className="h-px bg-slate-200 flex-1" />
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Suite de Simulación Oficial</h2>
           </div>
           <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon;
            const colorVariants = {
              amber: { text: "text-amber-600", light: "bg-amber-100" },
              fuchsia: { text: "text-fuchsia-600", light: "bg-fuchsia-100" },
              emerald: { text: "text-emerald-600", light: "bg-emerald-100" },
              teal: { text: "text-teal-600", light: "bg-teal-100" }
            };
            const cv = colorVariants[calc.color as keyof typeof colorVariants];

            return (
              <Link
                key={calc.id}
                href={`/calculadoras/${calc.id}/${dbMuniSlug}`}
                className="group relative"
              >
                <div className="relative h-full flex flex-col bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 overflow-hidden">
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className={`h-14 w-14 rounded-2xl ${cv.light} flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm shadow-slate-200`}>
                      <Icon className={`w-7 h-7 ${cv.text}`} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
                        <TrendingUp className="w-3 h-3" />
                        <span>Localizado</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${cv.text} mb-3`}>
                      {calc.subtitle}
                    </p>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-blue-700 transition-colors">
                      {calc.title} <span className="text-slate-400 font-medium whitespace-nowrap">en {municipio}</span>
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {calc.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-blue-600 transition-all duration-700 group-hover:w-full" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="mx-auto max-w-7xl px-6 pb-12 border-t border-slate-200 pt-12 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
          Análisis Fotovoltaico Local · SolaryEco Ingeniería · 2026
        </p>
      </footer>
    </main>
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(`[CalculadoraMunicipioPage] Fatal crash for ${slug}:`, error);
    return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
  }
}
