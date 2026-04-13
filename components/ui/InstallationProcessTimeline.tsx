"use client";

import { cleanName, hash, pick } from "@/lib/utils/text";
import { generateDynamicText } from "@/lib/pseo/spintax";
import { parseMarkdown } from "@/lib/utils/text";

type Step = {
  number: number;
  title: string;
  duration: string;
  icon: string;
  detail: string;
  tip: string | null;
};

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

function buildSteps(municipio: string, provincia: string, comunidad: string, h: number, bonIbi: number | null, precioMedio: number | null, hab: number | null): { steps: Step[]; urbanContext: string } {
  const habCount = hab ?? 0;
  const isUrban = habCount >= 20000;
  const hasIbi = bonIbi && bonIbi > 0;

  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    COMUNIDAD: comunidad,
    IBI: String(bonIbi || 0),
    PRECIO: precioMedio ? `${precioMedio.toLocaleString("es-ES")} €` : "6.000 €",
  };

  const urbanContext = generateDynamicText(
    habCount > 50000 
      ? "{Dada la alta densidad de población en [MUNICIPIO], las instalaciones suelen realizarse en {bloques de pisos|comunidades de vecinos|edificios residenciales} que buscan el autoconsumo colectivo|En un entorno urbano como [MUNICIPIO], la optimización del espacio en azoteas es la clave para la eficiencia fotovoltaica}."
      : habCount < 5000 
        ? "{En [MUNICIPIO], predominan las viviendas unifamiliares, {naves agrícolas|cubiertas amplias} y tejados despejados, lo que {simplifica enormemente|facilita} el montaje|La baja densidad de [MUNICIPIO] permite que los paneles solares rindan al máximo sin interferencia de sombras de edificios colindantes}."
        : "{El tejido residencial de [MUNICIPIO] es ideal para el autoconsumo, {combinando viviendas pareadas con pequeñas zonas industriales|mezclando adosados con equipamiento local de alta radiación}}.",
    `${municipio}-urban-ctx`, vars
  );

  const steps: Step[] = [
    {
      number: 1,
      title: "Estudio técnico de la vivienda",
      duration: "1–3 días",
      icon: "1",
      detail: generateDynamicText(
        "{Un técnico especializado|Un ingeniero de nuestro equipo} visita tu vivienda en [MUNICIPIO] para realizar el proyecto fotovoltaico inicial. {Analiza la orientación y sombras|Verifica la superficie útil y el estado del tejado} para que cada panel instalado sea una inversión de alta calidad.",
        `${municipio}-step1-detail`, vars
      ),
      tip: generateDynamicText(
        "{Pide siempre un proyecto técnico detallado|Solicita que el presupuesto deslose cada panel y accesorio|Compara la experiencia técnica de los instaladores en la provincia} para asegurar que tu sistema en [MUNICIPIO] sea veraz y duradero.",
        `${municipio}-step1-tip`, vars
      ),
    },
    {
      number: 2,
      title: "Diseño y presupuesto personalizado",
      duration: "3–5 días",
      icon: "2",
      detail: generateDynamicText(
        "{El instalador diseña el sistema fotovoltaico para [MUNICIPIO]|Se elabora una memoria técnica que incluye el dimensionamiento|Se proyecta el esquema energético basado en tu consumo real}. El presupuesto final en [PROVINCIA] suele situarse en torno a los [PRECIO] para una instalación equilibrada.",
        `${municipio}-step2-detail`, vars
      ),
      tip: "{Exige que el estudio técnico de [MUNICIPIO] incluya un cálculo de ROI y amortización real|Verifica que los equipos propuestos tengan al menos 15 años de garantía de producto}.",
    },
    {
      number: 3,
      title: "Permisos y licencias municipales",
      duration: isUrban ? "15–30 días" : "7–15 días",
      icon: "3",
      detail: generateDynamicText(
        "{Es necesario tramitar la licencia de obra menor o declaración responsable ante el Ayuntamiento de [MUNICIPIO]|La normativa local requiere la validación administrativa del proyecto fotovoltaico en [MUNICIPIO]|Se debe presentar la documentación técnica requerida por los servicios urbanísticos de [MUNICIPIO]}. {En zonas urbanas el plazo es superior|En municipios de [PROVINCIA] la tramitación suele ser ágil}. " + 
        (hasIbi ? "{No olvides solicitar la bonificación del [IBI]% en el IBI de [MUNICIPIO]|Recuerda que tienes derecho a un descuento del [IBI]% en tu impuesto de bienes inmuebles}." : ""),
        `${municipio}-step3-detail`, vars
      ),
      tip: hasIbi
        ? generateDynamicText("{Importante: la bonificación del [IBI]% en el IBI de [MUNICIPIO] debe solicitarse expresamente|La ayuda local en [MUNICIPIO] no es automática, requiere presentar el CIE legalizado}.", `${municipio}-step3-tip`, vars)
        : "{Consulta si el Ayuntamiento de [MUNICIPIO] aplica el 95% de bonificación en el ICIO para proyectos de energía renovable}.",
    },
    {
      number: 4,
      title: "Instalación y montaje",
      duration: "1–3 días",
      icon: "4",
      detail: generateDynamicText(
        "{El equipo de montaje fija la estructura de alta calidad e instala cada panel solar en tu cubierta de [MUNICIPIO]|Nuestra empresa colaboradora integra el sistema fotovoltaico en tu vivienda cumpliendo los estándares de seguridad en [PROVINCIA]}. Un proceso rápido que busca mejorar tu economía personal.",
        `${municipio}-step4-detail`, vars
      ),
      tip: generateDynamicText(
        "{Verifica que el panel y la estructura sean resistentes a la intemperie en [PROVINCIA]|Asegura que te entreguen el certificado de equipo firmado por un profesional colegiado}.",
        `${municipio}-step4-tip`, vars
      ),
    },
    {
      number: 5,
      title: "Legalización y conexión a red",
      duration: "15–45 días",
      icon: "5",
      detail: generateDynamicText(
        "{Se tramita el Certificado de Instalación Eléctrica (CIE) ante Industria de [PROVINCIA]|El instalador registra la planta fotovoltaica en el RAIPRE de [COMUNIDAD]|Se formaliza el cambio de modalidad a autoconsumo con excedentes (RD 244/2019)}. Este paso es vital para activar la compensación simplificada de excedentes en tu factura de luz.",
        `${municipio}-step5-detail`, vars
      ),
      tip: "{Una vez legalizada, descarga la app de monitorización para ver el ahorro generado en [MUNICIPIO] en tiempo real}.",
    },
    {
      number: 6,
      title: "Producción y monitorización",
      duration: "Vida útil 25+ años",
      icon: "6",
      detail: generateDynamicText(
        "{Desde el momento de la conexión, tu vivienda en [MUNICIPIO] se convierte en una central de energía limpia|Al amanecer, tu sistema empieza a generar electricidad cubriendo el consumo base de tu hogar en [PROVINCIA]|Cada kWh producido en [MUNICIPIO] supone un ahorro directo al precio actual de la luz}. {El mantenimiento es mínimo y la amortización es segura|Los paneles actuales rinden por encima del 87% incluso tras 25 años}.",
        `${municipio}-step6-detail`, vars
      ),
      tip: "{Recuerda limpiar los paneles una vez al año para mantener la eficiencia máxima en [MUNICIPIO]}.",
    },
  ];
  return { steps, urbanContext };
}

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

  const { steps, urbanContext } = buildSteps(muniClean, provClean, comClean, h, bonIbi, precioMedio, habitantes ? Number(habitantes) : null);

  const totalDays = "30–60 días";
  const yearNow = new Date().getFullYear();

  const title = generateDynamicText(
    "{Hoja de ruta solar para [MUNICIPIO] — Guía [YEAR]|Cómo instalar placas solares en [MUNICIPIO] paso a paso|Tiempos y trámites de instalación en [MUNICIPIO] ([YEAR])}",
    `${muniClean}-timeline-title`, { MUNICIPIO: muniClean, YEAR: String(yearNow) }
  );

  return (
    <section className="bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 font-manrope mt-10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <div className="px-8 py-10 md:px-12 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-600">Proceso Verificado {yearNow}</p>
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

      <div className="px-8 py-10 md:px-12">
        <div className="relative">
          <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-500 via-blue-400 to-slate-200 rounded-full" aria-hidden />

          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="relative flex gap-8 group">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-200/50 text-base font-black text-indigo-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {step.number}
                </div>

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
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4 items-start">
                      <div className="h-6 w-6 shrink-0 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs shadow-lg shadow-emerald-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Consejo Experto</p>
                        <p className="text-sm text-emerald-800 font-bold leading-snug">
                          {generateDynamicText(step.tip, `${municipio}-tip-${step.number}`, { MUNICIPIO: municipio })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
