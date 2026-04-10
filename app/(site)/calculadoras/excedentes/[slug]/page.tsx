import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Excedentes Solares" };

  return buildMetadata({
    title: `Excedentes Solares en ${data.municipio} (${data.provincia}) — Compensación y Monetización`,
    description: `Calcula cuánto puedes ganar vendiendo excedentes solares a la red en ${data.municipio}. Simulador de compensación simplificada con datos locales de ${data.provincia}.`,
    pathname: `/calculadoras/excedentes/${slug}`,
  });
}

export default async function ExcedentesMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;
  const irradiancia = data.irradiacion_solar ?? 1700;
  const precioMedioLuz = data.precio_medio_luz ?? undefined;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras/excedentes" className="hover:text-white transition-colors">Excedentes</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">{municipio}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <p className="text-teal-300 font-bold tracking-widest uppercase text-[10px]">Datos locales de {municipio}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Excedentes Solares en{" "}
            <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {municipio}
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Calcula tus ingresos por compensación de excedentes en {municipio}, {data.provincia}.
          </p>
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Precio medio luz</p>
            <p className="text-xl font-black text-slate-700">{(data.precio_medio_luz ?? 0.18).toFixed(3)} <span className="text-xs font-bold text-slate-400">€/kWh</span></p>
          </div>
        </div>

        <section>
          <SurplusCompensationCalculator municipio={municipio} irradiancia={irradiancia} precioMedioLuz={precioMedioLuz} />
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={data.provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
          slug={slug}
        />

        <footer className="text-center text-xs text-slate-400">
          <p>Precios de compensación basados en mercado OMIE. Cálculos orientativos para {municipio}.</p>
        </footer>
      </div>
    </main>
  );
}
