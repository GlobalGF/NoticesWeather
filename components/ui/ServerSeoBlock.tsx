import { parseMarkdown } from "@/lib/utils/text";

type ServerSeoBlockProps = {
  municipio: string;
  provincia: string;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
  ahorroEstimado?: number | null;
  bonificacionIbi?: number | null;
  precioMedioLuz?: number;
  weather?: {
    temp_c: number;
    condition: string;
    uv: number;
    is_day: number;
    ghi?: number | null;
    short_rad?: number | null;
  } | null;
  snapshot?: any | null;
  habitantes?: number | null;
};

function getTimeSlot(): "morning" | "afternoon" | "night" {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 21) return "afternoon";
  return "night";
}

function getWeatherBucket(condition?: string | null): "sunny" | "cloudy" | "rainy" {
  if (!condition) return "sunny";
  const c = condition.toLowerCase();
  if (c.includes("lluvia") || c.includes("tormenta") || c.includes("rain") || c.includes("thunder")) return "rainy";
  if (c.includes("nub") || c.includes("overcast") || c.includes("cloud") || c.includes("mist") || c.includes("fog")) return "cloudy";
  return "sunny";
}

function fmt(n: number | null | undefined, d = 0): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "0";
  try {
    return Number(n).toLocaleString("es-ES", { maximumFractionDigits: d });
  } catch {
    return String(n);
  }
}

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], hash: number, offset: number): T {
  if (!arr || arr.length === 0) return "" as any;
  return arr[(hash + offset) % arr.length];
}

