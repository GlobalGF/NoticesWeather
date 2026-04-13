/* ── Types & Constants ────────────────────────────────────────── */
import { parseMarkdown } from "@/lib/utils/text";
import { generateDynamicText } from "@/lib/pseo/spintax";
import { FALLBACK_ES } from "@/lib/data/constants";

type Props = {
  municipio: string;
  provincia: string;
  eurPorWatio: number | null;
  precioInstalacionMin: number | null;
  precioInstalacionMedio: number | null;
  precioInstalacionMax: number | null;
  bonificacionIbi: number | null;
  irradiacionSolar: number | null;
  horasSol: number | null;
  precioLuz: number;
  slug: string;
};

function fmt(v: number | null | undefined, d = 0): string {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("es-ES", { maximumFractionDigits: d });
}

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

type SystemSize = {
  label: string;
  kWp: number;
  panels: number;
  roofM2: number;
  idealFor: string;
  wpMultiplier: number; // Curve factor (smaller = more expensive per watt)
};

const SYSTEM_SIZES: SystemSize[] = [
  { label: "Básica", kWp: 3, panels: 7, roofM2: 14, idealFor: "Piso o vivienda con consumo bajo (<200 kWh/mes)", wpMultiplier: 1.15 },
  { label: "Estándar", kWp: 5, panels: 12, roofM2: 24, idealFor: "Adosado o unifamiliar con consumo medio (300–400 kWh/mes)", wpMultiplier: 1.0 },
  { label: "Premium", kWp: 8, panels: 19, roofM2: 38, idealFor: "Chalet con alto consumo, piscina o coche eléctrico (>500 kWh/mes)", wpMultiplier: 0.9 },
];

/* ── Content Banks (Spintax) ────────────────────────────────────── */

