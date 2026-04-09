import React from "react";

type AntiCommercialWarningProps = {
  municipio: string;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
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

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

/* ── Classification ─────────────────────────────────────────────── */

type Perfil = "optimo" | "favorable" | "viable" | "limitado";

function getPerfil(horasSol: number | null, irrad: number | null): Perfil {
  const h = Number(horasSol ?? 1800);
  const i = Number(irrad ?? 1600);
  if (h >= 2600 && i >= 1800) return "optimo";
  if (h >= 2000 && i >= 1500) return "favorable";
  if (h < 1400 || i < 1300) return "limitado";
  return "viable";
}

const perfilConfig = {
  optimo: {
    title: (m: string) => [
      `Condiciones excepcionales para autoconsumo en ${m}`,
      `${m}: perfil ideal para instalar placas solares`,
      `Tu vivienda en ${m} tiene el mejor escenario solar posible`,
    ],
    intro: (m: string) => [
      `La ubicación de ${m} ofrece un recurso solar de primer nivel en España. Para aprovechar al máximo estas condiciones óptimas, verifica estos puntos clave de tu vivienda:`,
      `Con las horas de sol que recibe ${m}, el autoconsumo fotovoltaico es especialmente rentable. Antes de solicitar presupuesto, confirma estos requisitos técnicos:`,
      `${m} se encuentra entre las zonas con mayor potencial solar de la Península. Para que la instalación rinda al máximo, tu vivienda debe cumplir estos criterios:`,
    ],
    closing: (m: string) => [
      `Con el perfil solar de ${m}, la mayoría de viviendas bien orientadas alcanzan amortizaciones de 5–6 años. Solicita un estudio 3D de cubiertas para confirmar el rendimiento exacto.`,
      `Las condiciones en ${m} permiten generar excedentes significativos incluso en invierno. Un estudio técnico personalizado determinará la configuración óptima para tu cubierta.`,
    ],
  },
  favorable: {
    title: (m: string) => [
      `¿Tu vivienda en ${m} reúne las condiciones para instalar paneles?`,
      `Requisitos clave antes de instalar placas solares en ${m}`,
      `Checklist de instalación fotovoltaica para viviendas en ${m}`,
    ],
    intro: (m: string) => [
      `${m} cuenta con un recurso solar favorable para el autoconsumo. Para garantizar que tu inversión rinda al máximo, comprueba que tu vivienda cumple estos requisitos técnicos:`,
      `La irradiación solar en ${m} supera la media europea y permite amortizaciones rápidas. Antes de contratar, verifica que tu tejado cumple estas condiciones:`,
      `Instalar placas solares en ${m} es una decisión rentable para la mayoría de viviendas. Te recomendamos revisar estos puntos para asegurar el máximo rendimiento:`,
    ],
    closing: (m: string) => [
      `En ${m}, las instalaciones bien diseñadas se amortizan en 6–8 años. Pide siempre un estudio 3D completo antes de aceptar cualquier presupuesto.`,
      `La clave en ${m} es el dimensionamiento correcto: ni sobredimensionar (excedentes mal pagados) ni quedarse corto. Un instalador certificado calculará las necesidades exactas.`,
    ],
  },
  viable: {
    title: (m: string) => [
      `¿Merece la pena instalar placas solares en ${m}? Requisitos a revisar`,
      `Evaluación técnica: ¿es tu vivienda en ${m} apta para paneles solares?`,
      `Guía de viabilidad para autoconsumo fotovoltaico en ${m}`,
    ],
    intro: (m: string) => [
      `El recurso solar de ${m} permite instalaciones rentables, pero el diseño técnico marca la diferencia. Es especialmente importante que tu vivienda cumpla estos criterios:`,
      `En ${m}, la rentabilidad del autoconsumo depende más de la calidad de la instalación que en zonas de alta irradiación. Revisa estos puntos antes de decidir:`,
      `Aunque ${m} no está en el cinturón de máxima radiación, la subida de la factura eléctrica hace viable el autoconsumo. Confirma estos requisitos previos:`,
    ],
    closing: (m: string) => [
      `Para viviendas en ${m}, recomendamos paneles de alta eficiencia (>21%) y un dimensionamiento conservador ajustado al consumo real. El sobredimensionamiento penaliza en esta zona.`,
      `En ${m}, un estudio 3D es imprescindible: cada grado de inclinación y cada sombra tienen mayor impacto en la producción que en zonas de alta irradiación.`,
    ],
  },
  limitado: {
    title: (m: string) => [
      `Consideraciones importantes antes de instalar paneles solares en ${m}`,
      `¿Es rentable el autoconsumo en ${m}? Análisis honesto`,
      `Lo que debes saber antes de poner placas solares en ${m}`,
    ],
    intro: (m: string) => [
      `El recurso solar en ${m} es más contenido que la media española, pero sigue superando a países como Alemania donde la fotovoltaica es rentable. Para asegurar viabilidad económica, tu vivienda debe cumplir estrictamente estos requisitos:`,
      `En ${m}, la inversión en autoconsumo requiere un diseño más cuidadoso que en zonas de alta radiación. Es fundamental que tu vivienda cumpla estos criterios antes de decidir:`,
      `Instalar paneles solares en ${m} puede ser rentable, pero no en todas las viviendas. Una evaluación técnica rigurosa es imprescindible. Revisa estos puntos:`,
    ],
    closing: (m: string) => [
      `Dado el recurso solar de ${m}, confía únicamente en instaladores que ofrezcan estudio 3D con simulación de producción mensual. Desconfía de presupuestos genéricos.`,
      `En ${m} es especialmente crucial un análisis de sombras detallado y una orientación perfecta. Si tu tejado tiene orientación norte predominante, el autoconsumo puede no ser viable.`,
    ],
  },
};

const checklistVariations = [
  [
    { bold: "Cubierta en buen estado:", text: "Tu tejado debe estar libre de desgaste estructural o materiales protegidos como la uralita (amianto). Si el tejado necesita reforma, es mejor hacerla antes de la instalación." },
    { bold: "Orientación al sur:", text: "Disponer de superficie orientada al sur (±30°) es ideal. Orientaciones este u oeste también son viables con un 10–15% menos de producción." },
    { bold: "Ausencia de sombras:", text: "Sin edificios, chimeneas o árboles que proyecten sombra sobre el tejado entre las 10:00 y las 17:00 horas." },
    { bold: "Consumo mínimo 40 €/mes:", text: "La rentabilidad se dispara con facturas superiores a 50 €/mes. Por debajo de 30 €, el plazo de amortización se alarga." },
  ],
  [
    { bold: "Tejado sin amianto:", text: "La normativa prohíbe instalar sobre cubiertas con fibrocemento (uralita). Si la tienes, la retirada debe hacerse antes por empresa autorizada." },
    { bold: "Superficie libre suficiente:", text: "Cada kWp necesita ~5 m² de superficie. Para una instalación de 4 kWp, necesitas al menos 20 m² orientados al sur o suroeste." },
    { bold: "Sin sombreado en horas clave:", text: "Las sombras entre las 9 h y las 18 h reducen la producción drásticamente. Un análisis con lidar o dron detecta obstrucciones no visibles a simple vista." },
    { bold: "Potencia contratada ≥3,45 kW:", text: "Hogares con potencias muy bajas (<2,3 kW) no suelen justificar la inversión. Verifica tu factura antes de solicitar presupuesto." },
  ],
  [
    { bold: "Estado estructural correcto:", text: "El forjado debe soportar ~15 kg/m² adicionales (peso del panel + estructura). En cubiertas antiguas, un ingeniero debe validar la carga máxima admisible." },
    { bold: "Orientación e inclinación:", text: "Inclinación óptima en España: 30–35° orientación sur. Las cubiertas planas permiten instalar estructura regulable para la inclinación perfecta." },
    { bold: "Accesibilidad para mantenimiento:", text: "Los paneles necesitan limpieza anual y revisión eléctrica cada 3–5 años. El acceso debe ser seguro y conforme al CTE." },
    { bold: "Ratio consumo/producción:", text: "Lo ideal es que la instalación cubra el 60–80% del consumo anual. Sobredimensionar genera excedentes que solo se compensan a ~0,05 €/kWh." },
  ],
  [
    { bold: "Cubierta libre de amianto:", text: "La presencia de fibrocemento (uralita) es incompatible con la instalación fotovoltaica. Su retirada por empresa certificada es obligatoria." },
    { bold: "Mínimo 15–20 m² orientados al sur:", text: "Para una instalación doméstica (3–5 kWp), necesitas un mínimo de 15 m² de cubierta útil sin obstrucciones." },
    { bold: "Sombras limitadas a horas extremas:", text: "Sombras al amanecer/atardecer son aceptables; entre las 10 h y las 16 h, cualquier sombra reduce la producción un 20–40%." },
    { bold: "Factura eléctrica justificable:", text: "El autoconsumo es rentable a partir de 50 €/mes de factura media. Con batería, la viabilidad aumenta si superas los 70 €/mes." },
  ],
];

export function AntiCommercialWarning({ municipio, irradiacionAnual, horasSol }: AntiCommercialWarningProps) {
  const muniClean = cleanName(municipio);
  const h = hash(municipio);
  const perfil = getPerfil(horasSol, irradiacionAnual);
  const cfg = perfilConfig[perfil];

  const title = pick(cfg.title(muniClean), h, 0);
  const intro = pick(cfg.intro(muniClean), h, 1);
  const closing = pick(cfg.closing(muniClean), h, 2);
  const checklist = pick(checklistVariations, h, 3);

  return (
    <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 mt-6 mb-8 text-left shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            {intro}
          </p>
          <ul className="text-slate-600 text-sm space-y-3 mb-5">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                <span><strong>{item.bold}</strong> {item.text}</span>
              </li>
            ))}
          </ul>

          <p className="text-slate-500 text-xs bg-white rounded-lg p-3 border border-slate-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            {closing}
          </p>
        </div>
      </div>
    </section>
  );
}
