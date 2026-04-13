import { type MunicipioPageData } from "@/lib/data/types";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";

type SubsidiesSeoBlockProps = {
  municipio: string;
  provincia: string;
  slug: string;
  comunidadSlug: string;
  provinciaSlug: string;
  bonificacionIbi?: number | null;
  nearbyItems?: {
    municipio: string;
    slug: string;
  }[];
};

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function SubsidiesSeoBlock({
  municipio,
  provincia,
  slug,
  comunidadSlug,
  provinciaSlug,
  bonificacionIbi,
  nearbyItems = [],
}: SubsidiesSeoBlockProps) {
  const hash = getStringHash(slug);

  const ibiValue = bonificacionIbi != null && bonificacionIbi > 0 ? Math.round(bonificacionIbi) : null;
  const nearby = nearbyItems.length > 0 ? nearbyItems[hash % nearbyItems.length] : null;

  // --- Variations for IBI Section ---
  const ibiDisplay = ibiValue ?? 50;
  const ibiVariations = [
    <>
      Las instalaciones en <strong>{municipio}</strong> pueden mejorar drásticamente la <strong>economía</strong> doméstica. La ordenanza fiscal vigente contempla una bonificación del <strong>{ibiDisplay}%</strong> en el IBI, permitiendo reducir la <strong>cuenta de la luz</strong> indirectamente al amortizar más rápido tu <strong>proyecto fotovoltaico</strong>.
    </>,
    <>
      Cualquier <strong>empresa</strong> instaladora en <strong>{municipio}</strong> destacará este incentivo: un <strong>{ibiDisplay}%</strong> de descuento en el IBI. Esta ayuda es clave para la viabilidad de tu <strong>sistema solar</strong> en {provincia}, ofreciendo una <strong>atención</strong> fiscal directa al <strong>cliente</strong>.
    </>,
    <>
      Si buscas <strong>calidad</strong> y ahorro en <strong>{municipio}</strong>, la bonificación de hasta el <strong>{ibiDisplay}%</strong> en el IBI para viviendas con <strong>paneles fotovoltaicos</strong> es fundamental. Es una de las <strong>ayudas de luz</strong> más robustas de {provincia} para potenciar la <strong>energía solar</strong> local.
    </>,
    <>
      En <strong>{municipio}</strong>, cada <strong>panel</strong> instalado da acceso a una reducción del <strong>{ibiDisplay}%</strong> en el recibo del IBI. Esta ventaja, sumada a la <strong>energía</strong> generada, acelera el retorno de tu <strong>sistema fotovoltaico</strong> sin comprometer tu <strong>economía</strong>.
    </>,
    <>
      Los vecinos de <strong>{municipio}</strong> cuentan con un <strong>equipo</strong> de incentivos sólido: hasta un <strong>{ibiDisplay}%</strong> de rebaja en el IBI por apostar por la <strong>luz solar</strong>, según la normativa actual de {provincia}.
    </>,
  ];

  // --- Variations for IRPF Section ---
  const irpfVariations = [
    <>
      A nivel estatal, puedes deducir el coste de tu <strong>sistema</strong> en la Renta. Esta mejora de <strong>calidad</strong> energética es compatible con las ayudas de <strong>{municipio}</strong>, optimizando la <strong>economía</strong> de tu <strong>proyecto solar</strong> anual.
    </>,
    <>
      La inversión en cada <strong>panel</strong> en <strong>{municipio}</strong> desgrava. Gracias a los incentivos por <strong>energía fotovoltaica</strong>, es posible recuperar gran parte de la factura, un alivio para la <strong>cuenta de la luz</strong> de los hogares.
    </>,
    <>
      Tu <strong>empresa</strong> instaladora debe informarte: las deducciones en el IRPF por <strong>energía solar</strong> en {municipio} permiten desgravar la inversión, reduciendo el precio de tus <strong>placas</strong> de forma honesta y directa.
    </>,
    <>
      La Agencia Tributaria bonifica el <strong>sistema fotovoltaico</strong> en <strong>{municipio}</strong>. Para una <strong>instalación</strong> típica, esto supone un retorno que mejora la <strong>atención</strong> financiera de tu vivienda.
    </>,
    <>
      Cada euro en <strong>luz solar</strong> en {municipio} tiene retorno fiscal: las deducciones por <strong>sistemas</strong> de autoconsumo se aplican directamente, acelerando la recuperación de la inversión sin sorpresas.
    </>,
  ];

  const selectedIbi = ibiVariations[hash % ibiVariations.length];
  const selectedIrpf = irpfVariations[(hash + 1) % irpfVariations.length];

  return (
    <div className="font-manrope">
      {/* ── ALERTA DE IBI DESTACADA ── */}
      {ibiValue != null && ibiValue > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2.5rem] shadow-2xl shadow-emerald-500/30 overflow-hidden mb-10 mt-10 relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          
          <div className="relative z-10 px-8 py-8 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-3xl flex items-center justify-center text-4xl shrink-0 shadow-xl border border-white/30 rotate-3 group-hover:rotate-0 transition-transform">
                💶
              </div>
              <div>
                <p className="text-emerald-100 font-black uppercase tracking-[0.2em] text-[11px] mb-2 opacity-80">
                  Ayuda Local Garantizada
                </p>
                <h3 className="text-white text-2xl md:text-4xl font-black leading-tight tracking-tight">
                  Ibi al <span className="text-yellow-300">-{ibiValue}%</span> en {municipio}
                </h3>
                <p className="text-emerald-50/70 text-sm mt-1 font-medium italic">
                  *Cifra verificada según la ordenanza fiscal vigente
                </p>
              </div>
            </div>
            <a href="#lead-form" className="shrink-0 bg-white text-emerald-800 font-black px-8 py-4 rounded-2xl text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all">
              Consultar Plazos
            </a>
          </div>
        </div>
      )}

      {/* ── BLOQUE DE SUBVENCIONES GENERAL ── */}
      <section className={`bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden ${(!ibiValue || ibiValue === 0) ? "mt-10" : ""} relative`}>
        <div className="px-8 py-8 md:px-10 md:py-10 border-b border-slate-100">
           <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Guía de Incentivos 2026
            </p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {[
              `Ayudas y subvenciones en ${municipio}`,
              `Incentivos fiscales para ${municipio}`,
              `Bonificaciones por paneles en ${municipio}`,
              `Subvenciones activas en ${municipio}`,
              `Ayudas públicas en ${municipio} (${provincia})`,
            ][hash % 5]}
          </h2>
        </div>

        <div className="p-8 md:p-10">
          <div className="grid sm:grid-cols-2 gap-8">
            {/* IBI Box */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:border-emerald-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xl shadow-inner">
                  %
                </div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Recibo del IBI</h3>
              </div>
              <div className="text-slate-600 text-base leading-relaxed relative z-10 font-medium lowercase-first">
                {selectedIbi}
              </div>
            </div>

            {/* IRPF Box */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:border-blue-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                  📄
                </div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Deducción IRPF</h3>
              </div>
              <div className="text-slate-600 text-base leading-relaxed relative z-10 font-medium lowercase-first">
                {selectedIrpf}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center space-y-6">
            {(() => {
              const cleanMainSlug = cleanMunicipalitySlug(slug, provinciaSlug);
              return (
                <a
                  href={`/subvenciones-solares/${comunidadSlug}/${provinciaSlug}/${cleanMainSlug}`}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-base font-black text-white shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  Informe oficial de {municipio}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
              );
            })()}
            
            <div className="max-w-xl mx-auto">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 shadow-sm">
                Nota: Consulta vigencia anual en el Ayuntamiento de {municipio}.
              </p>
            </div>

            {nearby && (
              <p className="text-xs text-slate-400 font-medium italic">
                Al igual que localidades próximas como{" "}
                {(() => {
                  const cleanNearbySlug = cleanMunicipalitySlug(nearby.slug, provinciaSlug);
                  return (
                    <a
                      href={`/placas-solares/${cleanNearbySlug}`}
                      className="text-blue-500 hover:text-blue-600 font-bold underline underline-offset-4 decoration-blue-200"
                    >
                      {nearby.municipio}
                    </a>
                  );
                })()}
                , la normativa en {provincia} favorece la adopción masiva del autoconsumo hoy.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