export function PricingBreakdownTable({
  municipio,
  provincia,
  eurPorWatio,
  precioInstalacionMedio,
  bonificacionIbi,
  irradiacionSolar,
  horasSol,
  precioLuz,
  slug,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const yearNow = new Date().getFullYear();
  
  // DRIVING LOGIC: Derive real price per watt
  const dbEurWp = eurPorWatio || (precioInstalacionMedio ? precioInstalacionMedio / 5000 : null);
  const baseEurWp = dbEurWp || 1.45; 
  
  const ibi = bonificacionIbi ?? 0;
  const irrad = Number(irradiacionSolar ?? FALLBACK_ES.irradiacion_kwh_m2);
  const horas = Number(horasSol ?? FALLBACK_ES.horas_sol);

  const vars = {
    MUNICIPIO: muniClean,
    PROVINCIA: provClean,
    PRECIO: fmt(baseEurWp, 2),
    KW: String(SYSTEM_SIZES[1].kWp),
    KW_PREMIUM: String(SYSTEM_SIZES[2].kWp),
  };

  const introSpintax = "{El mercado fotovoltaico en [MUNICIPIO] ha alcanzado un punto de madurez donde el **precio medio de instalación** se sitúa en torno a los **[PRECIO] €/Wp**|Si buscas un **presupuesto de placas solares en [MUNICIPIO]**, la inversión inicial en [PROVINCIA] oscila actualmente sobre los **[PRECIO] €/Wp**|Instalar energía solar en [MUNICIPIO] es hoy más accesible: con un precio base de **[PRECIO] €/Wp** en la zona de [PROVINCIA], el ahorro es inmediato|La **rentabilidad de las placas solares en [MUNICIPIO]** se apoya en un coste técnico de **[PRECIO] €/Wp**, permitiendo amortizaciones rápidas en toda [PROVINCIA]}. " +
    "{Este coste puede variar según la complejidad del tejado, pero la tendencia en [MUNICIPIO] es claramente a la baja|Esta cifra de referencia en [PROVINCIA] permite a las familias reducir su factura drásticamente desde el primer mes|El factor clave en [MUNICIPIO] es ajustar el número de paneles a tu consumo real para maximizar el ahorro anual verificado}.";

  const footerSpintax = "{Para una vivienda en [MUNICIPIO], el factor decisivo es el autoconsumo nocturno. El sistema de [KW] kWp es el más equilibrado, pero si cuentas con coche eléctrico en [PROVINCIA], el ahorro puede crecer ampliando al rango Premium|En [MUNICIPIO], la configuración de [KW] kWp suele cubrir el 70% de las necesidades de un hogar medio; un sistema superior en [PROVINCIA] es ideal si planeas instalar aerotermia|La idoneidad del sistema en [MUNICIPIO] depende de tu curva de carga. Mientras el equipo de [KW] kWp es el estándar, en [PROVINCIA] recomendamos el kit de [KW_PREMIUM] kWp para máxima independencia energética}.";

  const introText = generateDynamicText(introSpintax, `${slug}-price-intro`, vars);
  const footerText = generateDynamicText(footerSpintax, `${slug}-price-footer`, vars);

  // Calculate data for each system size using the Pricing Curve
  const rows = SYSTEM_SIZES.map((sys) => {
    const specificEurWp = baseEurWp * sys.wpMultiplier;
    const costeBruto = Math.round(sys.kWp * specificEurWp * 1000);
    const deduccionIrpf = Math.round(Math.min(costeBruto * 0.20, 5000)); // Estimated state-wide deduction
    const ahorroIbiAnual = ibi > 0 ? Math.round(costeBruto * 0.008 * (ibi / 100)) : 0; 
    const ahorroIbiTotal = ahorroIbiAnual * 3; // Estimated typical duration
    const costeNeto = costeBruto - deduccionIrpf - ahorroIbiTotal;

    // Production & Savings estimate
    const peakSunH = horas / 365;
    const produccionAnual = Math.round(sys.kWp * peakSunH * 0.80 * 365);
    const autoconsumoRate = sys.kWp <= 3 ? 0.55 : sys.kWp <= 5 ? 0.65 : 0.70;
    const kWhAutocons = Math.round(produccionAnual * autoconsumoRate);
    const kWhExcedente = produccionAnual - kWhAutocons;
    const ahorroAnual = Math.round(kWhAutocons * precioLuz + kWhExcedente * 0.05);

    const paybackNeto = ahorroAnual > 0 ? Math.round(costeNeto / ahorroAnual) : 99;

    return {
      ...sys,
      specificEurWp,
      costeBruto,
      costeNeto,
      deduccionIrpf,
      ahorroIbiTotal,
      produccionAnual,
      ahorroAnual,
      paybackNeto,
    };
  });


  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </span>
          <p className="text-xs font-bold tracking-widest uppercase text-blue-400">Análisis de precios {yearNow}</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
          Precio de instalación de placas solares en {muniClean}
        </h2>
        <div className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed prose prose-invert">
          {parseMarkdown(introText)}
        </div>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left" role="table" aria-label={`Tabla de precios solares en ${muniClean}`}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500" scope="col">Tamaño</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right" scope="col">Presupuesto</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right hidden sm:table-cell" scope="col">Neto (Ayudas)</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right" scope="col">Ahorro Anual</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right" scope="col">Amortización</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={[
                  "transition-colors hover:bg-slate-50",
                  i === 1 ? "bg-blue-50/30" : "",
                ].join(" ")}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className={[
                      "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black shrink-0",
                      i === 0 ? "bg-slate-100 text-slate-600" :
                      i === 1 ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200" :
                      "bg-amber-100 text-amber-700",
                    ].join(" ")}>
                      {row.kWp}kW
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {row.label}
                        {i === 1 && <span className="ml-1.5 inline-block text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1 py-0.5 rounded">Recomendado</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{row.panels} módulos · ~{row.roofM2} m²</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-slate-900 tabular-nums">desde {fmt(row.costeBruto)} €</p>
                  <p className="text-[10px] text-slate-400">{fmt(row.specificEurWp, 2)} €/Wp</p>
                </td>
                <td className="py-4 px-4 text-right hidden sm:table-cell">
                  <p className="font-bold text-emerald-700 tabular-nums">{fmt(row.costeNeto)} €</p>
                  <p className="text-[10px] text-emerald-600">inc. deducción e IBI</p>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-blue-700 tabular-nums">{fmt(row.ahorroAnual)} €</p>
                  <p className="text-[10px] text-slate-400">{fmt(row.produccionAnual)} kWh/año</p>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={[
                    "inline-block rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                    row.paybackNeto <= 6 ? "bg-emerald-100 text-emerald-800" :
                    row.paybackNeto <= 8 ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800",
                  ].join(" ")}>
                    {row.paybackNeto} años
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spintax Footer Info */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Idoneidad del sistema</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {footerText}
        </p>
      </div>

      {/* Source & Methods */}
      <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] text-slate-400 leading-tight space-y-1">
          <p>Coste base: {fmt(baseEurWp, 2)} €/Wp · Radiación: {fmt(irrad)} kWh/m² · PVGIS 5.2 (Joint Research Centre).</p>
          <p>Simulación financiera no vinculante. Incluye estimación de deducciones de IRPF y bonificaciones fiscales en {muniClean}.</p>
        </div>
        <a
          href="#lead-form"
          className="shrink-0 bg-slate-900 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:bg-slate-800 hover:shadow-md transition-all active:scale-95"
        >
          Presupuesto para {muniClean}
        </a>
      </div>
    </section>
  );
}
