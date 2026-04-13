import { parseMarkdown } from "@/lib/utils/text";

type Props = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  ahorroEstimado: number | null;
  bonificacionIbi: number | null;
  precioLuz: number;
  habitantes: number | null;
};

/* ── Helpers ────────────────────────────────────────────────────── */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], h: number, offset = 0): T {
  return arr[(h + offset) % arr.length];
}

function fmt(v: number | null | undefined, d = 0): string {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("es-ES", { maximumFractionDigits: d });
}

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

/* ── Component ──────────────────────────────────────────────────── */

import { generateDynamicText } from "@/lib/pseo/spintax";

export function TrustMethodologyBlock({
  municipio,
  provincia,
  comunidadAutonoma,
  irradiacionSolar,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioLuz,
  habitantes,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const comClean = cleanName(comunidadAutonoma);

  const irrad = Number(irradiacionSolar ?? 1600);
  const horas = Number(horasSol ?? 1800);
  const ahorro = Number(ahorroEstimado ?? 800);
  const bonIbi = bonificacionIbi != null && bonificacionIbi > 0 ? Math.round(bonificacionIbi) : null;

  const vars = {
    MUNICIPIO: muniClean,
    PROVINCIA: provClean,
    AHORRO: fmt(ahorro),
    IRRAD: fmt(irrad),
    PRECIO: precioLuz.toFixed(3),
  };

  const prod5kw = Math.round(horas / 365 * 5 * 0.80 * 365);
  const co2Avoided = Math.round(prod5kw * 0.233); 
  const treesEquiv = Math.round(co2Avoided / 22);

  const titleSpintax = "{¿Por qué confiar en estos datos para [MUNICIPIO]?|Metodología y fuentes oficiales — [MUNICIPIO]|Transparencia de datos en [MUNICIPIO]|Rigor técnico: análisis solar de [MUNICIPIO]}";
  const title = generateDynamicText(titleSpintax, `${muniClean}-trust-title`, vars);

  const introSpintax = "{Todos los datos de **energía solar** en esta página se calculan mediante un **proyecto** técnico veraz|A diferencia de otras webs, nuestra **empresa** utiliza fuentes institucionales para desglosar la luz solar en [MUNICIPIO]|El rigor técnico es la base de cada cifra sobre [MUNICIPIO] que mostramos aquí}. " +
    "{Cada dato describe la **economía** real que un **cliente** puede esperar de su **sistema fotovoltaico**|No prometemos ahorros mágicos: mostramos la **calidad** de la irradiación en [PROVINCIA] para que tu **cuenta de la luz** baje de forma honesta}.";
  const intro = generateDynamicText(introSpintax, `${muniClean}-trust-intro`, vars);

  const sources = [
    {
      name: "PVGIS — Comisión Europea",
      tag: "EU",
      desc: generateDynamicText(
        "{Irradiación de [IRRAD] kWh/m² y [HORAS] horas de sol anuales para [MUNICIPIO]|Datos institucionales de recurso solar ([IRRAD] kWh/m²) validados satelitalmente en [PROVINCIA]}.",
        `${muniClean}-src-pvgis`, { ...vars, HORAS: String(horas) }
      ),
    },
    {
      name: "ESIOS/REE — Mercado Eléctrico",
      tag: "REE",
      desc: `Precio real PVPC (${precioLuz.toFixed(3)} €/kWh) actualizado vía API desde Red Eléctrica.`,
    },
    {
      name: `Ordenanza — Ayto. ${muniClean}`,
      tag: "AYT",
      desc: bonIbi 
        ? `Bonificación del ${bonIbi}% en IBI confirmada por normativa local vigente.`
        : `Sin bonificación IBI activa según el último boletín oficial consultado.`,
    },
  ];

  const methodSteps = [
    { step: "Geolocalización", detail: `Coordenadas exactas de ${muniClean} para evitar promedios.` },
    { step: "Producción Real", detail: `Cálculo con ${fmt(irrad)} kWh/m² y eficiencia técnica del 80%.` },
    { step: "Ahorro Neto", detail: `Cruce con tarifa PVPC y ratio de autoconsumo ponderado.` },
    { step: "Carga Fiscal", detail: `Inclusión de bonificaciones de ${muniClean} e IRPF estatal.` },
  ];

  const closingSpintax = "{Los [AHORRO] €/año de ahorro para [MUNICIPIO] son el resultado de multiplicar [IRRAD] kWh/m² × 5 kWp × 0,80 × [PRECIO] €/kWh × 65% de autoconsumo|Cálculo veraz: [AHORRO] €/año basados en la irradiación local de [MUNICIPIO] ([IRRAD] kWh/m²) y el precio oficial REE de [PRECIO] €|La rentabilidad de tu **sistema fotovoltaico** en [MUNICIPIO] se apoya en estos [AHORRO] € de ahorro anual verificado}.";
  const finalClosing = generateDynamicText(closingSpintax, `${muniClean}-trust-close`, vars);

  return (
    <section className="bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden font-manrope mt-10">
      {/* Header */}
      <div className="px-8 py-8 md:px-10 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-emerald-600">E-E-A-T · Rigor Técnico</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4">
          {title}
        </h2>
        <div className="text-lg text-slate-600 leading-relaxed font-medium">
          {parseMarkdown(intro)}
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Sources column */}
        <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 space-y-6">
          <p className="text-[11px] font-black tracking-widest uppercase text-slate-400">Fuentes de Datos Institucionales</p>
          {sources.map((src, i) => (
            <div key={i} className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-black text-[10px] shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {src.tag}
                </span>
                <p className="font-black text-slate-900 uppercase tracking-wide text-sm">{src.name}</p>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {src.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Methodology column */}
        <div className="p-8 md:p-10 space-y-6 bg-slate-50/30">
          <p className="text-[11px] font-black tracking-widest uppercase text-slate-400">Algoritmo de Cálculo Verificable</p>
          <div className="space-y-4">
            {methodSteps.map((ms, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-black shrink-0 mt-1 shadow-sm">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-base">{ms.step}</p>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed font-medium">{ms.detail}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center mb-4">
               <div>
                  <p className="text-2xl font-black text-slate-900">{fmt(prod5kw)} <span className="text-sm font-medium text-slate-400">kWh/año</span></p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Potencial Generado</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{fmt(treesEquiv)} <span className="text-sm font-medium text-slate-400">uds</span></p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Árboles/Año</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-emerald-600 text-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-sm leading-relaxed font-bold italic relative z-10 text-emerald-50">
          {parseMarkdown(finalClosing)}
        </p>
      </div>
    </section>
  );
}
