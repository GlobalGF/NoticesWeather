import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = {
  params: { slug: string };
};

const CALCULATORS = [
  {
    id: "placas-solares",
    title: "Calculadora de Placas Solares",
    description: "Paneles necesarios, producción, ahorro anual, coste y amortización en 25 años.",
    color: { bg: "bg-blue-100", text: "text-blue-700", hover: "hover:bg-blue-50 hover:border-blue-300", hoverText: "group-hover:text-blue-700" },
    letter: "P",
  },
  {
    id: "baterias",
    title: "Calculadora de Baterías",
    description: "Capacidad de almacenamiento, módulos recomendados e independencia energética.",
    color: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", hover: "hover:bg-fuchsia-50 hover:border-fuchsia-300", hoverText: "group-hover:text-fuchsia-700" },
    letter: "B",
  },
  {
    id: "financiacion",
    title: "Calculadora de Financiación",
    description: "Cuota mensual, plazo, intereses y comparación con el ahorro en la factura.",
    color: { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:bg-emerald-50 hover:border-emerald-300", hoverText: "group-hover:text-emerald-700" },
    letter: "F",
  },
  {
    id: "excedentes",
    title: "Calculadora de Excedentes",
    description: "Ingresos por verter energía sobrante a la red con compensación simplificada.",
    color: { bg: "bg-teal-100", text: "text-teal-700", hover: "hover:bg-teal-50 hover:border-teal-300", hoverText: "group-hover:text-teal-700" },
    letter: "E",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadoras Solares" };

  return buildMetadata({
    title: `Calculadora solar en ${data.municipio}`,
    description: `Accede a todas las calculadoras solares para ${data.municipio}: paneles, baterías, financiación y excedentes con datos locales de irradiación.`,
    pathname: `/calculadoras/${slug}`,
  });
}

export default async function CalculadoraMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">{municipio}</li>
          </ol>
        </nav>
        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Calculadoras Solares en{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              {municipio}
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Elige una calculadora para obtener datos personalizados de {municipio} ({data.provincia}).
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.id}
              href={`/calculadoras/${calc.id}/${slug}`}
              className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-colors group ${calc.color.hover}`}
            >
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${calc.color.bg} ${calc.color.text} font-bold text-xl shrink-0`}>
                {calc.letter}
              </span>
              <div>
                <p className={`text-base font-bold text-slate-800 ${calc.color.hoverText}`}>
                  {calc.title} en {municipio}
                </p>
                <p className="text-sm text-slate-500 mt-1">{calc.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
