/**
 * InstallationProcessTimeline — Server component
 * Step-by-step guide for installing solar panels in a specific municipality.
 * 
 * Steps reference local permitting, provincial regulations, and climate factors.
 * Highly city-differentiated: mentions ayuntamiento, provincia, comunidad, 
 * and adapts technical advice to the local solar tier.
 *
 * This is linkable "reference content" — the kind of authoritative guide
 * that attracts backlinks from forums, blogs, and comparison sites.
 */

type Props = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  bonificacionIbi: number | null;
  precioInstalacionMedio: number | null;
  habitantes: number | null;
};

/* ── Helpers ────────────────────────────────────────────────────── */

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

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

/* ── Step definitions ───────────────────────────────────────────── */

type Step = {
  number: number;
  title: string;
  duration: string;
  icon: string;
  detail: string;
  tip: string | null;
};

function buildSteps(municipio: string, provincia: string, comunidad: string, h: number, bonIbi: number | null, precioMedio: number | null, hab: number | null): Step[] {
  const isUrban = (hab ?? 0) >= 20000;
  const hasIbi = bonIbi && bonIbi > 0;

  return [
    {
      number: 1,
      title: "Estudio técnico de la vivienda",
      duration: "1–3 días",
      icon: "1",
      detail: pick([
        `Un técnico certificado visita tu vivienda en ${municipio} para analizar la cubierta: orientación, inclinación, superficie disponible y posibles sombras de edificios colindantes o vegetación. Se realizan mediciones con inclinómetro y, en instalaciones grandes, con dron o escáner lidar 3D.`,
        `El instalador realiza un estudio solar personalizado de tu tejado en ${municipio}: mide la superficie útil, identifica sombras de chimeneas, antenas o árboles, y determina la orientación e inclinación óptimas. Los estudios más completos incluyen simulación 3D con software tipo PVsyst o Helioscope.`,
        `El primer paso es un diagnóstico en campo de tu cubierta en ${municipio}. El técnico verifica el estado estructural del tejado, la presencia de amianto (uralita), la orientación respecto al sur y el espacio libre para los paneles. Con estos datos elabora un diseño preliminar y un presupuesto detallado.`,
      ], h, 10),
      tip: pick([
        "Pide siempre un estudio de sombras 3D antes de firmar. Un buen instalador lo incluye sin coste.",
        "Solicita que el presupuesto detalle potencia de paneles, modelo de inversor y garantías por separado.",
        "Compara al menos 2–3 presupuestos de instaladores diferentes en la provincia antes de decidir.",
      ], h, 11),
    },
    {
      number: 2,
      title: "Diseño y presupuesto personalizado",
      duration: "3–5 días",
      icon: "2",
      detail: pick([
        `Con los datos del estudio, el instalador diseña el sistema fotovoltaico: número de paneles, potencia total (kWp), tipo de inversor y cableado. El presupuesto incluye equipos, mano de obra, estructura de soporte y tramitación administrativa. En ${provincia}, el coste medio de una instalación residencial se sitúa en torno a ${precioMedio ? `${precioMedio.toLocaleString("es-ES")} €` : "5 000–8 000 €"} para 4–5 kWp.`,
        `El proyecto técnico detalla: esquema unifilar, plano de cubierta con ubicación de paneles, cálculo de producción anual y análisis financiero (ahorro, amortización, TIR). Un buen presupuesto en ${provincia} desglosa cada partida: paneles (~40%), inversor (~20%), estructura (~15%), instalación eléctrica y mano de obra (~25%).`,
        `Se elabora una memoria técnica que incluye el dimensionamiento del sistema, la curva de producción mensual estimada para las coordenadas de ${municipio} y el análisis de viabilidad económica. El presupuesto debe incluir todos los conceptos: equipos, montaje, legalización y conexión a red.`,
      ], h, 20),
      tip: null,
    },
    {
      number: 3,
      title: `Permisos y licencias en ${cleanName(municipio)}`,
      duration: isUrban ? "15–30 días" : "7–15 días",
      icon: "3",
      detail: pick([
        `Antes de instalar, es necesario tramitar la licencia de obra menor (o declaración responsable, según la ordenanza del Ayuntamiento de ${municipio}). ${isUrban ? "En municipios urbanos como este, el plazo habitual de tramitación es de 15–30 días hábiles." : "En localidades más pequeñas, la tramitación suele ser más ágil (7–15 días)."}${hasIbi ? ` Además, debes solicitar la bonificación del ${bonIbi}% sobre el IBI por instalación de autoconsumo — se presenta en el mismo acto o en un plazo máximo de 3 meses tras la legalización.` : ""}`,
        `En ${comunidad}, la tramitación administrativa incluye: declaración responsable de obra menor ante el Ayuntamiento de ${municipio}, certificado de instalación eléctrica (CIE) y registro en el REBT de Industria de ${provincia}. ${hasIbi ? `No olvides solicitar la bonificación IBI (${bonIbi}%) — es un trámite separado que se gestiona en la Oficina de Tributos municipal.` : "La mayoría de instaladores homologados gestionan toda la documentación como parte del servicio."}`,
        `La normativa en ${comunidad} exige licencia de obra menor o declaración responsable para instalaciones fotovoltaicas residenciales. En ${municipio}, el proceso se realiza ante la Concejalía de Urbanismo o la Oficina de Atención al Ciudadano. ${isUrban ? "El plazo medio en municipios urbanos es de 20 días hábiles." : "En municipios pequeños es frecuente obtener la autorización en 10 días."}`,
      ], h, 30),
      tip: hasIbi
        ? `Importante: la bonificación del ${bonIbi}% en el IBI debe solicitarse expresamente — no se aplica automáticamente. Tu instalador puede gestionar el trámite.`
        : "Consulta en el Ayuntamiento si existe bonificación en el ICIO (Impuesto de Construcciones) para instalaciones renovables.",
    },
    {
      number: 4,
      title: "Instalación y montaje",
      duration: "1–3 días",
      icon: "4",
      detail: pick([
        `El equipo de instaladores monta la estructura de soporte sobre la cubierta, fija los paneles fotovoltaicos, instala el inversor (normalmente junto al cuadro eléctrico principal) y realiza el conexionado eléctrico. En viviendas de ${municipio} con cubierta inclinada, el montaje típico se completa en 1–2 días laborables. Para cubiertas planas con estructura soporte elevada, puede extenderse a 3 días.`,
        `La instalación física incluye: anclaje de la estructura al tejado (tornillería inox con sellado de juntas), colocación de paneles, tendido del cableado DC hasta el inversor, conexión al cuadro de protecciones y puesta a tierra. Un equipo de 2–3 técnicos completa una instalación residencial estándar en ${municipio} en 1–2 jornadas.`,
        `El proceso de montaje en ${municipio} sigue un protocolo estricto: primero se impermeabiliza la zona de anclaje, luego se colocan los carriles de aluminio, se montan los paneles y se cablea en serie/paralelo hasta el inversor. La conexión al cuadro general del hogar es el último paso antes de la puesta en marcha.`,
      ], h, 40),
      tip: pick([
        "El instalador debe entregar un certificado de instalación eléctrica (CIE) firmado por un electricista autorizado.",
        "Verifica que la estructura de montaje es de aluminio anodizado: resiste mejor la intemperie que el acero galvanizado.",
        "Asegúrate de que incluyen protecciones DC (fusibles y seccionador) entre los paneles y el inversor.",
      ], h, 41),
    },
    {
      number: 5,
      title: "Legalización y conexión a red",
      duration: "15–45 días",
      icon: "5",
      detail: pick([
        `Tras la instalación, el instalador tramita el Certificado de Instalación Eléctrica (CIE) ante Industria de ${provincia} y la solicitud de conexión ante la distribuidora eléctrica de la zona. El proceso incluye: inscripción en el REBT, alta como autoconsumidor en el RAIPRE y modificación del contrato de suministro para activar la compensación simplificada de excedentes.`,
        `La legalización en ${provincia} implica tres trámites principales: (1) registro del CIE en la Delegación de Industria, (2) solicitud del CAU (Código de Autoconsumo Unificado) a la distribuidora, y (3) alta en la plataforma de compensación de excedentes. El plazo total oscila entre 15 y 45 días según la carga de trabajo de la distribuidora.`,
        `El paso final es la legalización administrativa: el instalador registra la instalación ante Industria de ${provincia} y solicita a la distribuidora el cambio de modalidad a autoconsumo con excedentes (RD 244/2019). Una vez activo, cada kWh vertido a la red compensa en tu factura al precio regulado.`,
      ], h, 50),
      tip: "Una vez legalizada, descarga la app de tu inversor para monitorizar la producción en tiempo real. Detectarás cualquier anomalía antes de que afecte al ahorro.",
    },
    {
      number: 6,
      title: "Producción y ahorro desde el primer día",
      duration: "continuo · 25+ años",
      icon: "6",
      detail: pick([
        `Con la instalación conectada, empezarás a generar electricidad desde la primera hora de sol. En ${municipio}, con la irradiación local, un sistema de 5 kWp produce una media de __DAILY_PROD__ kWh al día. La factura de la luz se reduce inmediatamente: la energía que generas y consumes tiene coste cero, y los excedentes se compensan.`,
        `Tu sistema fotovoltaico en ${municipio} entra en producción automáticamente al amanecer. Los paneles actuales tienen una vida útil garantizada de 25–30 años con una degradación inferior al 0,5% anual. Esto significa que en el año 25, tu instalación seguirá produciendo más del 87% de su capacidad original.`,
        `Desde el momento de la conexión, tu vivienda en ${municipio} se convierte en una micro-central de generación eléctrica. Cada kWh producido y autoconsumido supone un ahorro directo al precio PVPC. El mantenimiento es mínimo: una limpieza anual y una revisión eléctrica cada 3–5 años son suficientes.`,
      ], h, 60),
      tip: null,
    },
  ];
}

