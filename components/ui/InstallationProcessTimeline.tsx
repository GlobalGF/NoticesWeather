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

function buildSteps(municipio: string, provincia: string, comunidad: string, h: number, bonIbi: number | null, precioMedio: number | null, hab: number | null): { steps: Step[]; urbanContext: string } {
  const habCount = hab ?? 0;
  const isUrban = habCount >= 20000; // Legacy threshold for durations
  const hasIbi = bonIbi && bonIbi > 0;

  const urbanContext = habCount > 50000 
    ? `Dada la alta densidad de población en ${municipio}, las instalaciones suelen realizarse en bloques de pisos y comunidades de vecinos que buscan el autoconsumo colectivo.`
    : habCount < 5000 
      ? `En ${municipio}, predominan las viviendas unifamiliares, naves agrícolas y tejados despejados, lo que simplifica enormemente el montaje de paneles solares.`
      : `El tejido residencial de ${municipio} es ideal para el autoconsumo, combinando viviendas pareadas con pequeñas zonas industriales de alta radiación.`;

  const steps: Step[] = [
    {
      number: 1,
      title: "Estudio técnico de la vivienda",
      duration: "1–3 días",
      icon: "1",
      detail: pick([
        `Un técnico de nuestro **equipo** visita tu vivienda en ${municipio} para realizar el **proyecto** inicial: analiza orientación, superficie y cada **panel** ideal para tu tejado. Este estudio de **calidad** asegura que la **energía solar** se aproveche al máximo.`,
        `El instalador elabora un **proyecto fotovoltaico** personalizado para tu tejado en ${municipio}: identifica sombras y determina cómo optimizar la **luz** para que tu **empresa** u hogar empiece a ahorrar de forma veraz.`,
        `El primer paso es un diagnóstico de **calidad** en tu cubierta de ${municipio}. El **equipo** técnico verifica el espacio para el **sistema** y la orientación óptima para que la **energía** generada baje tu **cuenta de la luz**.`,
      ], h, 10),
      tip: pick([
        "Pide siempre un proyecto técnico detallado antes de firmar para asegurar la calidad del equipo.",
        "Solicita que el presupuesto de tu empresa instaladora deslose cada panel y el modelo de inversor.",
        "Compara la atención al cliente de varios instaladores en la provincia antes de decidir tu sistema.",
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
        `El **equipo** de montaje fija la estructura de alta **calidad**, instala cada **panel solar** e integra el inversor en tu vivienda de ${municipio}. Un proceso rápido que busca mejorar tu **economía** reduciendo la **cuenta de la luz** desde el primer día.`,
        `La instalación física de tu **sistema fotovoltaico** en ${municipio} incluye anclajes inoxidables y cableado de **calidad**. Nuestra **empresa** asegura que el montaje cumpla con los estándares de seguridad y eficiencia.`,
        `El proceso en ${municipio} sigue un protocolo de **atención** técnica estricto: se impermeabiliza la zona y se montan los **paneles** fotovoltaicos para que el flujo de **energía solar** sea constante y duradero.`,
      ], h, 40),
      tip: pick([
        "Asegura que tu empresa instaladora te entregue el certificado de equipo firmado por un técnico.",
        "Verifica que el panel y la estructura sean de alta calidad para resistir la intemperie en la provincia.",
        "Exige que el sistema incluya protecciones para la cuenta de la luz ante picos de tensión.",
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
  return { steps, urbanContext };
}

// Fix the template literal reference
function fixStep6Detail(detail: string, horasSol: number | null): string {
  const horas = Number(horasSol ?? 1800);
  const dailyProd = Math.round(horas / 365 * 5 * 0.80);
  return detail.replace("__DAILY_PROD__", String(dailyProd));
}

/* ── Component ──────────────────────────────────────────────────── */

import { parseMarkdown } from "@/lib/utils/text";

// ... (cleanName, hash, pick remain same)

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

  const { steps: rawSteps, urbanContext } = buildSteps(muniClean, provClean, comClean, h, bonIbi, precioMedio, habitantes ? Number(habitantes) : null);
  const steps = rawSteps.map((s, i) => i === 5 ? { ...s, detail: fixStep6Detail(s.detail, horasSol) } : s);

  const totalDays = "30–60 días";
  const yearNow = new Date().getFullYear();

  const title = pick([
    `Hoja de ruta solar para ${muniClean} — Guía ${yearNow}`,
    `Cómo instalar placas solares en ${muniClean} paso a paso`,
    `Tiempos y trámites de instalación en ${muniClean}`,
  ], h, 1);

  return (
    <section className="bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 font-manrope mt-10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      {/* Header */}
      <div className="px-8 py-10 md:px-12 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-600">Proceso Verificado ${yearNow}</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4">
          {title}
        </h2>
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
           <p className="text-indigo-900 leading-relaxed font-bold italic text-base">
            "{urbanContext}"
          </p>
          <div className="mt-4 flex items-center gap-4">
             <span className="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-xs font-black text-indigo-600 uppercase">
                Plazo estimado: {totalDays}
             </span>
             <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">
                Normativa {comClean}
             </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-8 py-10 md:px-12">
        <div className="relative">
          {/* Vertical line with gradient */}
          <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-500 via-blue-400 to-slate-200 rounded-full" aria-hidden />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex gap-8 group">
                {/* Circle with glow */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-200/50 text-base font-black text-indigo-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.15em]">Fase {step.number}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{step.duration}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                  <div className="text-lg text-slate-600 leading-relaxed font-medium">
                    {parseMarkdown(step.detail)}
                  </div>

                  {step.tip && (
                    <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-5 relative overflow-hidden group/tip">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.05] grayscale group-hover/tip:grayscale-0 transition-all">
                         <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10a10 10 0 0 0-10-10zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-11h2v2h-2v-2zm0 4h2v5h-2v-5z"/></svg>
                      </div>
                      <p className="text-sm font-bold text-amber-900 leading-relaxed relative z-10">
                        <span className="uppercase tracking-[0.1em] text-[10px] block mb-1 text-amber-600">Consejo Experto</span>
                        {step.tip}
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
      <div className="px-8 py-6 bg-slate-100 border-t border-slate-200">
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-center">
          *Plazos orientativos para instalaciones en {muniClean}. RD 244/2019 · {yearNow} · Ingeniería SolaryEco.
        </p>
      </div>
    </section>
  );
}
