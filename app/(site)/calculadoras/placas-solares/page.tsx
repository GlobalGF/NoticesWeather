import { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { CalculadoraSolarCompleta } from "@/components/ui/CalculadoraSolarCompleta";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";

export const metadata: Metadata = buildMetadata({
  title: "Instala Placas Solares — Calcula tu Ahorro y Amortización",
  description:
    "Calcula cuántos paneles solares necesitas, el ahorro anual y los años de amortización. Genera tu propia energía 100% verde con nuestro proceso sencillo.",
  pathname: "/calculadoras/placas-solares",
});

export default function CalculadoraPlacasSolaresPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Placas solares</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-amber-300 font-bold tracking-widest uppercase text-[10px]">Simulador profesional</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Instala Placas Solares y{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Genera tu propia Energía
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Genera tu propia energía 100% verde desde tu tejado. Calcula cuántos paneles necesitas, cuánto ahorras y en cuántos años recuperas la inversión.
          </p>

          <div className="max-w-xl mx-auto">
            <LocationSearchBar 
              baseRoute="/calculadoras/placas-solares" 
              placeholder="Busca tu ciudad para un estudio local..."
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-16 -mt-6 relative z-20 pb-24">
        {/* Calculator */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
          <CalculadoraSolarCompleta />
        </section>

        {/* SEO: Methodology */}
        <section className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">¿Cómo funciona la calculadora de paneles solares?</h2>
          <p>
            Nuestro simulador utiliza las fórmulas estándar del sector fotovoltaico para dimensionar
            tu instalación solar de forma personalizada. Realizamos un estudio gratuito de viabilidad basado en:
          </p>
          <div className="grid md:grid-cols-2 gap-6 not-prose mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-blue-800 mb-2">Producción solar estimada</h3>
              <p className="text-sm text-blue-700 mb-2">
                En la Península Ibérica, cada kWp instalado genera entre 1.200 y 1.700 kWh al año,
                dependiendo de la ubicación geográfica y la orientación del tejado.
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-blue-900">
                Producción anual = kWp × irradiancia × 0,78
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-amber-800 mb-2">Dimensionamiento del sistema</h3>
              <p className="text-sm text-amber-700 mb-2">
                El tamaño óptimo depende de tu consumo eléctrico anual dividido entre la producción
                esperada por kWp en tu zona.
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-amber-900">
                kWp necesarios = consumo anual / (irradiancia × 0,78)
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-emerald-800 mb-2">Cálculo del ahorro</h3>
              <p className="text-sm text-emerald-700 mb-2">
                El ahorro combina el autoconsumo directo (energía que no compras a la red) más la
                compensación de excedentes vertidos (~0,06 €/kWh).
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-emerald-900">
                Ahorro = (kWh × ratio × precio) + excedentes × 0,06
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-purple-800 mb-2">Retorno de inversión (ROI)</h3>
              <p className="text-sm text-purple-700 mb-2">
                La amortización se calcula dividiendo el coste total de la instalación entre el
                ahorro anual. En España el retorno medio es de 5-8 años.
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-purple-900">
                Amortización = coste instalación / ahorro anual
              </div>
            </div>
          </div>
        </section>

        {/* Un proceso sencillo */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Un proceso sencillo para tu instalación solar</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Estudio gratuito", desc: "Simulamos tu ahorro con datos reales de irradiación." },
              { step: "02", title: "Viabilidad", desc: "Un experto revisa tu tejado y optimiza el diseño." },
              { step: "03", title: "Trámites", desc: "Gestionamos toda la documentación administrativa." },
              { step: "04", title: "Instalación", desc: "Manos a la obra: instaladores certificados en 24-48h." },
              { step: "05", title: "Puesta en marcha", desc: "Empieza a generar tu propia energía verde." }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <span className="text-4xl font-black text-slate-100 absolute -top-2 -right-2 group-hover:text-blue-50 transition-colors">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios - Confianza */}
        <section className="bg-slate-900 rounded-[2rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-10 tracking-tight">¿Por qué confiar en nuestra plataforma?</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Garantía total</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Instalaciones con garantías de hasta 25 años en paneles y 10 años en mano de obra.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Máxima eficiencia</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Utilizamos componentes de primera línea para maximizar el rendimiento de tu tejado.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500/30 transition-colors border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Estética Premium</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Paneles Full Black que se integran perfectamente en la estética de tu hogar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO: Data & Assumptions */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Datos y supuestos del cálculo</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 pr-4 font-bold text-slate-700">Parámetro</th>
                  <th className="py-3 pr-4 font-bold text-slate-700">Valor</th>
                  <th className="py-3 font-bold text-slate-700">Fuente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="py-2.5 pr-4 text-slate-600">Irradiancia base</td><td className="py-2.5 pr-4 font-medium">1.700 kWh/m²/año</td><td className="py-2.5 text-slate-400">PVGIS (JRC)</td></tr>
                <tr><td className="py-2.5 pr-4 text-slate-600">Performance ratio</td><td className="py-2.5 pr-4 font-medium">0,78 (78%)</td><td className="py-2.5 text-slate-400">IEC 61724</td></tr>
                <tr><td className="py-2.5 pr-4 text-slate-600">Potencia panel</td><td className="py-2.5 pr-4 font-medium">440 W</td><td className="py-2.5 text-slate-400">Media mercado 2024-2025</td></tr>
                <tr><td className="py-2.5 pr-4 text-slate-600">Coste por kWp</td><td className="py-2.5 pr-4 font-medium">~1.500 €/kWp</td><td className="py-2.5 text-slate-400">Rango 1.200-1.800 €</td></tr>
                <tr><td className="py-2.5 pr-4 text-slate-600">Compensación excedentes</td><td className="py-2.5 pr-4 font-medium">0,06 €/kWh</td><td className="py-2.5 text-slate-400">RD 244/2019</td></tr>
                <tr><td className="py-2.5 pr-4 text-slate-600">Vida útil paneles</td><td className="py-2.5 pr-4 font-medium">25 años</td><td className="py-2.5 text-slate-400">Garantía fabricante</td></tr>
              </tbody>
            </table>
          </div>
        </section>


        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Cuántos paneles solares necesito para mi casa?",
                a: "Depende de tu consumo eléctrico. Una vivienda media en España consume unos 3.500 kWh/año (290 kWh/mes), lo que requiere aproximadamente 6-8 paneles de 440W (2,6-3,5 kWp). Introduce tu consumo en la calculadora para obtener un resultado preciso.",
              },
              {
                q: "¿Cuánto cuesta una instalación de placas solares?",
                a: "El coste medio en España es de 1.200-1.800 €/kWp instalado (IVA incluido). Para una vivienda estándar de 3 kWp, el precio oscila entre 3.600 y 5.400 €. Este coste se amortiza en 5-8 años gracias al ahorro en la factura eléctrica.",
              },
              {
                q: "¿Cuánto ahorro con placas solares al año?",
                a: "Con un sistema de 3 kWp y un 60% de autoconsumo, el ahorro típico es de 500-900 €/año. Con batería, el autoconsumo sube al 70-90% y el ahorro puede superar los 1.000 €/año. A lo largo de 25 años de vida útil, el ahorro acumulado supera los 15.000 €.",
              },
              {
                q: "¿En cuántos años se amortizan los paneles solares?",
                a: "El período medio de amortización en España es de 5-8 años, dependiendo de la irradiación de tu zona, tu consumo y el precio de la electricidad. Tras la amortización, la energía producida es prácticamente gratuita durante los 17-20 años restantes de vida útil.",
              },
              {
                q: "¿Qué porcentaje de autoconsumo puedo alcanzar?",
                a: "Sin batería, el autoconsumo típico es del 50-60%. Significa que consumes directamente la mitad de lo que produces. Con una batería de 5-10 kWh, puedes aumentar el autoconsumo al 70-90%, almacenando el excedente diurno para las noches.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-bold text-slate-800 hover:text-blue-700 transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Related Calculators */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Otras calculadoras solares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <p>Los cálculos son orientativos. El resultado final dependerá de un estudio técnico profesional que considere la orientación, inclinación, sombras y estado del tejado.</p>
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
              {
                "@type": "Question",
                name: "¿Cuántos paneles solares necesito para mi casa?",
                acceptedAnswer: { "@type": "Answer", text: "Depende de tu consumo eléctrico. Una vivienda media en España consume unos 3.500 kWh/año (290 kWh/mes), lo que requiere aproximadamente 6-8 paneles de 440W (2,6-3,5 kWp)." },
              },
              {
                "@type": "Question",
                name: "¿Cuánto cuesta una instalación de placas solares?",
                acceptedAnswer: { "@type": "Answer", text: "El coste medio en España es de 1.200-1.800 €/kWp instalado. Para una vivienda estándar de 3 kWp, el precio oscila entre 3.600 y 5.400 €. Se amortiza en 5-8 años." },
              },
              {
                "@type": "Question",
                name: "¿Cuánto ahorro con placas solares al año?",
                acceptedAnswer: { "@type": "Answer", text: "Con un sistema de 3 kWp y un 60% de autoconsumo, el ahorro típico es de 500-900 €/año. Con batería puede superar los 1.000 €/año. En 25 años, el ahorro acumulado supera los 15.000 €." },
              },
              {
                "@type": "Question",
                name: "¿En cuántos años se amortizan los paneles solares?",
                acceptedAnswer: { "@type": "Answer", text: "El período medio de amortización en España es de 5-8 años. Tras la amortización, la energía es prácticamente gratuita durante los 17-20 años restantes de vida útil." },
              },
              {
                "@type": "Question",
                name: "¿Qué porcentaje de autoconsumo puedo alcanzar?",
                acceptedAnswer: { "@type": "Answer", text: "Sin batería, el autoconsumo típico es del 50-60%. Con una batería de 5-10 kWh, puedes aumentar al 70-90%." },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
