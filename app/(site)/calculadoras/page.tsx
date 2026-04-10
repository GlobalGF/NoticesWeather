import { Metadata } from "next";
import Link from "next/link";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const metadata: Metadata = buildMetadata({
  title: "Calculadoras solares",
  description:
    "Herramientas profesionales para dimensionar tu instalación fotovoltaica: calcula paneles necesarios, capacidad de baterías, compensación de excedentes y financiación solar.",
  pathname: "/calculadoras",
});

const CALCULATORS = [
  {
    href: "/calculadoras/placas-solares",
    title: "Calculadora de Placas Solares",
    description: "Paneles necesarios, producción, ahorro anual, coste y amortización en 25 años.",
    color: "blue" as const,
    letter: "P",
  },
  {
    href: "/calculadoras/baterias",
    title: "Calculadora de Baterías",
    description: "Capacidad de almacenamiento, módulos recomendados e independencia energética.",
    color: "fuchsia" as const,
    letter: "B",
  },
  {
    href: "/calculadoras/financiacion",
    title: "Calculadora de Financiación",
    description: "Cuota mensual, plazo, intereses y comparación con el ahorro en la factura.",
    color: "emerald" as const,
    letter: "F",
  },
  {
    href: "/calculadoras/excedentes",
    title: "Calculadora de Excedentes",
    description: "Ingresos por verter energía sobrante a la red con compensación simplificada.",
    color: "teal" as const,
    letter: "E",
  },
] as const;

const colorClasses = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", hover: "hover:bg-blue-50 hover:border-blue-300", hoverText: "group-hover:text-blue-700" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", hover: "hover:bg-fuchsia-50 hover:border-fuchsia-300", hoverText: "group-hover:text-fuchsia-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:bg-emerald-50 hover:border-emerald-300", hoverText: "group-hover:text-emerald-700" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", hover: "hover:bg-teal-50 hover:border-teal-300", hoverText: "group-hover:text-teal-700" },
};

export default function CalculadorasPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Calculadoras Solares</li>
          </ol>
        </nav>
        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Calculadoras{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Solares
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Herramientas profesionales para dimensionar tu instalación fotovoltaica,
            calcular el ahorro y simular la financiación.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10 pb-24">
        {/* Calculator directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CALCULATORS.map((calc) => {
            const c = colorClasses[calc.color];
            return (
              <Link
                key={calc.href}
                href={calc.href}
                className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-colors group ${c.hover}`}
              >
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${c.bg} ${c.text} font-bold text-xl shrink-0`}>
                  {calc.letter}
                </span>
                <div>
                  <p className={`text-base font-bold text-slate-800 ${c.hoverText}`}>{calc.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{calc.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Municipality search */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Calculadoras por municipio</h2>
          <p className="text-sm text-slate-500 mb-4">
            Busca tu localidad para obtener datos de irradiación, precios y ahorro personalizados.
          </p>
          <LocationSearchBar baseRoute="/calculadoras" placeholder="Busca tu municipio..." />
        </section>
      </div>
    </main>
  );
}
