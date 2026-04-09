import { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Excedentes Solares — Compensación y Monetización",
  description:
    "Calcula cuánto puedes ganar vendiendo excedentes solares a la red eléctrica. Simulador de compensación simplificada con ingresos diarios, mensuales y anuales.",
  pathname: "/calculadoras/excedentes",
});

export default function CalculadoraExcedentesPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Excedentes</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <p className="text-teal-300 font-bold tracking-widest uppercase text-[10px]">Compensación simplificada</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Calculadora de{" "}
            <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Excedentes Solares
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre cuánto puedes ganar cada mes vertiendo energía sobrante a la red eléctrica
            con el mecanismo de compensación simplificada.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-16 -mt-6 relative z-20 pb-24">
        {/* Calculator */}
        <section>
          <SurplusCompensationCalculator municipio="España" />
        </section>

        {/* SEO: How compensation works */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">¿Cómo funciona la compensación de excedentes?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-teal-800 mb-2">Compensación simplificada (RD 244/2019)</h3>
              <p className="text-sm text-teal-700">
                Desde 2019, los autoconsumidores con instalaciones de hasta 100 kW pueden acogerse a la
                compensación simplificada. Por cada kWh excedentario vertido a la red, tu comercializadora
                descuenta un precio (0,05-0,10 €/kWh) de tu factura mensual.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Límite de compensación</h3>
              <p className="text-sm text-slate-600">
                La compensación nunca puede superar el coste de la energía consumida en ese periodo
                de facturación. Es decir, puedes reducir la parte de energía de la factura a 0 €,
                pero no obtener un saldo a favor. Los peajes y cargos fijos siempre se pagan.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Precio de compensación</h3>
              <p className="text-sm text-slate-600">
                El precio varía según tu comercializadora. En tarifa PVPC, es el precio medio horario
                del mercado mayorista OMIE. En tarifas libres, cada empresa establece su propio precio
                de compensación (generalmente 0,05-0,10 €/kWh).
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Maximizar el rendimiento</h3>
              <p className="text-sm text-slate-600">
                Para maximizar el beneficio, es preferible autoconsumir la mayor parte de la producción
                (0,15-0,25 €/kWh ahorrado) en lugar de vertirla (0,05-0,10 €/kWh compensado).
                Una batería ayuda a reducir los excedentes y aumentar el ahorro neto.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Preguntas frecuentes sobre excedentes solares</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Cuánto pagan por mis excedentes solares?",
                a: "El precio de compensación varía entre 0,05 y 0,10 €/kWh según la comercializadora y el mercado. En tarifa PVPC se aplica el precio medio horario OMIE. En tarifa libre, cada empresa fija su precio.",
              },
              {
                q: "¿Puedo ganar dinero vendiendo excedentes?",
                a: "Con compensación simplificada, puedes reducir la parte de energía de tu factura hasta 0 €, pero no generar saldo a favor. Para vender excedentes con beneficio neto, necesitas inscribirte como productor de energía (compensación no simplificada).",
              },
              {
                q: "¿Cuánta energía sobrante genera una instalación típica?",
                a: "Una instalación residencial de 3 kWp genera unos 4.000 kWh/año. Con un autoconsumo del 60%, los excedentes son ~1.600 kWh/año. A 0,07 €/kWh, eso supone ~112 €/año en compensación.",
              },
              {
                q: "¿Cómo se refleja la compensación en mi factura?",
                a: "Tu factura mostrará dos conceptos: la energía consumida de la red (coste) y la energía excedentaria vertida (descuento). El descuento se resta del coste de la energía, nunca de los peajes ni del término fijo de potencia.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-bold text-slate-800 hover:text-teal-700 transition-colors">
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
            <Link href="/calculadoras/financiacion" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">F</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">Financiación Solar</p>
                <p className="text-xs text-slate-500">Simula cuotas y rentabilidad</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400">
          <p>Cálculos orientativos basados en precios de compensación medios del mercado OMIE. El importe final dependerá de tu comercializadora y el periodo de facturación.</p>
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
              { "@type": "Question", name: "¿Cuánto pagan por mis excedentes solares?", acceptedAnswer: { "@type": "Answer", text: "El precio varía entre 0,05 y 0,10 €/kWh. En PVPC se aplica el precio OMIE. En tarifa libre, cada empresa fija su propio precio de compensación." } },
              { "@type": "Question", name: "¿Puedo ganar dinero vendiendo excedentes?", acceptedAnswer: { "@type": "Answer", text: "Con compensación simplificada puedes reducir la factura de energía a 0 € pero no generar saldo a favor. Para vender con beneficio neto necesitas inscribirte como productor." } },
              { "@type": "Question", name: "¿Cuánta energía sobrante genera una instalación típica?", acceptedAnswer: { "@type": "Answer", text: "Una instalación de 3 kWp con 60% autoconsumo genera ~1.600 kWh/año de excedentes, equivalentes a ~112 €/año en compensación." } },
              { "@type": "Question", name: "¿Cómo se refleja la compensación en mi factura?", acceptedAnswer: { "@type": "Answer", text: "La factura muestra energía consumida (coste) y excedentaria vertida (descuento). El descuento se resta del coste de energía, no de peajes ni término fijo." } },
            ],
          }),
        }}
      />
    </main>
  );
}
