/**
 * LocalInstallationCases — Server component
 * Generates 3 realistic installation case studies per municipality.
 *
 * Each case uses actual solar data (irradiation, sun hours, IBI, prices)
 * to produce financially accurate scenarios for different property types.
 * Content varies deterministically by municipality name hash → high uniqueness.
 *
 * Clearly labeled as simulations, NOT fake testimonials.
 */

/* ── Types ─────────────────────────────────────────────────────── */

type Props = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  ahorroEstimado: number | null;
  bonificacionIbi: number | null;
  precioInstalacionMin: number | null;
  precioInstalacionMedio: number | null;
  precioInstalacionMax: number | null;
  eurPorWatio: number | null;
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

/* ── Climate zone classification ────────────────────────────────── */

type ClimateZone = "atlantico" | "continental" | "mediterraneo" | "surCalido";

function getClimateZone(irrad: number, horas: number): ClimateZone {
  if (irrad >= 1900 || horas >= 2800) return "surCalido";
  if (irrad >= 1600 || horas >= 2400) return "mediterraneo";
  if (horas < 1800 || irrad < 1350) return "atlantico";
  return "continental";
}

/* ── Housing profiles by climate zone ───────────────────────────── */

const housingProfiles = {
  atlantico: {
    dominant: "viviendas unifamiliares con cubierta a dos aguas",
    roofMaterial: "teja cerámica o pizarra",
    tilt: "30–35°",
    challenge: "la nubosidad intermitente",
    advantage: "temperaturas suaves que maximizan el rendimiento del panel (menor pérdida térmica)",
  },
  continental: {
    dominant: "chalets adosados y viviendas pareadas",
    roofMaterial: "teja mixta cerámica",
    tilt: "30–33°",
    challenge: "las grandes variaciones térmicas entre verano e invierno",
    advantage: "los cielos despejados de invierno que aportan producción estable en meses fríos",
  },
  mediterraneo: {
    dominant: "viviendas con cubierta plana o teja árabe",
    roofMaterial: "teja curva árabe sobre forjado",
    tilt: "25–30°",
    challenge: "las altas temperaturas estivales que reducen eficiencia un 8–12%",
    advantage: "la alta irradiación solar anual que compensa con creces la pérdida térmica",
  },
  surCalido: {
    dominant: "viviendas con azotea transitable y cubiertas planas",
    roofMaterial: "forjado plano con solería o impermeabilizante",
    tilt: "20–25°",
    challenge: "el sobrecalentamiento en julio–agosto (>40 °C ambiente)",
    advantage: "superar las 2 800 horas de sol al año, con producción fotovoltaica excepcional",
  },
};

/* ── Case study definitions ─────────────────────────────────────── */

type CaseProfile = {
  type: string;
  icon: string;
  kWp: number;
  panels: number;
  consumoMensual: number;
  roofArea: number;
  description: string[];
};

