import { type MunicipioPageData } from "@/lib/data/types";

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
      Las instalaciones en <strong>{municipio}</strong> pueden beneficiarse de importantes deducciones locales. La ordenanza fiscal vigente contempla una bonificación del <strong>{ibiDisplay}%</strong> en el Impuesto sobre Bienes Inmuebles, permitiendo reducir significativamente el coste fijo de tu vivienda mientras recuperas la inversión solar.
    </>,
    <>
      El ayuntamiento de <strong>{municipio}</strong> fomenta el autoconsumo mediante incentivos directos. Actualmente, los propietarios pueden solicitar hasta un <strong>{ibiDisplay}%</strong> de descuento en el IBI. Este beneficio fiscal es clave para acortar el periodo de retorno de tus placas solares en {provincia}.
    </>,
    <>
      Si resides en <strong>{municipio}</strong>, tu transición a la energía limpia tiene premio fiscal. Las normativas municipales recogen una bonificación de hasta el <strong>{ibiDisplay}%</strong> en el recibo del IBI para viviendas con paneles fotovoltaicos, una de las ayudas más robustas disponibles en la zona de {provincia}.
    </>,
    <>
      En <strong>{municipio}</strong>, instalar paneles solares da acceso a una reducción del <strong>{ibiDisplay}%</strong> en el IBI durante los primeros años. Esta ayuda municipal directa, combinada con las deducciones estatales, acelera la amortización de la instalación fotovoltaica.
    </>,
    <>
      Los vecinos de <strong>{municipio}</strong> que apuesten por el autoconsumo fotovoltaico cuentan con una ventaja fiscal directa: hasta un <strong>{ibiDisplay}%</strong> de rebaja en el recibo del IBI, según la ordenanza fiscal del municipio en {provincia}.
    </>,
  ];

  // --- Variations for IRPF Section ---
  const irpfVariations = [
    <>
      A nivel estatal, puedes deducir entre el <strong>20% y el 60%</strong> del coste de la instalación en tu próxima declaración de la Renta. Esta deducción por mejora de eficiencia energética es totalmente compatible con las ayudas locales de {municipio}, maximizando tu ahorro fiscal anual.
    </>,
    <>
      La inversión en paneles solares en <strong>{municipio}</strong> desgrava. Gracias a los incentivos estatales por rehabilitación energética, es posible recuperar hasta un <strong>40%</strong> de la factura de instalación a través del IRPF, un impulso directo para los hogares que apuestan por la sostenibilidad.
    </>,
    <>
      No olvides incluir tu instalación solar de {municipio} en el próximo ejercicio fiscal. Las deducciones en el IRPF por eficiencia energética permiten desgravar una parte sustancial de la inversión, reduciendo el precio final de tus placas solares de forma inmediata.
    </>,
    <>
      La Agencia Tributaria permite deducir en el IRPF entre el <strong>20% y el 60%</strong> de lo invertido en placas solares en <strong>{municipio}</strong>. Para una instalación de 5 000 €, esto puede suponer una devolución de hasta 3 000 € en tu próxima declaración.
    </>,
    <>
      Cada euro invertido en autoconsumo fotovoltaico en {municipio} tiene retorno fiscal: las deducciones estatales de hasta el <strong>60%</strong> por mejora de certificación energética se aplican directamente en la declaración de la Renta, acelerando la recuperación de la inversión.
    </>,
  ];

  const selectedIbi = ibiVariations[hash % ibiVariations.length];
  const selectedIrpf = irpfVariations[(hash + 1) % irpfVariations.length];

  return (
    <>
      {/* ── ALERTA DE IBI DESTACADA ── */}
      {ibiValue != null && ibiValue > 0 && (
        <div className="bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 overflow-hidden mb-6 mt-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          
          <div className="relative z-10 px-6 py-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white text-emerald-600 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🎉
              </div>
              <div>
                <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mb-1">
                  Subvención Local Confirmada
                </p>
                <h3 className="text-white text-xl md:text-2xl font-black leading-tight">
                  ¡El Ayuntamiento te descuenta un <span className="text-yellow-300">{ibiValue}% del IBI</span>!
                </h3>
              </div>
            </div>
            <a href="#lead-form" className="shrink-0 bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:scale-105 active:scale-95 transition-all">
              Aprovechar Reembolso
            </a>
          </div>
        </div>
      )}

      {/* ── BLOQUE DE SUBVENCIONES GENERAL ── */}
      <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${(!ibiValue || ibiValue === 0) ? "mt-8" : ""} transition-shadow hover:shadow-md`}>
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {[
              `Ayudas y subvenciones para placas solares en ${municipio}`,
              `Incentivos fiscales para autoconsumo solar en ${municipio}`,
              `Bonificaciones y deducciones por instalar paneles en ${municipio}`,
              `Subvenciones activas para energía fotovoltaica en ${municipio}`,
              `Ayudas públicas al autoconsumo en ${municipio} (${provincia})`,
            ][hash % 5]}
          </h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* IBI Box */}
            <div className="bg-emerald-50/80 rounded-xl p-5 border border-emerald-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-inner">
                  %
                </div>
                <h3 className="font-bold text-emerald-900 tracking-tight">Bonificación del IBI</h3>
              </div>
              <p className="text-emerald-700/90 text-sm leading-relaxed relative z-10">
                {selectedIbi}
              </p>
            </div>

            {/* IRPF Box */}
            <div className="bg-blue-50/80 rounded-xl p-5 border border-blue-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                  📄
                </div>
                <h3 className="font-bold text-blue-900 tracking-tight">Deducción en IRPF</h3>
              </div>
              <p className="text-blue-700/90 text-sm leading-relaxed relative z-10">
                {selectedIrpf}
              </p>
            </div>
          </div>

          <div className="mt-5 text-center space-y-4">
            <a
              href={`/subvenciones-solares/${comunidadSlug}/${provinciaSlug}/${slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              Ver todas las subvenciones oficiales en {municipio}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
            <p className="block text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-md py-2 px-4 shadow-sm inline-block">
              Consulta siempre al ayuntamiento de {municipio} para confirmar la vigencia anual de estas ayudas.
            </p>
            {nearby && (
              <p className="block text-[10px] text-slate-400">
                Al igual que ocurre en localidades próximas como{" "}
                <a
                  href={`/placas-solares/${nearby.slug}`}
                  className="text-blue-500 hover:underline font-medium"
                >
                  {nearby.municipio}
                </a>
                , la normativa regional en {provincia} favorece la adopción masiva del autoconsumo.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
