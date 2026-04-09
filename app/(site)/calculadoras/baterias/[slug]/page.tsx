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
    title: `Calculadora de baterías solares en ${data.municipio}`,
    description: `Dimensiona tu batería solar en ${data.municipio}: ${data.horas_sol ?? 2500}h de sol, ahorro estimado ${data.ahorro_estimado ?? 800}€/año. Recomendación de módulos y autonomía energética.`,
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
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Dimensionador con {horasSol} horas de sol anuales en {municipio}, {data.provincia}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 -mt-6 relative z-20 pb-24">
        <section>
          <BatteryNeedsCalculator municipio={municipio} annualSunHours={horasSol} />
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