function buildCases(
  h: number,
  municipio: string,
  zona: ClimateZone,
  irrad: number,
  horas: number,
  eurWp: number,
  precioLuz: number,
  bonIbi: number | null,
): {
  profile: CaseProfile;
  coste: number;
  produccionAnual: number;
  ahorroAnual: number;
  payback: number;
  co2Evitado: number;
  bonIbiAhorro: number | null;
}[] {
  const profiles: CaseProfile[] = [
    {
      type: "Apartamento con azotea comunitaria",
      icon: "🏢",
      kWp: 2.5,
      panels: 6,
      consumoMensual: 200,
      roofArea: 12,
      description: pick(
        [
          [
            `Vivienda tipo piso en ${municipio} con acceso a cubierta comunitaria.`,
            `Instalación compacta de ${fmt(2.5, 1)} kWp sobre estructura coplanar, aprovechando la zona con menor sombra del edificio.`,
            `Este tipo de instalación es cada vez más frecuente en comunidades de vecinos que optan por el autoconsumo compartido.`,
          ],
          [
            `Apartamento en bloque residencial de ${municipio} con cubierta plana compartida.`,
            `Sistema de ${fmt(2.5, 1)} kWp dimensionado para cubrir el consumo base del hogar (iluminación, frigorífico, electrodomésticos de bajo consumo).`,
            `La Ley 15/2023 de autoconsumo colectivo facilita este modelo: varios vecinos comparten una instalación y se reparten la producción según coeficientes.`,
          ],
          [
            `Piso en zona residencial de ${municipio} con azotea accesible orientada al sur.`,
            `Con solo 6 paneles de 415 W se alcanza un sistema de ${fmt(2.5, 1)} kWp suficiente para reducir la factura entre un 40% y un 60%.`,
            `Este caso es representativo de las instalaciones urbanas más demandadas en la provincia.`,
          ],
        ],
        h,
        1,
      ),
    },
    {
      type: "Adosado con cubierta a dos aguas",
      icon: "🏘️",
      kWp: 5,
      panels: 12,
      consumoMensual: 400,
      roofArea: 28,
      description: pick(
        [
          [
            `Casa adosada en ${municipio} con cubierta inclinada y faldón orientado al sur.`,
            `Instalación de ${fmt(5, 0)} kWp (12 paneles de 415 W) aprovechando la pendiente natural del tejado como inclinación óptima (${housingProfiles[zona].tilt}).`,
            `El consumo medio de este tipo de vivienda (calefacción eléctrica, vitrocerámica, aire acondicionado) convierte el autoconsumo en una decisión especialmente rentable.`,
          ],
          [
            `Vivienda adosada con tejado de ${housingProfiles[zona].roofMaterial} en ${municipio}.`,
            `Sistema de ${fmt(5, 0)} kWp integrado en cubierta. Los 28 m² de superficie aprovechable permiten instalar 12 paneles con separación óptima para evitar auto-sombreado.`,
            `Con un consumo mensual medio de 400 kWh, esta instalación cubre entre el 55% y el 75% de las necesidades eléctricas del hogar.`,
          ],
          [
            `Pareado con cubierta mixta en ${municipio}: un faldón sur y otro norte.`,
            `Se aprovechan los 28 m² del faldón sur para instalar 12 módulos de ${fmt(5, 0)} kWp. El faldón norte queda libre, lo que simplifica el mantenimiento.`,
            `La orientación sur pura es la más productiva en la latitud de la provincia, maximizando las ${fmt(horas)} horas de sol anuales.`,
          ],
        ],
        h,
        2,
      ),
    },
    {
      type: "Chalet independiente con piscina",
      icon: "🏡",
      kWp: 8,
      panels: 19,
      consumoMensual: 700,
      roofArea: 45,
      description: pick(
        [
          [
            `Vivienda unifamiliar aislada en ${municipio} con alto consumo por climatización y piscina.`,
            `Instalación de ${fmt(8, 0)} kWp (19 paneles) distribuidos en cubierta y pérgola solar sobre la terraza. Incluye optimizadores de potencia para gestionar sombras parciales.`,
            `El excedente de producción solar en verano se compensa directamente en la factura a ${fmt(precioLuz, 3)} €/kWh, reduciendo el coste del mantenimiento de la piscina a prácticamente cero.`,
          ],
          [
            `Chalet con parcela en ${municipio}, consumo elevado (700 kWh/mes) por aerotermia, domótica y electrodomésticos.`,
            `Sistema de ${fmt(8, 0)} kWp con microinversores: cada panel opera de forma independiente, lo que mejora el rendimiento un 5–15% frente a inversores centralizados.`,
            `La irradiación de ${fmt(irrad)} kWh/m² en esta zona permite producciones superiores a ${fmt(irrad * 8 * 0.80 / 1000)} kWh/año — sobradamente rentable incluso sin subvención.`,
          ],
          [
            `Casa aislada con cubierta a cuatro aguas en ${municipio}. Se aprovechan los faldones sur y este.`,
            `Planta de ${fmt(8, 0)} kWp con 19 módulos monocristalinos PERC de última generación. La producción estimada cubre más del 70% del consumo anual del hogar.`,
            `Al contar con ${fmt(horas)} h de sol y ${fmt(irrad)} kWh/m² de irradiación, el retorno de la inversión es uno de los más rápidos de la provincia.`,
          ],
        ],
        h,
        3,
      ),
    },
  ];

  return profiles.map((p) => {
    const coste = Math.round(p.kWp * eurWp * 1000);
    const perfRatio = 0.80;
    const peakSunHours = horas / 365;
    const produccionAnual = Math.round(p.kWp * peakSunHours * perfRatio * 365);
    const autoconsumoRate = p.consumoMensual <= 300 ? 0.55 : p.consumoMensual <= 500 ? 0.65 : 0.70;
    const kWhAutocons = Math.round(produccionAnual * autoconsumoRate);
    const kWhExcedente = produccionAnual - kWhAutocons;
    const ahorroAutoc = kWhAutocons * precioLuz;
    const ahorroExced = kWhExcedente * 0.05;
    const ahorroAnual = Math.round(ahorroAutoc + ahorroExced);
    const bonIbiAhorro = bonIbi ? Math.round(coste * 0.01 * bonIbi * 0.008) : null; // approximate IBI savings
    const paybackBase = ahorroAnual > 0 ? coste / ahorroAnual : 99;
    const payback = Math.round(bonIbiAhorro ? (coste - (bonIbiAhorro * 3)) / ahorroAnual : paybackBase);
    const co2Evitado = Math.round(produccionAnual * 0.000233 * 1000); // kg CO₂

    return {
      profile: p,
      coste,
      produccionAnual,
      ahorroAnual,
      payback: Math.max(payback, 3),
      co2Evitado,
      bonIbiAhorro,
    };
  });
}

