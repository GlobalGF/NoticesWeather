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

  // ── Introduction variations (Honest Keywords) ──
  const intros = [
    `Instalar un sistema de baterías con tu **energía solar** en ${municipio} es clave para mejorar la **economía** del hogar. Con ${horas} horas de sol, el **proyecto fotovoltaico** permite que tu **cuenta de la luz** baje incluso de noche.`,
    `¿Por qué depender de la red si puedes usar tu **luz** guardada en ${municipio}? La **empresa** técnica recomienda **sistemas** de acumulación para maximizar cada **panel** instalado en la provincia de ${provincia}.`,
    `En ${municipio}, la **atención** al ahorro energético pasa por el almacenamiento. Un **equipo** especializado puede integrar baterías de **calidad** en tu **proyecto solar** para darte autonomía real como **cliente**.`,
    `La **energía fotovoltaica** en ${municipio} se optimiza con baterías. El **proyecto** de acumulación asegura que tu **sistema** rinda las 24 horas, protegiendo tu **economía** familiar en ${provincia}.`,
    `Maximiza tu **energía** limpia en ${municipio}. Almacenar el sol en un **equipo** de baterías de **calidad** es la forma más honesta de reducir tu **cuenta de la luz** hoy mismo.`,
  ];

  // ── Expert Climate Advice (Honest/Factual) ──
  const climateAdvice = {
    surCalido: `Al ser una zona de alta **energía solar** como ${municipio}, tu **empresa** debe instalar la batería en un lugar fresco. La **calidad** de los **sistemas** de litio se mantiene mejor si el **equipo** está protegido del calor extremo de ${provincia}.`,
    mediterraneo: `El clima de ${municipio} es ideal para la **energía fotovoltaica**, pero cada **panel** y batería requiere **atención** térmica. Recomendamos que el **proyecto** prevea una ubicación sombreada para no afectar a tu **economía** por degradación.`,
    atlantico: `En ${municipio}, la **luz** ambiental es constante. El **equipo** técnico debe asegurar que el **sistema fotovoltaico** y sus baterías tengan protección contra la humedad de ${provincia} para mantener la **calidad** del servicio.`,
    continental: `Los contrastes de ${provincia} exigen que el **proyecto solar** en ${municipio} use baterías con un BMS de alta **calidad**, garantizando que el **cliente** ahorre en su **cuenta de la luz** tanto en invierno como en verano.`,
  };

  const habCount = habitantes || 0;
  const urbanContext = habCount > 50000
    ? `En ciudades como ${municipio}, un **sistema** de baterías compacto es la solución de **empresa** más buscada para optimizar la **economía** en pisos y comunidades.`
    : habCount < 5000
      ? `En zonas rurales de ${municipio}, el **equipo** de acumulación permite una independencia casi total, haciendo que tu **proyecto fotovoltaico** sea el pilar de tu **energía** diaria.`
      : `El crecimiento de la **energía solar** en ${municipio} favorece los **sistemas** híbridos. Un **cliente** con batería ve cómo su **cuenta de la luz** se reduce drásticamente con una instalación de **calidad**.`;

  const dataText = `Con una irradiación de ${irrad} kWh/m² en ${municipio}, cada **panel** fotovoltaico es una fuente de **luz** inagotable. Sin batería, tu **sistema** desperdiciaría excedentes que son vitales para tu **economía**.`;

  const intro = pick(intros, hashId, 0);
  const expertAdvice = climateAdvice[zona];
  const closing = `Si buscas un **proyecto** serio, dimensionar tu **sistema** en ${municipio} con **atención** profesional es el mejor camino para tu **cuenta de la luz**.`;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">¿Compensa la batería solar en {municipio}?</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed font-medium text-base md:text-lg">
              {intro}
            </p>
            <p className="text-slate-600 leading-relaxed text-sm border-l-4 border-blue-500 pl-4 py-1 italic">
              {urbanContext}
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
              "{expertAdvice}"
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
              {dataText} {closing}
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
