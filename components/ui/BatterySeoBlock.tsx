import React from "react";

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

export function BatterySeoBlock({
  municipio,
  provincia,
  irradiacionAnual,
  horasSol,
  habitantes,
}: BatterySeoBlockProps) {
  const hashId = getStringHash(`${municipio}-battery-seo`);
  const irrad = irradiacionAnual ?? 1650;
  const horas = horasSol ?? 2500;
  const zona = getClimateZone(irrad, horas);

  // ── Introduction variations ──
  const intros = [
    `Instalar una batería solar en ${municipio} es el paso definitivo hacia la independencia energética total. Con ${horas} horas de sol al año, producir energía es fácil; el reto es no regalarla.¹`,
    `¿Por qué depender de la red eléctrica por la noche si puedes usar tu propio sol en ${municipio}? La acumulación fotovoltaica permite maximizar el aprovechamiento de tu tejado en ${provincia}.`,
    `En ${municipio}, el potencial de ahorro con baterías ha crecido exponencialmente. Ya no se trata solo de ahorrar instalando placas, sino de gestionar tus excedentes de forma inteligente.`,
    `La transición energética en ${municipio} entra en una nueva fase: el almacenamiento. Las baterías de litio actuales permiten que tu hogar en ${provincia} sea autónomo incluso cuando el sol se pone.`,
    `Maximiza tu inversión fotovoltaica en ${municipio}. Almacenar el excedente diario para cubrir los picos de consumo nocturnos es la decisión financiera más acertada hoy en día.`,
  ];

  // ── Expert Climate Advice (Heat impact) ──
  const climateAdvice = {
    surCalido: `Al encontrarnos en una zona de alta radiación como ${municipio}, es fundamental que la batería se instale en un lugar fresco y ventilado. El calor extremo puede acelerar la degradación de las celdas de litio; un buen diseño técnico en ${provincia} siempre prevé esta protección.`,
    mediterraneo: `El clima de ${municipio} es ideal para la fotovoltaica, pero recuerda que las baterías operan mejor por debajo de los 30°C. Recomendamos ubicaciones protegidas del sol directo para mantener la garantía y eficiencia a largo plazo.`,
    atlantico: `En ${municipio}, la humedad y las temperaturas suaves son benignas para la electrónica de potencia, pero es vital asegurar un entorno estanco para evitar condensaciones en los terminales de la batería.`,
    continental: `Los contrastes térmicos de ${provincia} exigen que el sistema de gestión de la batería (BMS) sea de alta calidad para equilibrar las celdas tanto en olas de calor como en heladas invernales en ${municipio}.`,
  };

  // ── Urban Context ──
  const habCount = habitantes || 0;
  const urbanContext = habCount > 50000
    ? `En entornos urbanos como ${municipio}, las baterías compactas de pared son la solución preferida para ahorrar en comunidades de vecinos y reducir el término de potencia contratada en horas punta.`
    : habCount < 5000
      ? `En zonas rurales y unifamiliares de ${municipio}, las baterías de alta capacidad permiten incluso la desconexión total de la red o la alimentación de naves agrícolas con excedentes diarios.`
      : `El crecimiento de viviendas pareadas en ${municipio} hace que sistemas híbridos con acumulación sean los más rentables para familias que teletrabajan y consumen energía las 24 horas.`;

  // ── Data paragraphs ──
  const dataText = `Con una irradiación de ${irrad} kWh/m², cada metro cuadrado de tu instalación en ${municipio} es una mina de oro energético. Sin batería, perderías hasta el 60% de esa producción si no estás en casa durante el día.`;

  // ── Assemble ──
  const intro = pick(intros, hashId, 0);
  const expertAdvice = climateAdvice[zona];
  const closing = `Si buscas rentabilidad y seguridad, dimensionar correctamente tu almacenamiento en ${municipio} es clave para amortizar el equipo en menos de 8 años.`;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">¿Realmente compensa la batería en {municipio}?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-slate-600 leading-relaxed font-medium">
              {intro}
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              {urbanContext}
            </p>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex flex-col justify-center">
            <p className="text-amber-900 font-bold mb-2 flex items-center gap-2">
              <span className="text-xl">🌡️</span> Consejo de experto en {municipio}:
            </p>
            <p className="text-sm text-amber-800 italic leading-relaxed">
              "{expertAdvice}"
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3 text-slate-800">El dato técnico: {irrad} kWh/m²</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {dataText} {closing}
            </p>
          </div>
          <div className="shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center min-w-[160px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Independencia</p>
            <p className="text-4xl font-black text-fuchsia-600">+70%</p>
            <p className="text-[10px] text-slate-500 mt-1">Estimada en {provincia}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
