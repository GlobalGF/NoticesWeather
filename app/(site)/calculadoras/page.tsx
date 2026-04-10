import { Metadata } from "next";
import Link from "next/link";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { 
  Sun, 
  Battery as BatteryIcon, 
  Wallet, 
  Zap, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Search 
} from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Calculadoras Solares · Ecosistema de Datos Técnicos",
  description:
    "Herramientas de grado profesional para el dimensionado energético. Simulación oficial de paneles, almacenamiento y rentabilidad financiera para instalaciones fotovoltaicas.",
  pathname: "/calculadoras",
});

const CALCULATORS = [
  {
    href: "/calculadoras/placas-solares",
    title: "Placas Solares",
    subtitle: "Rendimiento Fotovoltaico",
    description: "Cálculo preciso de potencia instalada, producción anual y amortización técnica del sistema.",
    icon: Sun,
    color: "amber"
  },
  {
    href: "/calculadoras/baterias",
    title: "Baterías",
    subtitle: "Autonomía Energética",
    description: "Optimización de capacidad de almacenamiento e independencia de la red eléctrica.",
    icon: BatteryIcon,
    color: "fuchsia"
  },
  {
    href: "/calculadoras/financiacion",
    title: "Financiación",
    subtitle: "Análisis de Inversión",
    description: "Simulador de ROI bancario, cuotas verdes y apalancamiento financiero solar.",
    icon: Wallet,
    color: "emerald"
  },
  {
    href: "/calculadoras/excedentes",
    title: "Excedentes",
    subtitle: "Monetización de Energía",
    description: "Cálculo de compensación simplificada y estimación de ingresos por vertido a red.",
    icon: Zap,
    color: "teal"
  },
] as const;

export default function CalculadorasPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
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
              <li className="text-blue-400">Calculadoras</li>
            </ol>
          </nav>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Algoritmos Verificados 2026</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Ecosistema de datos{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent italic">
                Fotovoltaicos
              </span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed mb-4">
              Plataforma técnica de dimensionado energético. Obtén métricas precisas basadas en irradiación local real y normativas vigentes en España.
            </p>
          </div>
        </div>
      </section>

      {/* ── LIGHT CONTENT SECTION ───────────────────────────────────────── */}
      <div className="relative z-10 -mt-12">
        {/* Calculator Grid */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {CALCULATORS.map((calc) => {
              const Icon = calc.icon;
              const colorVariants = {
                amber: { text: "text-amber-600", light: "bg-amber-100", border: "border-amber-200" },
                fuchsia: { text: "text-fuchsia-600", light: "bg-fuchsia-100", border: "border-fuchsia-200" },
                emerald: { text: "text-emerald-600", light: "bg-emerald-100", border: "border-emerald-200" },
                teal: { text: "text-teal-600", light: "bg-teal-100", border: "border-teal-200" }
              };
              const cv = colorVariants[calc.color as keyof typeof colorVariants];

              return (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group relative h-full"
                >
                  <div className="relative h-full flex flex-col bg-white border border-slate-200 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`h-16 w-16 rounded-2xl ${cv.light} flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm`}>
                        <Icon className={`w-8 h-8 ${cv.text}`} />
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors">
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${cv.text} mb-3`}>
                        {calc.subtitle}
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                        {calc.title}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {calc.description}
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-blue-600 transition-all duration-700 group-hover:w-full" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Municipality Search Section */}
        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div className="relative rounded-[3rem] bg-white border border-slate-200 p-8 md:p-16 overflow-hidden text-center shadow-xl shadow-slate-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-12">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-100 items-center justify-center mb-6 shadow-sm">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Análisis Geográfico Personalizado</h2>
                <p className="text-base text-slate-500 font-medium">
                  Introduce tu municipio para sincronizar nuestras calculadoras con los datos de irradiancia solar oficial de tu zona.
                </p>
              </div>

              <div className="relative max-w-xl mx-auto">
                <div className="bg-slate-50 rounded-full border border-slate-200 p-1 md:p-2 shadow-inner">
                  <LocationSearchBar baseRoute="/calculadoras" placeholder="Introduce tu localidad (ej: Madrid, Barcelona...)" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8">
                 <div className="flex flex-col items-center gap-2">
                    <p className="text-3xl font-black text-slate-900 tabular-nums">8,131</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Municipios Cubiertos</p>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <p className="text-3xl font-black text-slate-900 tabular-nums">±0.25%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precisión Algorítmica</p>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <p className="text-3xl font-black text-slate-800 tabular-nums">RTD</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real Time Data</p>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mx-auto max-w-7xl px-6 pb-12 border-t border-slate-200 pt-12 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
          SolaryEco · Ingeniería Fotovoltaica Digital · 2026
        </p>
      </footer>
    </main>
  );
}
