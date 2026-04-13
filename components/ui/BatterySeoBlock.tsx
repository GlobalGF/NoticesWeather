import React from "react";
import { parseMarkdown } from "@/lib/utils/text";

type BatterySeoBlockProps = {
  municipio: string;
  provincia: string;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
  habitantes?: number | null;
};

/* ── Helpers ────────────────────────────────────────────────────── */

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

function getClimateZone(irrad: number, horas: number): "surCalido" | "mediterraneo" | "atlantico" | "continental" {
  if (irrad >= 1900 || horas >= 2800) return "surCalido";
  if (irrad >= 1600 || horas >= 2400) return "mediterraneo";
  if (horas < 1800 || irrad < 1350) return "atlantico";
  return "continental";
}

/* ── Component ──────────────────────────────────────────────────── */

import { generateDynamicText } from "@/lib/pseo/spintax";

export function BatterySeoBlock({
  municipio,
  provincia,
  irradiacionAnual,
  horasSol,
  habitantes,
}: BatterySeoBlockProps) {
  const irrad = irradiacionAnual ?? 1650;
  const horas = horasSol ?? 2500;
  const zona = getClimateZone(irrad, horas);

  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    HORAS: String(horas),
    IRRAD: String(irrad),
  };

  const introSpintax = "{Instalar un sistema de baterías fotovoltaicas en [MUNICIPIO] es clave para maximizar el grado de autoconsumo en tu hogar|¿Por qué depender de la red eléctrica si puedes utilizar tu propia energía almacenada en [MUNICIPIO]?|La clave del ahorro energético total en [MUNICIPIO] pasa por un almacenamiento eficiente}. " +
    "{Con [HORAS] horas de sol, la acumulación permite que tu consumo se reduzca drásticamente incluso durante la noche|Los expertos recomiendan incluir baterías virtuales o físicas para exprimir cada kilovatio generado en la provincia de [PROVINCIA]|Integrar baterías de litio en tu instalación fotovoltaica garantiza una autonomía real insuperable}.";

  const climateAdviceSpintax = {
    surCalido: "{Al tratarse de una zona de alta irradiación como [MUNICIPIO], es vital instalar la batería en un lugar fresco y protegido|En el clima cálido de [PROVINCIA], los equipos de baterías requieren una ubicación bien ventilada para mantener su máxima capacidad}. {La vida útil de los sistemas de litio se preserva mejor si están resguardados del calor extremo de [MUNICIPIO]|Garantizar una disipación térmica adecuada es esencial en esta región para no comprometer el rendimiento}.",
    mediterraneo: "{El clima de [MUNICIPIO] es ideal para generar energía, pero las baterías requieren precaución técnica extra|Para proyectos residenciales en [MUNICIPIO], aconsejamos encarecidamente una ubicación sombreada que mantenga el entorno del acumulador estable}. {Evitar la radiación solar directa sobre la envolvente del equipo es vital a largo plazo|La humedad costera predominante en [PROVINCIA] también impone el uso de anclajes con protección IP65}.",
    atlantico: "{En [MUNICIPIO], la radiación difusa es frecuente y la elevada humedad de [PROVINCIA] es el verdadero reto técnico|Asegurar que el sistema de almacenamiento cuente con estanqueidad total es primordial en [MUNICIPIO]}. {Mantener el funcionamiento ininterrumpido requiere proteger la tecnología frente a la corrosión ambiental|Un montaje robusto adaptado al clima del norte garantiza que no se produzcan mermas de capacidad por fallos estructurales}.",
    continental: "{Los fuertes contrastes térmicos de [PROVINCIA] exigen emplear baterías con un amplio rango de temperatura operativa en [MUNICIPIO]|En zonas del interior, contar con energía de reserva es vital para las frías noches de invierno en [MUNICIPIO]}. {Un control térmico adecuado garantiza un funcionamiento sin sobresaltos tanto en las olas de calor como en episodios de frío gélido|Proteger el recinto de acumulación de posibles heladas es el factor determinante para la durabilidad de las celdas}.",
  };

  const habCount = habitantes || 0;
  const urbanContext = generateDynamicText(
    habCount > 50000
      ? "{En grandes ciudades como [MUNICIPIO], un banco de baterías compacto es la solución ideal para optimizar el autoconsumo en entornos residenciales de alta densidad|En un entorno urbano densamente poblado como [MUNICIPIO], el almacenamiento físico permite solventar los desajustes tarifarios con total efectividad}."
      : habCount < 5000
        ? "{En zonas rurales ubicadas en [MUNICIPIO], la acumulación en baterías facilita una independencia energética excepcional del suministro convencional|Potenciar tu autonomía ante cortes de red en [MUNICIPIO] es altamente viable integrando equipos de litio en tu tejado}."
        : "{El auge del autoconsumo en [MUNICIPIO] está propiciando la transición masiva hacia instalaciones híbridas de nueva generación|Invertir en almacenamiento local en [MUNICIPIO] elimina drásticamente tu exposición a la volatilidad diaria de los precios eléctricos}.",
    `${municipio}-urban-battery`, vars
  );

  const dataText = generateDynamicText(
    "{Considerando una radiación de [IRRAD] kWh/m², una vivienda unifamiliar en [MUNICIPIO] es capaz de recargar un módulo de 5kWh en apenas unas horas|Los registros solares de la provincia de [PROVINCIA] corroboran que existen ventanas de irradiación más que amplias para completar ciclos diarios|La rentabilidad estructural escala significativamente si se almacena el excedente diurno en lugar de volcarlo a la red a precio regulado}.",
    `${municipio}-battery-data`, vars
  );

  const intro = generateDynamicText(introSpintax, `${municipio}-battery-intro`, vars);
  const expertAdvice = generateDynamicText(climateAdviceSpintax[zona] || climateAdviceSpintax.continental, `${municipio}-battery-expert`, vars);
  const closing = generateDynamicText(
    "{Si te planteas dar el paso hacia el almacenamiento total en [MUNICIPIO], te sugerimos dimensionar el banco de litio con precisión milimétrica|Mejora tu resiliencia ante cortes y cambios de tarifa en [PROVINCIA] optando por esquemas híbridos de última generación}.",
    `${municipio}-battery-closing`, vars
  );

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">¿Compensa la batería solar en {municipio}?</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed font-medium text-base md:text-lg">
              {parseMarkdown(intro)}
            </p>
            <p className="text-slate-600 leading-relaxed text-sm border-l-4 border-blue-500 pl-4 py-1 italic">
              {parseMarkdown(urbanContext)}
            </p>
          </div>
          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10">
               <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
            </div>
            <p className="text-blue-900 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
               Atención Técnica en {municipio}:
            </p>
            <p className="text-base text-blue-800 font-medium leading-relaxed italic relative z-10">
              "{parseMarkdown(expertAdvice)}"
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          <div className="flex-1">
            <h3 className="text-xl font-black mb-4 text-white tracking-tight">Análisis del Proyecto: {irrad} kWh/m²</h3>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
              {parseMarkdown(dataText)} {parseMarkdown(closing)}
            </p>
          </div>
          <div className="shrink-0 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center min-w-[200px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Autonomía Real</p>
            <p className="text-5xl font-black text-blue-400 tracking-tighter">+70%</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Estimada en {provincia}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
