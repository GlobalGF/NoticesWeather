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
    title: `Instalación de Baterías Solares en ${data.municipio} — Ahorro y Autonomía`,
    description: `Dimensiona tu batería solar en ${data.municipio}: ${data.horas_sol ?? 2500}h de sol al año. Maximiza tu ahorro y autonomía energética con una batería a medida.`,
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
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05]" />
        
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
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">¿Te conviene instalar una batería en {municipio}?</h1>
            <p className="text-xl text-slate-400">Analizamos el ahorro, precio y rentabilidad real para tu hogar.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-16 -mt-6 relative z-20 pb-24">
        
        {/* Pregunta 1 */}
        <section className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black mb-6">1. ¿Me conviene batería ahora mismo?</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <p className="text-slate-600 leading-relaxed">
                        Con **{horasSol} horas de sol** anuales en {municipio}, tu instalación fotovoltaica producirá gran cantidad de energía. Una batería es ideal si:
                    </p>
                    <ul className="mt-4 space-y-3">
                        <li className="text-sm flex gap-2">✅ Concentras tu gasto en horas nocturnas.</li>
                        <li className="text-sm flex gap-2">✅ Quieres reducir tu factura al mínimo posible.</li>
                        <li className="text-sm flex gap-2">✅ Buscas independencia ante apagones o subidas de luz.</li>
                    </ul>
                </div>
                <div className="bg-fuchsia-50 p-6 rounded-2xl border border-fuchsia-100">
                    <p className="text-fuchsia-900 font-bold mb-2">Dato en {municipio}:</p>
                    <p className="text-sm text-fuchsia-800 italic">"Las baterías suelen amortizarse en 7-10 años en esta zona gracias a la alta radiación solar diaria."</p>
                </div>
            </div>
        </section>

        {/* Pregunta 2 */}
        <section>
            <h2 className="text-2xl font-black mb-6">2. ¿Cuánto ahorro yo con baterías?</h2>
            <p className="text-slate-500 mb-8">Usa esta calculadora para estimar tu ahorro anual basado en tu consumo real.</p>
            <BatteryNeedsCalculator municipio={municipio} annualSunHours={horasSol} />
        </section>

        {/* Pregunta 3 */}
        <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl font-black mb-6">3. ¿Cuánto cuesta la instalación en {municipio}?</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Módulo 5kWh</p>
                    <p className="text-2xl font-black">Desde 2.850€</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Módulo 10kWh</p>
                    <p className="text-2xl font-black">Desde 4.950€</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Factores que bajan el precio</p>
                    <p className="text-sm text-emerald-400">Bonificación IBI / IRPF</p>
                </div>
            </div>
            <p className="mt-8 text-xs text-slate-500 italic">* Los precios son estimaciones orientativas. Cada vivienda requiere un presupuesto personalizado.</p>
        </section>

        {/* Footer info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-bold mb-4">¿Necesitas un presupuesto real?</h3>
            <p className="text-slate-500 mb-6 text-sm">Compara hasta 3 presupuestos de instaladores certificados en tu zona.</p>
            <Link href="/presupuesto-solar" className="inline-block bg-fuchsia-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-fuchsia-500 transition-all">
                Pedir Presupuesto Gratis
            </Link>
        </div>

      </div>
    </main>
  );
}
