import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros — El Proyecto SolaryEco",
  description: "Conoce a SolaryEco, el portal independiente líder en España para el cálculo de rendimiento, precios y ahorro en energía solar fotovoltaica.",
};

export default function SobreNosotrosPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      
      {/* ── Hero Section ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            <p className="text-blue-200 font-bold tracking-widest uppercase text-[10px]">Transparencia Energética</p>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Nuestra Misión: <br className="hidden md:block" /> Democratizar la Energía Solar
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
            En SolaryEco construimos la tecnología y visualización de datos necesarias para que cualquier ciudadano
            comprenda el coste real de la luz y el potencial fotovoltaico en España.
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-3xl px-4 py-16 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 prose prose-slate prose-lg max-w-none">
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Por qué nace SolaryEco?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            El sector de la energía solar en España ha crecido a un ritmo vertiginoso, pero también lo ha hecho 
            la complejidad de la información, las variables de precios del mercado eléctrico regulado (PVPC) y los esquemas
            de subvenciones municipales y autonómicas (IBI, ICIO, ayudas directas).
          </p>
          <p className="text-slate-600 leading-relaxed font-semibold mb-10">
            Nacimos con un único propósito: <span font-bold>Ofrecer total transparencia de datos.</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0 mb-2">Datos Oficiales</h3>
              <p className="text-sm text-slate-600 m-0">
                Cruzamos información de Red Eléctrica de España (REE), los mapas solares PVGIS de la Comisión Europea 
                y el BOE para que los cálculos no tengan sesgos.
              </p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0 mb-2">Cálculos Honestos</h3>
              <p className="text-sm text-slate-700 m-0">
                Los algoritmos de nuestras calculadoras muestran el rendimiento solar conservador, proyectando el periodo real
                de amortización (ROI) sin engaños comerciales.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Nuestra Tecnología (E-E-A-T)</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            A diferencia de los portales de marketing puro, SolaryEco es una herramienta <span font-bold>tecnológica de consulta ciudadana</span>.
            Hemos procesado las coordenadas de más de 8.000 municipios en la península para proyectar:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
            <li>Producción mensual estimada de kilovatios según los ciclos de irradiación locales.</li>
            <li>Costes de oportunidad al no tener compensación de excedentes (batería vs vertido a red).</li>
            <li>Tracking en vivo de la Tarifa PVPC para tomar micro-decisiones de gasto doméstico.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Contacto Institucional / Legal</h2>
          <p className="text-slate-600 leading-relaxed p-6 bg-slate-900 text-white rounded-2xl shadow-inner mt-6">
            Para cuestiones relacionadas con el tratamiento de bases de datos, homologación de instaladores para integrarse
            en nuestro directorio, prensa o quejas formales:
            <br /><br />
            <span font-bold>Compañía:</span> SolaryEco<br/>
            <span font-bold>Responsable de Contacto:</span> <a href="mailto:contact@globalgrowthframework.dev" className="text-blue-300 hover:text-white underline">contact@globalgrowthframework.dev</a><br/>
            <span font-bold>Domicilio Social:</span> España (En constitución)<br />
          </p>

        </div>
      </div>
    </main>
  );
}
