import { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Financiación Solar — Cuotas, Amortización y Rentabilidad",
  description:
    "Simula la financiación de tu instalación de placas solares: cuota mensual, plazo, tipo de interés y comparación con el ahorro real en la factura eléctrica.",
  pathname: "/calculadoras/financiacion",
});

export default function CalculadoraFinanciacionPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Financiación</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-300 font-bold tracking-widest uppercase text-[10px]">Simulador financiero</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Calculadora de{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              Financiación Solar
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Comprueba si tu instalación solar se paga sola. Compara la cuota de financiación
            con el ahorro real en tu factura eléctrica.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-16 -mt-6 relative z-20 pb-24">
        {/* Calculator */}
        <section>
          <SolarFinancingCalculator municipio="España" costeMedio={5500} ahorroAnual={800} />
        </section>

        {/* SEO: How financing works */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">¿Cómo financiar paneles solares?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-emerald-800 mb-2">Préstamo con amortización francesa</h3>
              <p className="text-sm text-emerald-700">
                La mayoría de financiaciones solares utilizan el sistema francés: cuotas fijas mensuales
                que se mantienen constantes durante todo el plazo. Los plazos habituales son 5, 7 o 10 años
                con tipos de interés del 4-7% TIN.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">¿Se paga sola la instalación?</h3>
              <p className="text-sm text-slate-600">
                Si el ahorro mensual en la factura eléctrica supera la cuota del préstamo, la instalación
                genera beneficio desde el primer mes. Con un plazo a 7-10 años, esto ocurre en la mayoría
                de casos con un consumo superior a 250 kWh/mes.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Subvenciones aplicables</h3>
              <p className="text-sm text-slate-600">
                Las bonificaciones de IBI (hasta 50% durante 5-10 años) y las deducciones IRPF (20-60%)
                pueden reducir el coste neto de la instalación hasta un 40%, mejorando la rentabilidad
                de la financiación.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Modalidades de pago</h3>
              <p className="text-sm text-slate-600">
                Además del préstamo bancario, existen opciones como renting solar (cuota fija sin inversión
                inicial), leasing y PPA (Power Purchase Agreement). El simulador modela el préstamo
                convencional, la opción más común en residencial.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Preguntas frecuentes sobre financiación solar</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Cuánto cuesta financiar placas solares?",
                a: "Con un préstamo de 5.500 € a 7 años al 5,5% TIN, la cuota mensual es de unos 79 €. Si tu ahorro mensual en la factura es de 70-90 €, la instalación prácticamente se paga sola desde el primer mes.",
              },
              {
                q: "¿Qué plazo de financiación solar conviene?",
                a: "Plazos de 5-7 años ofrecen el mejor equilibrio entre cuota y coste total de intereses. A 5 años la cuota es más alta pero pagas menos intereses; a 10 años la cuota baja pero se duplica el coste financiero.",
              },
              {
                q: "¿Necesito entrada para financiar paneles solares?",
                a: "La mayoría de financiaciones solares cubren el 100% de la inversión sin entrada inicial. Algunas entidades ofrecen mejores condiciones con una entrada del 10-20%.",
              },
              {
                q: "¿Cuándo empiezo a ganar dinero con los paneles?",
                a: "Si financias a 7 años y el ahorro mensual supera la cuota, ganas desde el primer mes. Sin financiación, la inversión se recupera en 5-8 años. A partir de ahí, todo el ahorro es beneficio neto durante 17-20 años más.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Otras calculadoras solares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/calculadoras/placas-solares" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm shrink-0">P</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Placas Solares</p>
                <p className="text-xs text-slate-500">Paneles, ahorro y amortización</p>
              </div>
            </Link>
            <Link href="/calculadoras/baterias" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-fuchsia-50 hover:border-fuchsia-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-fuchsia-100 text-fuchsia-700 font-bold text-sm shrink-0">B</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-fuchsia-700">Baterías Solares</p>
                <p className="text-xs text-slate-500">Dimensiona tu almacenamiento</p>
              </div>
            </Link>
            <Link href="/calculadoras/excedentes" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-teal-50 hover:border-teal-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-teal-100 text-teal-700 font-bold text-sm shrink-0">E</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">Excedentes a la Red</p>
                <p className="text-xs text-slate-500">Monetiza tu energía sobrante</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400">
          <p>Simulación orientativa con amortización francesa. Las condiciones finales dependerán de la entidad financiera y tu perfil crediticio.</p>
        </footer>
      </div>

      {/* JSON-LD FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "¿Cuánto cuesta financiar placas solares?", acceptedAnswer: { "@type": "Answer", text: "Con un préstamo de 5.500 € a 7 años al 5,5% TIN, la cuota mensual es de unos 79 €. Si tu ahorro mensual es de 70-90 €, la instalación se paga sola." } },
              { "@type": "Question", name: "¿Qué plazo de financiación solar conviene?", acceptedAnswer: { "@type": "Answer", text: "5-7 años ofrecen el mejor equilibrio. A 5 años la cuota es más alta pero pagas menos intereses; a 10 años la cuota baja pero se duplica el coste financiero." } },
              { "@type": "Question", name: "¿Necesito entrada para financiar paneles solares?", acceptedAnswer: { "@type": "Answer", text: "La mayoría cubren el 100% sin entrada. Algunas entidades ofrecen mejores condiciones con una entrada del 10-20%." } },
              { "@type": "Question", name: "¿Cuándo empiezo a ganar dinero con los paneles?", acceptedAnswer: { "@type": "Answer", text: "Si el ahorro mensual supera la cuota del préstamo, ganas desde el primer mes. Sin financiación, la inversión se recupera en 5-8 años." } },
            ],
          }),
        }}
      />
    </main>
  );
}
