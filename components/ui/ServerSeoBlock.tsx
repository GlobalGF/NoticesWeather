import { parseMarkdown } from "@/lib/utils/text";
import { generateDynamicText } from "@/lib/pseo/spintax";

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
  
  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    GHI: ghiStr ?? "alta",
    IRRAD: fmt(irradiacionAnual),
    HORAS: fmt(horasSol),
    AH_EUR: fmt(ahorroEstimado),
    IBI: String(Math.round(bonificacionIbi || 0)),
  };

  const titleSpintax = {
    morning: "{Potencial de energía solar esta mañana en [MUNICIPIO]|Rendimiento de cada panel fotovoltaico hoy en [MUNICIPIO]|Estado del proyecto solar residencial en [MUNICIPIO]|Generación de luz solar matutina en [MUNICIPIO] (Análisis)|Cómo rinde un sistema fotovoltaico esta mañana en [MUNICIPIO]}",
    afternoon: "{Balance de energía fotovoltaica esta tarde en [MUNICIPIO]|Producción de cada panel solar hoy en [MUNICIPIO]|Rendimiento del sistema fotovoltaico en [MUNICIPIO] ([PROVINCIA])|Estado de la generación de luz solar en [MUNICIPIO]|Análisis técnico: energía solar y ahorro hoy en [MUNICIPIO]}",
    night: "{Resumen de energía solar del día en [MUNICIPIO]|Balance de ahorro y luz fotovoltaica diaria en [MUNICIPIO]|Resultados del sistema solar instalado en [MUNICIPIO]|Estudio de economía solar en la vivienda en [MUNICIPIO]|Datos finales: energía fotovoltaica hoy en [MUNICIPIO]}",
  };

  const weatherSpintaxDetail: Record<string, string> = {
    sunny: "{Bajo el cielo despejado de [MUNICIPIO], el rendimiento actual de un **panel solar** es excepcionalmente alto|Las condiciones atmosféricas en [PROVINCIA] garantizan que cualquier instalación fotovoltaica en [MUNICIPIO] opere a un altísimo rendimiento hoy|Escenario ideal: la producción de energía renovable en [MUNICIPIO] se prevé excelente para la jornada de hoy}. {Las mediciones actuales ([GHI]) permiten proyectar un importante ahorro para las viviendas locales|Nuestros registros confirman unos niveles de irradiancia de [GHI] que aceleran la amortización residencial desde este preciso instante}.",
    cloudy: "{A pesar de la nubosidad presente en [MUNICIPIO], el campo fotovoltaico sigue captando valiosa energía difusa|El cielo cubierto en [PROVINCIA] no detiene en absoluto tu transición energética en [MUNICIPIO]|Incluso sin impacto solar directo sobre [MUNICIPIO], la radiación consigue mantener un rendimiento operativo estable}. {La eficiencia de las placas monocristalinas de última generación permite generar electricidad incluso con luz indirecta ([GHI])|El flujo de energía fotovoltaica en [MUNICIPIO] no cesa, evidenciando la resiliencia tecnológica de los módulos actuales}.",
    rainy: "{Las precipitaciones sobre [MUNICIPIO] contribuyen a limpiar de forma natural la superficie del panel, optimizando su rendimiento a largo plazo|Incluso en días lluviosos, la instalación en [MUNICIPIO] conserva cierta capacidad de producción ayudando a estabilizar el coste mensual|El frente lluvioso actual en [PROVINCIA] no inactiva la generación renovable en [MUNICIPIO]}. {La tecnología fotovoltaica sigue captando un remanente de energía ambiental ([GHI]) para alimentar los consumos básicos de la vivienda|La extraordinaria sensibilidad de los diodos permite rascar cada vatio posible incluso bajo condiciones de lluvia cerrada}.",
    night: "{Con la llegada de la noche a [MUNICIPIO], se completa el ciclo diario de captación y comienza el uso de excedentes almacenados|Pausa solar nocturna en [MUNICIPIO]: es el momento en que las instalaciones con batería demuestran su máximo valor}. {Finaliza un periodo donde se ha logrado afianzar la independencia de la red eléctrica convencional en [PROVINCIA]|La jornada ha concluido reduciendo drásticamente la huella de carbono y contribuyendo al balance positivo de la vivienda}.",
  };

  const dataTemplates = [
    `{Un proyecto de energía solar residencial en [MUNICIPIO] se fundamenta sobre una espectacular irradiación histórica anual de [IRRAD] kWh/m²|Las coordenadas geográficas de [MUNICIPIO] permiten a los tejados aprovechar [IRRAD] kWh/m² de irradiación cada año natural}. {Respaldados por [HORAS] horas de sol directo, se puede configurar una matriz fotovoltaica extremadamente predecible y estable|Gracias al incesante aporte de [HORAS] h de sol registradas, amortizar un sistema energético propio en [PROVINCIA] es una certeza matemática}.`,
    `{Avanzar hacia la transición energética en [MUNICIPIO] permite atenuar drásticamente tu factura, posibilitando recortes que frecuentan los [AH_EUR] € anuales|El volumen de ahorro estimado de un montaje base en [MUNICIPIO] ronda unos consistentes [AH_EUR] €}. {Esta magnitud de rentabilidad se cimenta al equipar viviendas con módulos monocristalinos de vanguardia|Es una apuesta clara por la sostenibilidad que no sólo eleva el valor del inmueble, sino que se recupera de manera pasiva y acelerada}.`,
    `{A esto se suman las iniciativas locales: la ordenanza municipal de [MUNICIPIO] regula bonificaciones del [IBI]% en las cuotas del IBI|Existe un aliciente fiscal muy potente del [IBI]% sobre el tributo de bienes inmuebles en [MUNICIPIO] específico para viviendas con autoconsumo}. {Este mecanismo municipal actúa como el catalizador definitivo para la adopción fotovoltaica en la zona|Es, sin duda, una política decisiva promulgada por el Ayuntamiento de [MUNICIPIO] cuyo propósito es abaratar drásticamente el salto tecnológico}.`,
  ];

  const closingSpintax = "{En resumen, abrazar la producción **fotovoltaica** en [MUNICIPIO] significa apostar sobre seguro y reducir definitivamente tu huella ecológica|A la luz de la información expuesta, los marcadores climatológicos de [PROVINCIA] atestiguan el enorme potencial para electrificar tu vivienda con luz del sol en [MUNICIPIO]|Dimensionar un montaje sólido en [MUNICIPIO] garantiza aislarse contundentemente contra las inevitables fluctuaciones futuras de las tarifas eléctricas convencionales}.";

  const title = generateDynamicText(titleSpintax[time], `${municipio}-title-${time}`, vars);
  const opening = generateDynamicText(time === "night" ? weatherSpintaxDetail.night : weatherSpintaxDetail[weatherBucket], `${municipio}-open-${time}-${weatherBucket}`, vars);
  
  const dataParagraphs: string[] = [];
  if (irradiacionAnual && horasSol) dataParagraphs.push(generateDynamicText(dataTemplates[0], `${municipio}-data1`, vars));
  if (ahorroEstimado && ahorroEstimado > 100) dataParagraphs.push(generateDynamicText(dataTemplates[1], `${municipio}-data2`, vars));
  if (bonificacionIbi != null && bonificacionIbi > 0) dataParagraphs.push(generateDynamicText(dataTemplates[2], `${municipio}-data3`, vars));

  const closing = generateDynamicText(closingSpintax, `${municipio}-close`, vars);
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