// Fix the template literal reference
function fixStep6Detail(detail: string, horasSol: number | null): string {
  const horas = Number(horasSol ?? 1800);
  const dailyProd = Math.round(horas / 365 * 5 * 0.80);
  return detail.replace("__DAILY_PROD__", String(dailyProd));
}

/* ── Component ──────────────────────────────────────────────────── */

export function InstallationProcessTimeline({
  municipio,
  provincia,
  comunidadAutonoma,
  irradiacionSolar,
  horasSol,
  bonificacionIbi,
  precioInstalacionMedio,
  habitantes,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const comClean = cleanName(comunidadAutonoma);
  const h = hash(municipio);
  const bonIbi = bonificacionIbi ? Number(bonificacionIbi) : null;
  const precioMedio = precioInstalacionMedio ? Number(precioInstalacionMedio) : null;

  let steps = buildSteps(muniClean, provClean, comClean, h, bonIbi, precioMedio, habitantes ? Number(habitantes) : null);

  // Fix step 6 detail with actual sun hours
  steps = steps.map((s, i) => i === 5 ? { ...s, detail: fixStep6Detail(s.detail, horasSol) } : s);

  const totalDays = "30–60 días";
  const yearNow = new Date().getFullYear();

  const timelineTitles = [
    `Cómo instalar placas solares en ${muniClean} — Proceso completo ${yearNow}`,
    `Guía de instalación fotovoltaica en ${muniClean}: de 0 a generar en ${totalDays}`,
    `Instala paneles solares en ${muniClean} paso a paso (${yearNow})`,
    `${totalDays} para empezar a ahorrar: guía de instalación solar en ${muniClean}`,
  ];

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </span>
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-600">Guía paso a paso</p>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
          {pick(timelineTitles, h, 3)}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Desde el estudio inicial hasta la primera factura con ahorro. Plazo total estimado: <strong>{totalDays}</strong>.
          {comClean && <> Normativa aplicable en {comClean}.</>}
        </p>
      </div>

      {/* Timeline */}
      <div className="px-6 py-4">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200" aria-hidden />

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Circle */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-sm text-sm font-bold text-indigo-700">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Paso {step.number}</span>
                    <span className="text-[10px] text-slate-400 font-medium">· {step.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>

                  {step.tip && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Consejo:</span> {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Plazos orientativos para instalaciones residenciales en {muniClean} ({provClean}).
          Los tiempos de tramitación pueden variar según la carga de la Delegación de Industria
          de {provClean} y la distribuidora eléctrica de la zona. RD 244/2019 · Ley 7/2021 de Cambio Climático.
        </p>
      </div>
    </section>
  );
}