export function ServerSeoBlock({
  municipio,
  provincia,
  irradiacionAnual,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioMedioLuz = 0.22,
  weather,
  snapshot,
  habitantes,
}: ServerSeoBlockProps) {

  const time = getTimeSlot();
  const ghi = weather?.ghi ?? weather?.short_rad ?? null;
  const weatherBucket = weather ? getWeatherBucket(weather.condition) : "sunny";
  const ghiStr = ghi ? `${Math.round(ghi)} W/m²` : null;
  const hashId = getStringHash(`${municipio}-${time}-${weatherBucket}`);

  const titles = {
    morning: [
      `Potencial de energía solar esta mañana en ${municipio}`,
      `Rendimiento de cada panel fotovoltaico hoy en ${municipio}`,
      `Estado del proyecto solar residencial en ${municipio}`,
      `Generación de luz solar matutina en ${municipio} (Análisis)`,
      `Cómo rinde un sistema fotovoltaico esta mañana en ${municipio}`,
    ],
    afternoon: [
      `Balance de energía fotovoltaica esta tarde en ${municipio}`,
      `Producción de cada panel solar hoy en ${municipio}`,
      `Rendimiento del sistema fotovoltaico en ${municipio} (${provincia})`,
      `Estado de la generación de luz solar en ${municipio}`,
      `Análisis técnico: energía solar y ahorro hoy en ${municipio}`,
    ],
    night: [
      `Resumen de energía solar del día en ${municipio}`,
      `Balance de ahorro y luz fotovoltaica diaria en ${municipio}`,
      `Resultados del sistema solar instalado en ${municipio}`,
      `Estudio de economía solar en la vivienda en ${municipio}`,
      `Datos finales: energía fotovoltaica hoy en ${municipio}`,
    ],
  };

  const openingsWeather: Record<string, string[]> = {
    sunny: [
      `Bajo el cielo despejado de ${municipio}, el rendimiento de cada **panel solar** es óptimo hoy. Nuestra **empresa** analiza la irradiancia actual (${ghiStr ?? "alta"}) para proyectar el ahorro real de cada **cliente**.`,
      `La calidad de la **luz solar** en la provincia de ${provincia} garantiza que cualquier **sistema fotovoltaico** en ${municipio} opere a pleno rendimiento. El equipo técnico confirma niveles de ${ghiStr ?? "máxima eficiencia"}.`,
      `Un buen **proyecto solar** en ${municipio} aprovecha cada rayo de luz hoy. La **energía fotovoltaica** inyectada reduce directamente tu gasto eléctrico.`,
      `Escenario ideal: la producción de **energía solar** en ${municipio} hoy es excelente, lo que mejora la **economía** de la vivienda desde el primer minuto.`,
    ],
    cloudy: [
      `A pesar de las nubes en ${municipio}, el **sistema fotovoltaico** sigue captando energía. La **calidad** de los paneles monocristalinos permite generar luz incluso con radiación difusa (${ghiStr ?? "estable"}).`,
      `El cielo cubierto en ${provincia} no detiene tu **ahorro solar**. El **equipo** de ingeniería en ${municipio} monitoriza cómo cada **panel** sigue aportando a tu **cuenta de la luz**.`,
      `Incluso sin sol directo en ${municipio}, la **atención** técnica se centra en el rendimiento basal de la **energía fotovoltaica** ambiental.`,
      `Día nublado, pero el flujo de **energía solar** en ${municipio} no cesa; tu **empresa** instaladora asegura un funcionamiento continuo del **sistema**.`,
    ],
    rainy: [
      `La lluvia en ${municipio} limpia cada **panel solar** de forma natural, mejorando su **eficiencia** futura mientras siguen captando luz ambiental (${ghiStr ?? "mínima"}).`,
      `En días de lluvia, la **energía fotovoltaica** en ${municipio} se reduce, pero el **cliente** sigue ahorrando gracias a la sensibilidad de los **sistemas** actuales.`,
      `Frente lluvioso en ${provincia}: tu **proyecto solar** en ${municipio} sigue operativo, restando cada vatio posible a tu **cuenta de la luz**.`,
    ],
    night: [
      `Con la caída de la noche en ${municipio}, termina el ciclo de generación de la **energía solar**, acumulando el ahorro conseguido para tu **economía** doméstica.`,
      `Pausa solar nocturna en ${municipio}: el **sistema fotovoltaico** descansa habiendo reducido tu dependencia de la red eléctrica en la provincia de ${provincia}.`,
    ],
  };

  const dataParagraphs: string[] = [];
  if (irradiacionAnual && horasSol) {
    dataParagraphs.push(
      `El **proyecto solar** de cualquier vivienda en ${municipio} se apoya en una irradiación anual de ${fmt(irradiacionAnual)} kWh/m². Con ${fmt(horasSol)} horas de sol, la **empresa** instaladora puede garantizar una **energía fotovoltaica** estable durante todo el año.`
    );
  }

  if (ahorroEstimado && ahorroEstimado > 100) {
    dataParagraphs.push(
      `Mejorar la **economía** familiar en ${municipio} es posible reduciendo la **cuenta de la luz** hasta en ${fmt(ahorroEstimado)} € anuales. Este ahorro se basa en la instalación de **paneles** de alta **calidad** adaptados al consumo real del **cliente**.`
    );
  }

  if (bonificacionIbi != null && bonificacionIbi > 0) {
    dataParagraphs.push(
      `Además, la **atención** a las ordenanzas municipales de ${municipio} revela una bonificación del ${Math.round(bonificacionIbi)}% en el IBI, un incentivo clave para cualquier **sistema fotovoltaico** en la zona.`
    );
  }

  const closings = [
    `En conclusión, apostar por la **energía solar** en ${municipio} es una decisión segura para tu **economía** gracias a la robustez de los **sistemas fotovoltaicos** actuales.`,
    `Si buscas una **atención** técnica veraz en ${municipio}, los datos de irradiancia solar en ${provincia} confirman la viabilidad de tu **proyecto** de autoconsumo.`,
    `Cuidar la **calidad** de cada **panel** y del montaje asegura que tu inversión en ${municipio} se amortice rápidamente, bajando tu factura de la **luz** para siempre.`,
  ];

  const title = pick(titles[time], hashId, 0);
  const opening = pick(time === "night" ? openingsWeather.night : openingsWeather[weatherBucket], hashId, 1);
  const closing = pick(closings, hashId, 2);
  const bodyParagraphs = [opening, ...dataParagraphs, closing];

  return (
    <section className="bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 font-manrope mt-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="p-8 md:p-12 lg:p-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-600">Ficha Técnica SSR</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronización Regional</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
          {title}
        </h2>

        <div className="space-y-6">
          {bodyParagraphs.map((p, i) => (
            <div key={i} className="text-lg md:text-xl leading-[1.7] text-slate-600 font-medium max-w-4xl">
              {parseMarkdown(p)}
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 md:px-12 py-6 bg-slate-50/80 border-t border-slate-200/60 backdrop-blur-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Metadatos 2026</span>
          <span className="h-4 w-px bg-slate-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Fuentes: PVGIS/OMIE · Ingeniería SolaryEco
          </p>
        </div>
        <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    </section>
  );
}
