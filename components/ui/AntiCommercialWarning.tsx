import { generateDynamicText } from "@/lib/pseo/spintax";

const perfilConfig = {
  optimo: {
    title: "{Condiciones excepcionales para autoconsumo en [MUNICIPIO]|El escenario solar perfecto en [MUNICIPIO] para tus placas|Radiación máxima en [MUNICIPIO]: perfil ideal para autoconsumo}",
    intro: "{La ubicación de [MUNICIPIO] ofrece un recurso solar de primer nivel en España. Antes de instalar, verifica estos puntos clave en tu tejado de [PROVINCIA]:|[MUNICIPIO] es una de las zonas con mayor potencial fotovoltaico de la Península. Para que rindan al máximo, confirma estos criterios en tu vivienda:|El sol en [MUNICIPIO] garantiza una rentabilidad superior. Comprueba estos requisitos técnicos antes de solicitar presupuesto en [PROVINCIA]:}",
    closing: "{Con el perfil solar de [MUNICIPIO], la mayoría de viviendas bien orientadas amortizan en 5–6 años. Solicita un estudio 3D para confirmar datos.|Las condiciones en [PROVINCIA] permiten generar excedentes significativos. Un dimensionamiento experto en [MUNICIPIO] es clave para el éxito del proyecto.}",
  },
  favorable: {
    title: "{¿Tu vivienda en [MUNICIPIO] es apta para instalar paneles?|Requisitos clave para placas solares en [MUNICIPIO]|Checklist de viabilidad fotovoltaica en [MUNICIPIO]}",
    intro: "{[MUNICIPIO] cuenta con un recurso solar muy favorable para el autoconsumo. Para asegurar que tu inversión rinda al máximo, comprueba estos puntos en [PROVINCIA]:|La irradiación solar en [MUNICIPIO] supera la media y permite retornos rápidos. Verifica que tu tejado en [PROVINCIA] cumple estas condiciones:|Instalar paneles en [MUNICIPIO] es rentable para casi todos. Te recomendamos revisar estos criterios técnicos antes de avanzar:}",
    closing: "{En [MUNICIPIO], una instalación bien diseñada se amortiza en 6–8 años. Pide siempre simulación 3D antes de decidir.|La clave en [MUNICIPIO] es el dimensionamiento justo: ni sobredimensionar ni quedarse corto. Un técnico en [PROVINCIA] debe validar tu caso.}",
  },
  viable: {
    title: "{¿Merece la pena poner placas en [MUNICIPIO]? Requisitos técnicos|Evaluación de viabilidad solar para tu vivienda en [MUNICIPIO]|Guía honesta de autoconsumo fotovoltaico en [MUNICIPIO]}",
    intro: "{El recurso solar de [MUNICIPIO] permite sistemas rentables, pero el diseño técnico en [PROVINCIA] marca la diferencia. Revisa estos criterios prioritarios:|En [MUNICIPIO], la rentabilidad depende de la calidad de los materiales y la orientación en [PROVINCIA]. Confirma estos puntos previos:|Aunque [MUNICIPIO] no es zona de radiación extrema, el precio de la luz hace viable el ahorro. Verifica estos requisitos en tu tejado:}",
    closing: "{Para viviendas en [MUNICIPIO], recomendamos paneles de alta eficiencia y evitar el sobredimensionamiento por excedentes.|En [PROVINCIA], un estudio de sombras detallado es vital: cada grado de inclinación en [MUNICIPIO] cuenta para tu ahorro.}",
  },
  limitado: {
    title: "{Consideraciones antes de instalar paneles solares en [MUNICIPIO]|¿Es rentable el autoconsumo en [MUNICIPIO]? Análisis técnico|Lo que debes saber antes de contratar placas en [MUNICIPIO]}",
    intro: "{El recurso solar en [MUNICIPIO] es más moderado, pero con la luz de [PROVINCIA] sigue siendo factible ahorrar. Tu vivienda debe cumplir estos puntos:|En [MUNICIPIO], la inversión solar requiere un diseño muy cuidadoso. Es fundamental que tu inmueble en [PROVINCIA] cumpla estos requisitos estrictos:|Poner placas en [MUNICIPIO] puede ser rentable, pero no en todos los tejados. Realiza esta comprobación técnica antes de pedir presupuesto:}",
    closing: "{Dado el recurso solar de [PROVINCIA], confía solo en estudios 3D con simulación mensual real para tu casa en [MUNICIPIO].|En [MUNICIPIO] es crucial la orientación perfecta. Si tu cubierta en [PROVINCIA] mira al norte, el proyecto no será viable.}",
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

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

type Perfil = "optimo" | "favorable" | "viable" | "limitado";

function getPerfil(horasSol: number | null, irrad: number | null): Perfil {
  const h = Number(horasSol ?? 1800);
  const i = Number(irrad ?? 1600);
  if (h >= 2600 && i >= 1800) return "optimo";
  if (h >= 2000 && i >= 1500) return "favorable";
  if (h < 1400 || i < 1300) return "limitado";
  return "viable";
}

type AntiCommercialWarningProps = {
  municipio: string;
  provincia?: string | null;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
};

export function AntiCommercialWarning({ municipio, provincia, irradiacionAnual, horasSol }: AntiCommercialWarningProps) {
  const muniClean = cleanName(municipio);
  const provClean = provincia ? cleanName(provincia) : muniClean;
  const perfil = getPerfil(horasSol ?? null, irradiacionAnual ?? null);
  const cfg = perfilConfig[perfil];

  const vars = {
    MUNICIPIO: muniClean,
    PROVINCIA: provClean,
  };

  const title = generateDynamicText(cfg.title, `${muniClean}-anti-t`, vars);
  const intro = generateDynamicText(cfg.intro, `${muniClean}-anti-i`, vars);
  const closing = generateDynamicText(cfg.closing, `${muniClean}-anti-c`, vars);

  const hSeed = muniClean.length + (muniClean.charCodeAt(0) || 0);
  const checklist = checklistVariations[hSeed % checklistVariations.length];

  const cardClasses = "bg-gradient-to-br from-slate-50 to-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-10 mt-10 mb-12 text-left shadow-2xl shadow-slate-200/30 relative overflow-hidden font-manrope";

  return (
    <section className={cardClasses}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
              {intro}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mt-1">
                    <svg className="h-6 w-6 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="text-sm">
                    <strong className="block text-slate-900 font-black mb-1 text-base uppercase tracking-wide">{item.bold}</strong>
                    <span className="text-slate-600 leading-relaxed font-medium">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <p className="text-slate-700 text-sm font-bold leading-relaxed">
                {closing}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
