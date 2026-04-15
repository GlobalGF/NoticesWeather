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
    { bold: "Cubierta en buen estado:", text: "{Tu tejado en [MUNICIPIO] debe estar libre de desgaste estructural|Para instalar en [PROVINCIA], la cubierta debe soportar el peso extra} o materiales protegidos como la uralita. Si el tejado de [MUNICIPIO] necesita reforma, {es mejor hacerla antes|conviene sanearlo previamente}." },
    { bold: "Orientación al sur:", text: "Disponer de superficie orientada al sur en [MUNICIPIO] (±30°) es ideal. {Orientaciones este u oeste en [PROVINCIA] también son viables|En [MUNICIPIO] puedes aprovechar tejados laterales} con un 10–15% menos de producción." },
    { bold: "Ausencia de sombras:", text: "{Sin edificios, chimeneas o árboles que proyecten sombra en [MUNICIPIO]|Evita obstáculos que bloqueen el sol de [PROVINCIA]} sobre el tejado entre las 10:00 y las 17:00 horas." },
    { bold: "Consumo mínimo 40 €/mes:", text: "La rentabilidad en [MUNICIPIO] se dispara con facturas superiores a 50 €/mes. {Por debajo de 30 € en [PROVINCIA], el plazo de amortización se alarga|Si gastas poco en [MUNICIPIO], opta por un sistema pequeño}." },
  ],
  [
    { bold: "Tejado sin amianto:", text: "La normativa en [PROVINCIA] prohíbe instalar sobre cubiertas con fibrocemento (uralita). Si la tienes en [MUNICIPIO], {la retirada debe hacerse antes|debes contratar un desamiantado} por empresa autorizada." },
    { bold: "Superficie libre suficiente:", text: "Cada kWp en [MUNICIPIO] necesita ~5 m² de superficie. {Para una instalación doméstica en [PROVINCIA], necesitas al menos 20 m²|Asegura un área despejada en [MUNICIPIO]} orientada al sur o suroeste." },
    { bold: "Sin sombreado en horas clave:", text: "Las sombras en [MUNICIPIO] entre las 9 h y las 18 h reducen la producción. {Un análisis detallado en [PROVINCIA] detecta obstrucciones|En [MUNICIPIO] revisamos cada chimenea} no visible a simple vista." },
    { bold: "Potencia contratada ≥3,45 kW:", text: "Hogares en [MUNICIPIO] con potencias muy bajas no suelen justificar la inversión. {Verifica tu factura de [PROVINCIA] antes de solicitar presupuesto|En [MUNICIPIO] te asesoramos sobre el término de potencia}." },
  ],
  [
    { bold: "Estado estructural correcto:", text: "El forjado en [MUNICIPIO] debe soportar ~15 kg/m² adicionales. {En cubiertas antiguas de [PROVINCIA], un ingeniero debe validar la carga|La seguridad de tu hogar en [MUNICIPIO] es prioritaria} antes del montaje." },
    { bold: "Orientación e inclinación:", text: "Inclinación óptima en [PROVINCIA]: 30–35° orientación sur. {Las cubiertas planas de [MUNICIPIO] permiten instalar estructura regulable|En [MUNICIPIO] ajustamos el ángulo} para la inclinación perfecta." },
    { bold: "Accesibilidad para mantenimiento:", text: "Los paneles en [MUNICIPIO] necesitan limpieza anual y revisión. {El acceso en [PROVINCIA] debe ser seguro y conforme al CTE|Manten tu sistema de [MUNICIPIO] en perfecto estado} de forma cómoda." },
    { bold: "Ratio consumo/producción:", text: "Lo ideal es que la instalación en [MUNICIPIO] cubra el 60–80% del consumo. {Sobredimensionar en [PROVINCIA] genera excedentes poco rentables|Ajusta el número de paneles en [MUNICIPIO]} a tu necesidad real." },
  ],
  [
    { bold: "Cubierta libre de amianto:", text: "La presencia de fibrocemento en [MUNICIPIO] es incompatible con la fotovoltaica. {Su retirada certificada en [PROVINCIA] es obligatoria|En [MUNICIPIO] no arriesgues la legalidad de tu obra}." },
    { bold: "Mínimo 15–20 m² útiles:", text: "Para un sistema en [MUNICIPIO] (3–5 kWp), necesitas un área mínima sin obstrucciones. {La disponibilidad de espacio en [PROVINCIA] marca el tamaño|Mide tu tejado de [MUNICIPIO] con precisión}." },
    { bold: "Sombras en horas extremas:", text: "Sombras al amanecer/atardecer son aceptables en [MUNICIPIO]. {En las horas centrales de [PROVINCIA], cualquier sombra es crítica|Protege la producción de tu casa en [MUNICIPIO]} en las horas pico." },
    { bold: "Factura eléctrica justificable:", text: "El autoconsumo en [MUNICIPIO] es rentable a partir de 50 €/mes. {Con batería en [PROVINCIA], la viabilidad mejora notablemente|Analiza tus hábitos en [MUNICIPIO]} antes de decidir el equipo." },
  ],
  [
    { bold: "Anclaje de estructura:", text: "Los vientos en [PROVINCIA] requieren un anclaje mecánico robusto en [MUNICIPIO]. {Usamos fijaciones certificadas para tu tipo de teja|La seguridad climática en [MUNICIPIO] es fundamental} para evitar filtraciones." },
    { bold: "Espacio para el inversor:", text: "Necesitas un lugar ventilado en [MUNICIPIO] para el inversor solar. {Suele ubicarse cerca del cuadro eléctrico de [PROVINCIA]|Buscamos el sitio óptimo en tu casa de [MUNICIPIO]} para evitar ruidos y calor." },
    { bold: "Instalación eléctrica al día:", text: "El cuadro de protecciones de tu vivienda en [MUNICIPIO] debe cumplir normativa. {A veces es necesario actualizar el IGA en [PROVINCIA]|Aseguramos que tu red en [MUNICIPIO] sea 100% segura}." },
    { bold: "Compensación de excedentes:", text: "En [MUNICIPIO] puedes verter la energía no usada y ahorrar más. {Tu comercializadora de [PROVINCIA] te descontará los excedentes|Maximiza el rendimiento de tu inversión en [MUNICIPIO]} cada día." },
  ],
  [
    { bold: "Tipo de teja o tejado:", text: "Ya sea teja árabe, mixta o chapa sándwich en [MUNICIPIO], {tenemos fijaciones específicas para [PROVINCIA]|Nos adaptamos a la cubierta de tu hogar en [MUNICIPIO]}. Evitamos roturas y goteos." },
    { bold: "Puntos de vertido:", text: "Verificamos la capacidad de conexión en la zona de [MUNICIPIO]. {En [PROVINCIA], el punto de frontera suele estar en la fachada|Facilitamos la conexión a red en [MUNICIPIO]} sin obras molestas." },
    { bold: "Legislación urbanística:", text: "Confirmamos si en [MUNICIPIO] necesitas licencia de obra o declaración. {Muchos ayuntamientos de [PROVINCIA] ya agilizan los trámites|Gestionamos la burocracia de [MUNICIPIO]} por ti." },
    { bold: "Garantía de instalación:", text: "Exige 2 años de garantía de montaje en [MUNICIPIO] y 25 años en paneles. {Tu confianza en [PROVINCIA] es nuestro motor|Solo trabajamos con fabricantes líderes para [MUNICIPIO]}." },
  ],
  [
    { bold: "Monitorización WiFi:", text: "Tu inversor en [MUNICIPIO] debe tener buena señal de internet. {El WiFi de tu casa en [PROVINCIA] es vital para ver el ahorro|Si no llega señal en [MUNICIPIO], instalamos extensores PLC}." },
    { bold: "Protección contra sobretensiones:", text: "Imprescindible en [PROVINCIA] para proteger tus electrodomésticos de [MUNICIPIO]. {Instalamos protecciones de continua y alterna|Tu seguridad eléctrica en [MUNICIPIO] no es negociable}." },
    { bold: "Eficiencia del panel:", text: "Usamos paneles de más de 450W para [MUNICIPIO]. {Ocupan menos espacio y rinden más en [PROVINCIA]|La tecnología N-Type es perfecta para el sol de [MUNICIPIO]}." },
    { bold: "Certificación energética:", text: "Mejoramos la letra de tu vivienda en [MUNICIPIO] tras instalar. {Esto aumenta el valor de tu propiedad en [PROVINCIA]|Tu casa en [MUNICIPIO] será más eficiente y sostenible}." },
  ],
  [
    { bold: "Presupuesto sin compromiso:", text: "Te enviamos un diseño personalizado para [MUNICIPIO] en 24h. {Sin letras pequeñas ni costes ocultos en [PROVINCIA]|Transparencia total para tu proyecto en [MUNICIPIO]}." },
    { bold: "Visita técnica gratuita:", text: "Un instalador de [PROVINCIA] validará tu tejado en [MUNICIPIO] sin coste. {Confirmamos las medidas reales en tu tejado|Tu tranquilidad en [MUNICIPIO] empieza con un buen diagnóstico}." },
    { bold: "Gestión de subvenciones:", text: "Tramitamos las ayudas de [PROVINCIA] disponibles para [MUNICIPIO]. {No pierdas dinero por falta de papeleo|Te asesoramos sobre deducciones de IRPF en [MUNICIPIO]}." },
    { bold: "Ahorro desde el día 1:", text: "Nada más encender tu inversor en [MUNICIPIO], verás caer tu factura. {Paga menos luz en [PROVINCIA] de forma inmediata|La energía del sol en [MUNICIPIO] ya es tuya}." },
  ],
  [
    { bold: "Sin mantenimiento complejo:", text: "Solo agua y jabón neutro una vez al año en [MUNICIPIO]. {Los paneles de [PROVINCIA] son extremadamente duraderos|Mantenimiento preventivo para tu equipo de [MUNICIPIO]}." },
    { bold: "Compatibilidad con batería:", text: "Si en el futuro quieres añadir baterías en [MUNICIPIO], {toda nuestra pre-instalación en [PROVINCIA] es compatible|Preparamos tu hogar de [MUNICIPIO] para la independencia total}." },
    { bold: "Resistencia al granizo:", text: "Los paneles instalados en [MUNICIPIO] soportan condiciones extremas. {Vidrio templado de 3.2mm para el clima de [PROVINCIA]|Seguridad estructural para tu tejado en [MUNICIPIO]}." },
    { bold: "Instalación estética:", text: "Cuidamos el impacto visual en tu tejado de [MUNICIPIO]. {Paneles Full Black para un acabado premium en [PROVINCIA]|Integración arquitectónica en tu casa de [MUNICIPIO]}." },
  ],
  [
    { bold: "Soporte post-venta:", text: "Si algo falla en [MUNICIPIO], nuestro equipo de [PROVINCIA] responde. {Servicio técnico local y cercano para ti|No te dejamos solo tras la instalación en [MUNICIPIO]}." },
    { bold: "Cero ruidos molestos:", text: "El sistema inversor en [MUNICIPIO] es totalmente silencioso. {Ideal para viviendas unifamiliares en [PROVINCIA]|Disfruta de energía limpia en [MUNICIPIO] sin molestias}." },
    { bold: "Incremento valor inmueble:", text: "Tu casa en [MUNICIPIO] valdrá entre un 3-5% más tras la obra. {Una inversión que se revaloriza en [PROVINCIA]|Placas solares: el mejor extra para tu hogar en [MUNICIPIO]}." },
    { bold: "Energía 100% verde:", text: "Evita la emisión de toneladas de CO2 en [MUNICIPIO] cada año. {Contribuye a la sostenibilidad de [PROVINCIA] desde tu tejado|Compromiso real con el planeta en [MUNICIPIO]}." },
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
                    <span className="block text-slate-900 font-black mb-1 text-base uppercase tracking-wide font-bold">{item.bold}</span>
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