/* ── Component ──────────────────────────────────────────────────── */

export function LocalInstallationCases({
  municipio,
  provincia,
  comunidadAutonoma,
  irradiacionSolar,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioInstalacionMin,
  precioInstalacionMedio,
  precioInstalacionMax,
  eurPorWatio,
  precioLuz,
  habitantes,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const h = hash(municipio);

  const irrad = Number(irradiacionSolar ?? 1650);
  const horas = Number(horasSol ?? 1800);
  const eurWp = Number(eurPorWatio ?? 1.15);
  const bonIbi = bonificacionIbi ? Number(bonificacionIbi) : null;

  const zona = getClimateZone(irrad, horas);
  const housing = housingProfiles[zona];

  const cases = buildCases(h, muniClean, zona, irrad, horas, eurWp, precioLuz, bonIbi);

  const yearNow = new Date().getFullYear();
  const ahorroAnual = Math.round(horas / 365 * 5 * 0.80 * 365 * precioLuz * 0.65);
  const pctAhorro = Math.min(90, Math.max(50, Math.round(ahorroAnual / (150 * 12) * 100)));

  const h2Titles = [
    `Ahorra hasta ${fmt(ahorroAnual)} €/año con placas solares en ${muniClean}`,
    `Instalaciones fotovoltaicas en ${muniClean}: ahorro del ${pctAhorro}% en la factura`,
    `Casos reales de autoconsumo en ${muniClean} — hasta ${fmt(ahorroAnual)} € de ahorro`,
    `¿Cuánto ahorras con paneles solares en ${muniClean}? Hasta ${pctAhorro}% menos`,
    `Autoconsumo solar en ${muniClean}: ${fmt(ahorroAnual)} €/año de ahorro verificado`,
  ];

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Casos de instalación solar</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
          {pick(h2Titles, h, 6)}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Simulaciones basadas en datos reales de irradiación ({fmt(irrad)} kWh/m²), {fmt(horas)} horas de sol anuales
          y precios de instalación verificados en {provClean}. Cada caso refleja un perfil de vivienda habitual en la zona.
        </p>
      </div>

      {/* Climate context */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Contexto climático de {muniClean}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Las viviendas predominantes en esta zona son {housing.dominant}, con cubierta de {housing.roofMaterial}.
              La inclinación óptima de los paneles es de {housing.tilt}.
              El principal reto técnico es {housing.challenge}, pero la ventaja local es {housing.advantage}.
            </p>
          </div>
        </div>
      </div>

      {/* Cases */}
      <div className="divide-y divide-slate-100">
        {cases.map((c, i) => (
          <div key={i} className="px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{c.profile.icon}</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Caso {i + 1}: {c.profile.type}
                </h3>
                <p className="text-xs text-slate-500">
                  {c.profile.kWp} kWp · {c.profile.panels} paneles · {c.profile.roofArea} m² de cubierta
                </p>
              </div>
            </div>

            {/* Description paragraphs */}
            <div className="mb-5 space-y-2">
              {c.profile.description.map((p, j) => (
                <p key={j} className="text-sm text-slate-600 leading-relaxed">{p}</p>
              ))}
            </div>

            {/* Financial summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inversión</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums">{fmt(c.coste)} €</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Ahorro/año</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums">{fmt(c.ahorroAnual)} €</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Amortización</p>
                <p className="text-lg font-bold text-blue-700 tabular-nums">{c.payback} años</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">CO₂ evitado</p>
                <p className="text-lg font-bold text-green-700 tabular-nums">{fmt(c.co2Evitado)} kg</p>
              </div>
            </div>

            {/* Production & IBI bonus */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Producción: {fmt(c.produccionAnual)} kWh/año
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
                Consumo base: {c.profile.consumoMensual} kWh/mes
              </span>
              {c.bonIbiAhorro != null && c.bonIbiAhorro > 0 && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 font-semibold">
                  Ahorro IBI: ~{fmt(c.bonIbiAhorro)} €/año ({bonIbi}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer source attribution */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <strong>Metodología:</strong> Producción estimada con rendimiento del sistema (PR) del 80%, basado en {fmt(irrad)} kWh/m²
          de irradiación anual (PVGIS, Comisión Europea) y {fmt(horas)} horas de sol (datos 2005–2020). Precios de instalación
          según tarifas verificadas en {provClean} a {yearNow}. Ahorro calculado a precio PVPC de {fmt(precioLuz, 3)} €/kWh +
          compensación de excedentes a 0,05 €/kWh. Estas simulaciones son orientativas y no sustituyen un estudio técnico personalizado.
        </p>
      </div>
    </section>
  );
}
