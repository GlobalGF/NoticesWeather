import { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";

export const metadata: Metadata = buildMetadata({
  title: "Instala Baterías Solares — Calcula tu Capacidad y Autonomía",
  description:
    "Calcula la capacidad de batería que necesitas para maximizar el autoconsumo solar. Genera tu propia energía 100% verde con independencia energética total.",
  pathname: "/calculadoras/baterias",
});

export default function CalculadoraBateriasPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-slate-900 pb-14 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li className="select-none">/</li>
            <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Baterías</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <p className="text-fuchsia-300 font-bold tracking-widest uppercase text-[10px]">Dimensionador técnico</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Instala Baterías y{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              Logra tu Independencia
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Maximiza tu ahorro almacenando los excedentes de tus paneles solares. Calcula cuántas baterías necesitas e impulsa tu independencia energética.
          </p>

          <div className="max-w-xl mx-auto">
            <LocationSearchBar 
              baseRoute="/calculadoras/baterias" 
              placeholder="Busca tu ciudad para un estudio de baterías..."
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-16 -mt-6 relative z-20 pb-24">
        {/* Calculator */}
        <section>
          <BatteryNeedsCalculator municipio="España" annualSunHours={2500} />
        </section>

        {/* SEO: How it works */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">¿Cómo dimensionar una batería solar?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-fuchsia-800 mb-2">Consumo nocturno</h3>
              <p className="text-sm text-fuchsia-700 mb-2">
                La batería debe cubrir las horas sin sol (generalmente de 20:00 a 08:00). En una
                vivienda con tarifa 2.0TD, el consumo nocturno representa un 40-60% del total.
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-fuchsia-900">
                Capacidad = consumo nocturno diario / 0,9 (eficiencia)
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Excedentes solares</h3>
              <p className="text-sm text-slate-600 mb-2">
                La batería almacena la energía que tus paneles producen pero no consumes durante
                el día. Sin batería, esos excedentes se vierten a la red a solo ~0,06 €/kWh.
              </p>
              <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-slate-700">
                Excedente = producción diaria − consumo diurno
              </div>
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Un proceso sencillo para tu autonomía</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Dimensionado", desc: "Calculamos los módulos exactos según tus consumos nocturnos." },
              { step: "02", title: "Viabilidad Técnica", desc: "Revisamos tu inversor actual para asegurar la compatibilidad." },
              { step: "03", title: "Instalación", desc: "Montaje rápido y configuración del sistema de gestión." },
              { step: "04", title: "Ahorro al 100%", desc: "Comienza a disfrutar de tu energía solar las 24 horas." }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-fuchsia-300 transition-colors">
                <span className="text-4xl font-black text-slate-100 absolute -top-2 -right-2 group-hover:text-fuchsia-50 transition-colors">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios - Confianza */}
        <section className="bg-slate-900 rounded-[2rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-10 tracking-tight">¿Por qué confiar en nuestra plataforma?</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Garantía total</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Instalaciones con garantías de hasta 25 años en paneles y 10 años en mano de obra.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Máxima eficiencia</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Nuestros colaboradores utilizan componentes de primera línea para maximizar el rendimiento de tu tejado.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500/30 transition-colors border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Estética Premium</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-pretty">Baterías y paneles Full Black que se integran perfectamente en la estética de tu hogar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Preguntas frecuentes sobre baterías solares</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Cuántos kWh de batería necesito?",
                a: "Para una vivienda media (300-400 kWh/mes), se recomienda una batería de 5-10 kWh. Con 5 kWh cubres las necesidades básicas nocturnas; con 10 kWh alcanzas una autonomía casi completa.",
              },
              {
                q: "¿Cuánto cuesta una batería solar?",
                a: "Una batería LFP de 5 kWh cuesta entre 3.000 y 4.500 € instalada. Las de 10 kWh oscilan entre 5.500 y 8.000 €. La inversión se amortiza en 8-12 años gracias al ahorro adicional frente a la compensación de excedentes.",
              },
              {
                q: "¿Merece la pena instalar batería solar?",
                a: "Si tu autoconsumo sin batería es inferior al 60%, sí. La batería te permite almacenar excedentes diurnos (que solo cobras a 0,06 €/kWh) y usarlos por la noche (cuando pagarías 0,15-0,25 €/kWh). El diferencial de precio justifica la inversión.",
              },
              {
                q: "¿Cuánto dura una batería solar?",
                a: "Las baterías LFP (litio-ferrofosfato) duran más de 6.000 ciclos, equivalentes a 15-20 años de uso doméstico. Las NMC ofrecen unos 3.000 ciclos (8-12 años). La mayoría de fabricantes garantizan 10 años.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-bold text-slate-800 hover:text-fuchsia-700 transition-colors">
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
          <p>Cálculos orientativos basados en módulos de 5 kWh LFP. La capacidad final dependerá de un estudio técnico que analice tus patrones de consumo reales.</p>
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
              { "@type": "Question", name: "¿Cuántos kWh de batería necesito?", acceptedAnswer: { "@type": "Answer", text: "Para una vivienda media (300-400 kWh/mes), se recomienda una batería de 5-10 kWh." } },
              { "@type": "Question", name: "¿Cuánto cuesta una batería solar?", acceptedAnswer: { "@type": "Answer", text: "Una batería LFP de 5 kWh cuesta entre 3.000 y 4.500 € instalada. Las de 10 kWh oscilan entre 5.500 y 8.000 €." } },
              { "@type": "Question", name: "¿Merece la pena instalar batería solar?", acceptedAnswer: { "@type": "Answer", text: "Si tu autoconsumo sin batería es inferior al 60%, sí. La batería almacena excedentes a 0,06 €/kWh y los usa por la noche cuando pagarías 0,15-0,25 €/kWh." } },
              { "@type": "Question", name: "¿Cuánto dura una batería solar?", acceptedAnswer: { "@type": "Answer", text: "Las baterías LFP duran más de 6.000 ciclos (15-20 años). Las NMC ofrecen unos 3.000 ciclos (8-12 años). Garantía de 10 años." } },
            ],
          }),
        }}
      />
    </main>
  );
}
