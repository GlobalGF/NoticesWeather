import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";
import { CalculatorMunicipalitySwitcher } from "@/components/ui/CalculatorMunicipalitySwitcher";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) return { title: "Calculadora de Financiación Solar" };

  return buildMetadata({
    title: `Financiación Solar en ${data.municipio} (${data.provincia}) — Cuotas y Amortización`,
    description: `Simula la financiación de placas solares en ${data.municipio}: coste medio ${data.precio_instalacion_medio_eur ?? 5000}€, ahorro ${data.ahorro_estimado ?? 800}€/año. Compara cuota vs ahorro.`,
    pathname: `/calculadoras/financiacion/${slug}`,
  });
}

export default async function FinanciacionMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const municipio = data.municipio;
  const costeMedio = data.precio_instalacion_medio_eur ?? 5000;
  const ahorroAnual = data.ahorro_estimado ?? 800;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras/financiacion" className="hover:text-white transition-colors">Financiación</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">{municipio}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-300 font-bold tracking-widest uppercase text-[10px]">Datos locales de {municipio}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Financiación Solar en{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              {municipio}
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Coste medio de instalación en {municipio}: {costeMedio.toLocaleString("es-ES")} €.
            Ahorro estimado: {ahorroAnual} €/año.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 -mt-6 relative z-20 pb-24">
        <section>
          <SolarFinancingCalculator municipio={municipio} costeMedio={costeMedio} ahorroAnual={ahorroAnual} />
        </section>

        <CalculatorMunicipalitySwitcher
          municipio={municipio}
          provincia={data.provincia}
          comunidadAutonoma={data.comunidad_autonoma ?? data.provincia}
          slug={slug}
        />

        <footer className="text-center text-xs text-slate-400">
          <p>Datos de precios para {municipio} actualizados periódicamente. Simulación orientativa.</p>
        </footer>
      </div>
    </main>
  );
}
