import { type MunicipioPageData } from "@/lib/data/types";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";
import { generateDynamicText } from "@/lib/pseo/spintax";
import { parseMarkdown } from "@/lib/utils/text";

type SubsidiesSeoBlockProps = {
  municipio: string;
  provincia: string;
  slug: string;
  comunidadSlug: string;
  provinciaSlug: string;
  bonificacionIbi?: number | null;
  bonificacionIbiDuracion?: number | null;
  bonificacionIbiCondiciones?: string | null;
  bonificacionIcio?: number | null;
  bonificacionIcioCondiciones?: string | null;
  bonificacionIae?: number | null;
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
  bonificacionIbiDuracion,
  bonificacionIbiCondiciones,
  bonificacionIcio,
  bonificacionIcioCondiciones,
  bonificacionIae,
  nearbyItems = [],
}: SubsidiesSeoBlockProps) {
  const hash = getStringHash(slug);
  const ibiValue = bonificacionIbi != null && bonificacionIbi > 0 ? Math.round(bonificacionIbi) : null;
  const ibiDisplay = String(ibiValue ?? 50);
  const nearby = nearbyItems.length > 0 ? nearbyItems[hash % nearbyItems.length] : null;

  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    IBI: ibiDisplay,
  };

  const ibiSpintax = "{El Ayuntamiento de [MUNICIPIO] ofrece incentivos clave para acelerar la amortización de tu instalación de **placas solares**|Aprovechar las ayudas locales es fundamental para rentabilizar tu **inversión fotovoltaica** en [MUNICIPIO]|Tu instalación fotovoltaica en [MUNICIPIO] puede beneficiarse de recortes fiscales a nivel local}. " +
    "{La ordenanza fiscal actual recoge una bonificación de hasta el **[IBI]%** en el IBI|Esto se traduce en un descuento de hasta el **[IBI]%** en el Impuesto de Bienes Inmuebles|Según el consistorio, percibirás una rebaja de hasta el **[IBI]%** en el recibo del IBI anual}. " +
    "{Esta reducción directa sobre tus impuestos incrementa enormemente los beneficios netos del sistema|De este modo, se acorta significativamente el periodo de amortización frente al ahorro estándar en la luz|Contar con este apoyo municipal mejora la rentabilidad y resalta el compromiso local con la energía renovable}.";

  const irpfSpintax = "{A nivel estatal, puedes aplicar considerables **deducciones del IRPF** en tu próxima Declaración de la Renta|La inversión orientada a mejorar la eficiencia energética en [MUNICIPIO] es compatible con deducciones estatales en el IRPF|Instalar paneles repercute directamente en tu Declaración, pudiendo desgravar una parte del coste inicial}. " +
    "{Con la normativa en vigor, podrías deducirte entre el 20% y el 40% del coste total de la instalación en tu vivienda habitual|Este estímulo fiscal estatal es esencial para consolidar la viabilidad financiera de las instalaciones residenciales|Esta ventaja fiscal busca fomentar activamente la transición ecológica y rebaja de golpe la inversión necesaria}. " +
    "{Para calificar en [PROVINCIA], es preciso disponer del **Certificado de Eficiencia Energética** previo y posterior a la obra|A nivel de trámites en [MUNICIPIO], recomendamos consultar con un instalador acreditado para gestionar la justificación requerida}.";

  const selectedIbi = generateDynamicText(ibiSpintax, `${municipio}-ibi`, vars);
  const selectedIrpf = generateDynamicText(irpfSpintax, `${municipio}-irpf`, vars);

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
                <p className="text-white text-2xl md:text-4xl font-black leading-tight tracking-tight">
                  Ibi al <span className="text-yellow-300">-{ibiValue}%</span> en {municipio}
                </p>
                <p className="text-emerald-50/70 text-sm mt-1 font-medium italic">
                  *Cifra verificada según ordenanza municipal {bonificacionIbiDuracion ? `(${bonificacionIbiDuracion} años)` : ''}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* IBI Box */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:border-emerald-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg shadow-inner">
                  %
                </div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Recibo del IBI</h3>
              </div>
              <div className="text-slate-600 text-sm leading-relaxed relative z-10 font-medium">
                {parseMarkdown(selectedIbi)}
                {bonificacionIbiCondiciones && (
                  <p className="mt-3 text-[11px] text-slate-400 italic leading-tight">
                    * {bonificacionIbiCondiciones}
                  </p>
                )}
              </div>
            </div>

            {/* ICIO / IAE Box */}
            {(bonificacionIcio || bonificacionIae) && (
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:border-amber-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg shadow-inner">
                    🏢
                  </div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">ICIO e IAE</h3>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed relative z-10 font-medium">
                  {bonificacionIcio && (
                    <p className="mb-2">El ayuntamiento aplica una bonificación del **{bonificacionIcio}%** en el ICIO (Impuesto sobre Construcciones).</p>
                  )}
                  {bonificacionIae && (
                    <p>Para empresas, existe una reducción del **{bonificacionIae}%** en el IAE por transicion energética.</p>
                  )}
                  {bonificacionIcioCondiciones && (
                    <p className="mt-3 text-[11px] text-slate-400 italic leading-tight">* {bonificacionIcioCondiciones}</p>
                  )}
                </div>
              </div>
            )}

            {/* IRPF Box */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:border-blue-100 sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-inner">
                  📄
                </div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Deducción IRPF</h3>
              </div>
              <div className="text-slate-600 text-sm leading-relaxed relative z-10 font-medium">
                {parseMarkdown(selectedIrpf)}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center space-y-6">
            {(() => {
              const cleanMainSlug = cleanMunicipalitySlug(slug, provinciaSlug);
              // Avoid redundant triple paths if slugs are identical
              const pathParts = [comunidadSlug, provinciaSlug, cleanMainSlug].filter((p, i, self) => self.indexOf(p) === i);
              const path = pathParts.length > 0 ? pathParts.join('/') : cleanMainSlug;
              
              return (
                <a
                  href={`/subvenciones-solares/${path}`}
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
