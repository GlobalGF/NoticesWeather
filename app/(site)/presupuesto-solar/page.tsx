import { LeadCaptureForm } from "@/components/ui/LeadCaptureForm";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const metadata = buildMetadata({
  title: "Presupuesto de Placas Solares | Compara Instaladores en tu Zona",
  description: "Solicita hasta 3 presupuestos gratuitos de empresas instaladoras de placas solares verificadas. Ahorra en tu instalación fotovoltaica con SolaryEco.",
  pathname: "/presupuesto-solar",
});

export default function PresupuestoSolarPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Consigue 3 Presupuestos <br className="hidden md:block" /> de Instaladores Verificados
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analizamos tu caso y te conectamos con las mejores <strong>empresas de placas solares</strong> en tu provincia. Ahorra tiempo y dinero comparando ofertas reales.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-8">Solicita tu Presupuesto de Instalación Fotovoltaica</h2>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-2">
            <LeadCaptureForm municipio="España" />
          </div>

          {/* Trust Side */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="text-blue-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Garantía SolaryEco
                </h3>
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <svg className="text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <p className="text-sm text-slate-600"><strong>Instaladores certificados:</strong> Solo empresas con REBT y experiencia demostrable.</p>
                    </li>
                    <li className="flex gap-3">
                        <svg className="text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <p className="text-sm text-slate-600"><strong>Sin compromiso:</strong> El estudio es 100% gratuito. Tú decides si contratas.</p>
                    </li>
                    <li className="flex gap-3">
                        <svg className="text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <p className="text-sm text-slate-600"><strong>Privacidad total:</strong> Tus datos solo se comparten con los instaladores seleccionados.</p>
                    </li>
                </ul>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-2">Dato de Interés</p>
                <h4 className="text-lg font-bold mb-3">¿Por qué comparar?</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                    Comparar al menos 3 presupuestos suele reducir el coste final de la instalación en un <strong>15-20%</strong>. Además, permite evaluar diferentes marcas de paneles (Tier 1) e inversores (Huawei, Fronius, SMA).
                </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
