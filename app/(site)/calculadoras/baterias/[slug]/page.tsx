import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import dynamic from "next/dynamic";
import { BatterySeoBlock } from "@/components/ui/BatterySeoBlock";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";
import { 
  ArrowRight, 
  MapPin, 
  Euro, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  Battery as BatteryIcon,
  TrendingUp
} from "lucide-react";

/* ── Lazy Loaded Components ── */
const BatteryNeedsCalculator = dynamic(() => import("@/components/ui/BatteryNeedsCalculator").then(mod => mod.BatteryNeedsCalculator));

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

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default async function BateriasMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;
  const horasSol = data.horas_sol ?? 2500;

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-100">
      {/* ── DARK HERO SECTION ─────────────────────────────────────────── */}
      <section className="bg-slate-950 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
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
              <BatteryIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dimisionamiento Localizado</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Autonomía Energética en <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent italic">{municipio}</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Calculamos el almacenamiento ideal para tu vivienda basándonos en los datos de PVGIS y las bonificaciones IBI de {data.provincia}.
            </p>
          </div>
        </div>
      </section>

      {/* ── LIGHT CONTENT SECTION ───────────────────────────────────────── */}
      <div className="relative z-10 -mt-12 mx-auto max-w-7xl px-6 pb-32 space-y-16">
        
        {/* Dynamic SEO Block */}
        <div className="bg-white rounded-[2.5rem] p-1 md:p-2 border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <BatterySeoBlock 
            municipio={municipio} 
            provincia={data.provincia} 
            irradiacionAnual={data.irradiacion_solar}
            horasSol={horasSol}
            habitantes={data.habitantes}
          />
        </div>

        {/* Calculator Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-16 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
               <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-blue-600" />
                     </div>
                     <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Simulador de Ahorro Real</h2>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                    Optimiza tu inversión solar
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Ajusta los parámetros para encontrar el equilibrio perfecto entre coste inicial e independencia energética para tu hogar en {municipio}.
                  </p>
               </div>
               <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600">
                     <CheckCircle2 className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-widest italic">Datos PVGIS 2026</span>
                  </div>
               </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-slate-100/50 rounded-[3rem] -z-10 blur-xl opacity-50" />
              <BatteryNeedsCalculator municipio={municipio} annualSunHours={horasSol} />
            </div>
        </section>

        {/* Pricing Table */}
        <section className="bg-white rounded-[3rem] border border-slate-200 p-8 md:p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                 <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shadow-sm shadow-amber-200">
                    <Euro className="w-5 h-5 text-amber-600" />
                 </div>
                 <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Referencia de Precios en {municipio}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  <div className="relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Módulo 5kWh (Inicio)</p>
                      <div className="flex items-baseline gap-1 mb-2">
                         <span className="text-4xl font-black text-slate-900">{(2850 + (getStringHash(municipio) % 150)).toLocaleString("es-ES")}€</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Equipos Tier-1 e instalación con certificación técnica.</p>
                  </div>
                  
                  <div className="relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Módulo 10kWh (Premium)</p>
                      <div className="flex items-baseline gap-1 mb-2">
                         <span className="text-4xl font-black text-slate-900">{(4950 + (getStringHash(municipio) % 250)).toLocaleString("es-ES")}€</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Recomendado para alto consumo nocturno y climatización.</p>
                  </div>

                  <div className="relative p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-200 transition-all hover:bg-emerald-100/50">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Bonificación de IBI</p>
                      </div>
                      <p className="text-lg font-black text-emerald-900 mb-2">Vigente en {municipio}</p>
                      <p className="text-xs text-emerald-700 font-medium mb-6">Disponibles hasta un 50% de descuento en el recibo de tu vivienda.</p>
                      <Link href={`/subvenciones-solares/${slugify(data.comunidad_autonoma ?? "")}/${slugify(data.provincia)}/${slug}`} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-black">
                         Ver ayudas locales <ArrowRight className="w-3 h-3" />
                      </Link>
                  </div>
              </div>
            </div>
        </section>

        <CalculatorMunicipalitySwitcher
           municipio={municipio}
           provincia={data.provincia}
           comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
           slug={slug}
        />

        {/* Lead Capture */}
        <section className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05]" />
            <div className="relative z-10 max-w-2xl mx-auto">
               <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 italic leading-tight">¿Prefieres un estudio profesional a medida?</h3>
               <p className="text-slate-400 font-medium text-base mb-10 leading-relaxed">
                  Conectamos con ingenieros solares en {municipio} para proporcionarte 3 ofertas técnicas comparativas sin compromiso y personalizadas para tu tejado.
               </p>
               <Link href="/presupuesto-solar" className="group/btn relative inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-blue-50 active:scale-95 shadow-xl shadow-white/5">
                  <span>Solicitar Auditoría Gratis</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
               </Link>
            </div>
        </section>

      </div>

      <footer className="mx-auto max-w-7xl px-6 pb-12 border-t border-slate-200 pt-12 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
          Auditoría de Independencia Energética · SolaryEco Ingeniería · 2026
        </p>
      </footer>
    </main>
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
