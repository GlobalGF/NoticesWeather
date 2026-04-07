import Link from "next/link";
import { getTopMunicipiosEnergiaSlugs } from "@/data/repositories/municipios-energia.repo";
import { getNationalStats, getPrecioLuzHoy } from "@/lib/data/solar";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { cachePolicy } from "@/lib/cache/policy";

export const revalidate = cachePolicy.page.solarCity;

export const metadata = buildMetadata({
  title: "Tarifa Luz Hoy, Placas Solares y Autoconsumo en España",
  description: "Consulta la tarifa de la luz hoy, rendimiento fotovoltaico, horas de sol y subvenciones para placas solares en más de 8.000 municipios españoles.",
  pathname: "/",
});

const mainHubs = [
  {
    href: "/placas-solares",
    title: "Rendimiento Solar Municipal",
    desc: "Producción estimada anual PVGIS, horas solares pico y ahorro para tu localidad exacta.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
    ),
    color: "bg-amber-100 text-amber-600 border-amber-200"
  },
  {
    href: "/precio-luz",
    title: "Mercado Regulado PVPC",
    desc: "Tracking en vivo de la tarifa eléctrica oficial de Red Eléctrica de España para optimizar tu consumo.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
    color: "bg-blue-100 text-blue-600 border-blue-200"
  },
  {
    href: "/subvenciones-solares",
    title: "Radar de Subvenciones",
    desc: "Consulta bonificaciones locales del IBI, ICIO y ayudas Next Generation disponibles.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
    ),
    color: "bg-emerald-100 text-emerald-600 border-emerald-200"
  },
  {
    href: "/presupuesto-solar",
    title: "Presupuestos de Instaladores",
    desc: "Conecta con empresas instaladoras verificadas en tu zona y recibe hasta 3 ofertas sin compromiso.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    color: "bg-orange-100 text-orange-600 border-orange-200"
  },
  {
    href: "/calculadoras",
    title: "Simuladores Integrales",
    desc: "Calculadoras precisas para baterías de litio, dimensionamiento de kWp y retorno de inversión real.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/></svg>
    ),
    color: "bg-indigo-100 text-indigo-600 border-indigo-200"
  }
];

const homeFaqs = [
  {
    question: "¿Es rentable instalar placas solares y baterías en España hoy?",
    answer: "Absolutamente. España figura a la cabeza del continente europeo en irradiación natural. Al combinar paneles con baterías de litio de última generación, no solo reduces al mínimo tu gasto eléctrico en las horas límite del precio PVPC de la noche, sino que creas resiliencia contra las subidas del mercado regulado o libre."
  },
  {
    question: "¿Cuánto se tarda realmente en amortizar la inversión inicial (ROI)?",
    answer: "El periodo de recuperación medio para instalaciones domésticas de 4 a 5 kWp en España oscila hoy entre los empíricos 4 y 7 años. Esta rentabilidad depende directamente de tu municipio: aquellos con mayores bonificaciones fiscales (IBI al 50% durante 5 años o ICIO al 95%) reducen el retorno de la inversión agresivamente, datos que puedes comprobar en nuestro buscador exacto por población."
  },
  {
    question: "¿Cómo se calculan los excedentes inyectados en nuestra tarifa mensual?",
    answer: "El sobrante de los kilowatios generados que tus consumos o tus baterías no logran absorber, se devuelve a la red de Iberdrola/Endesa u otras distribuidoras. A cambio, tu comercializadora eléctrica ejecuta la llamada 'compensación simplificada de excedentes', descontándote dinero en la porción de energía del mes (hasta el tope del consumo, jamás en la parte fija o peajes)."
  },
  {
    question: "¿De qué orígenes toma SolaryEco.es sus proyecciones y estimaciones?",
    answer: "SolaryEco es un ecosistema agnóstico y basado puramente en telemetría de confianza. Nos conectamos directamente al Photovoltaic Geographical Information System (PVGIS) oficial de la Comisión Europea. Nuestros cálculos de ahorro se alimentan de la cotización viva de Red Eléctrica de España (REE) usando la API de ESIOS, y los cruzamos con los Boletines Oficiales municipales para las ayudas activas."
  }
];

export default async function HomePage() {
  const stats = await getNationalStats();
  const precioLuz = await getPrecioLuzHoy();
  const rows = await getTopMunicipiosEnergiaSlugs(12);
  const topSlugs = rows.map((row) => row.slug).filter(Boolean);

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://solaryeco.es/#website",
        "url": "https://solaryeco.es/",
        "name": "SolaryEco",
        "description": metadata.description
      },
      {
        "@type": "FAQPage",
        "mainEntity": homeFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      
      {/* ── Corporate Hero with Search ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-[10px]">Datos Nacionales Actualizados a {new Date().getFullYear()}</p>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6 px-2">
            Precio de Luz y <br className="hidden md:block" /> Subvenciones Solares
          </h1>
          
          <p className="text-sm md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-10 px-4">
            Consulta en tiempo real el precio PVPC, el rendimiento fotovoltaico y las ayudas activas para los {stats.totalMunicipios} municipios de España.
          </p>

          {/* El buscador envía directamente a placas-solares (el hub más transaccional) */}
          <div className="px-2">
            <LocationSearchBar baseRoute="/placas-solares" placeholder="Buscar municipio..." />
          </div>
        </div>
      </div>

      {/* ── National Statistics KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center px-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Precio PVPC Hoy</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{precioLuz.toFixed(3)}€</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1">/ kWh Medio Diario</p>
            </div>
            <div className="flex flex-col items-center text-center px-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Excedentes Medios</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">0.05€</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1">Estimación Mercado</p>
            </div>
            <div className="flex flex-col items-center text-center px-1 mt-4 lg:mt-0 shadow-none border-t border-slate-100 lg:border-t-0 pt-4 lg:pt-0">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Horas Sol / España</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-500 tabular-nums">{stats.avgSunHours}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1">Media Anual Base</p>
            </div>
            <div className="flex flex-col items-center text-center px-1 mt-4 lg:mt-0 shadow-none border-t border-slate-100 lg:border-t-0 pt-4 lg:pt-0">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro Medio Hogar</span>
                <p className="text-2xl sm:text-3xl font-black text-blue-600 tabular-nums">{stats.avgSavings}€</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1">/ Año con 4kWp</p>
            </div>
        </div>
      </div>

      {/* ── Main Hubs ── */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Directorio de Recursos</h2>
          <p className="text-slate-500">
            Navega por nuestras secciones principales. Toda la información ha sido cruzada con bases de datos gubernamentales, del PVGIS Europeo y REE.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {mainHubs.map((hub) => (
            <Link 
              key={hub.href} 
              href={hub.href}
              className="group bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner ${hub.color}`}>
                {hub.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{hub.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{hub.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── SEO Long-form Pilar Content ── */}
      <div className="bg-slate-900 border-t border-slate-800 py-20 relative overflow-hidden">
        {/* Abstract Data Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dataGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dataGrid)" className="text-blue-500" />
            <path d="M0,800 C400,800 600,200 1200,200 C1600,200 1800,600 2400,600" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500"/>
            <path d="M0,600 C300,600 500,100 1000,100 C1400,100 1600,700 2400,700" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500"/>
            <path d="M0,1000 C500,1000 800,300 1400,300 C1800,300 2000,800 2400,800" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-amber-500"/>
          </svg>
        </div>

        <div className="mx-auto max-w-6xl px-4 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="prose prose-lg prose-invert text-slate-300">
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mt-0">
              ¿Por qué analizar tu municipio con un sistema centrado en Datos Puros?
            </h2>
            <p>
              El sector del autoconsumo en la Península Ibérica y los Archipiélagos ha sufrido una revolución. Sin embargo, encontrar rentabilidades matemáticas precisas entre el bombardeo publicitario de cientos de instaladoras ha vuelto extremadamente complejo distinguir los hechos de las proyecciones de marketing.
            </p>
            <p>
              <strong>SolaryEco</strong> ha consolidado la información de 8.131 municipios españoles mediante tres pipelines de análisis independiente:
            </p>
            <ul className="text-slate-400 space-y-3">
              <li><strong className="text-white">Radiometría Oficial:</strong> Usamos los logs algorítmicos del PVGIS y las anomalías climáticas registradas por entidades europeas satelitales para asegurar cuotas en kWh reales.</li>
              <li><strong className="text-white">Transmisión de Precios ESIOS:</strong> Si el kWh nocturno cotiza hoy en el Mercado Regulado a 0.28€ y las horas pico (sunlight) cotizan en 0.08€, aplicamos asimetrías reales de mercado sobre las amortizaciones calculadas.</li>
              <li><strong className="text-white">Ingeniería Fiscal Municipal:</strong> Centralizamos las normativas del IBI de cada ayuntamiento, ya que una rebaja del 50% durante 3 años en tu IBI altera severamente todo tu estudio de capital.</li>
            </ul>
          </div>

          <div className="grid gap-6">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Algoritmos de Simulación Neutros</h3>
                <p className="text-sm text-slate-400 leading-relaxed">No inflamos los ratios de generación fotovoltaica; proyectamos la degradación estándar del 0.5% anual en el silicio.</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex gap-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4-6-4-6 4"/><path d="m22 17-6-4-6 4-6-4"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Métricas de Almacenamiento Dinámico LFP</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Evaluamos el factor multiplicador del Litio-Hierro-Fosfato (LFP) frente a inyección a red en el marco económico actual de bajada de excedentes.</p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex gap-4">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Topología Jurídica y Comunidades Energéticas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Trazabilidad completa para leyes urbanísticas PSEO: autoconsumo compartido y cálculos del coeficiente de reparto normativo de 2024.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion Bridge Section (Leads) ── */}
      <div className="bg-white py-20 border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4 text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full text-orange-700 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Servicios para Propietarios
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                De los datos a la acción: <br className="hidden md:block" /> Encuentra instaladores cualificados
            </h2>
            <p className="text-slate-600 text-lg mb-12 max-w-3xl mx-auto leading-relaxed">
                Ya conoces el potencial solar de tu tejado. El siguiente paso es hablar con expertos. Colaboramos con <strong>empresas instaladoras de placas solares</strong> verificadas que ofrecen presupuestos competitivos y asesoramiento sobre subvenciones locales.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-left mb-12">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Multi-Presupuesto
                    </h4>
                    <p className="text-sm text-slate-500">Recibe hasta 3 ofertas diferentes para comparar precios y calidades de inversores y paneles.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Instaladores Locales
                    </h4>
                    <p className="text-sm text-slate-500">Conectamos solo con empresas que operan físicamente en tu provincia para asegurar un mantenimiento rápido.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Estudio Gratuito
                    </h4>
                    <p className="text-sm text-slate-500">Sin costes ocultos. El análisis técnico y la visita al inmueble suelen ser gratuitos y sin compromiso.</p>
                </div>
            </div>

            <Link 
                href="/presupuesto-solar"
                className="inline-flex items-center justify-center gap-3 bg-orange-600 text-white px-10 py-5 rounded-2xl text-lg font-black hover:bg-orange-700 hover:shadow-2xl hover:shadow-orange-200 transition-all active:scale-95 group"
            >
                Solicitar 3 Presupuestos Gratis
                <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            
            <p className="mt-6 text-xs text-slate-400 font-medium">
                Al solicitar presupuestos, un experto en autoconsumo revisará tu caso en menos de 24h.
            </p>
        </div>
      </div>

      {/* ── FAQ Section (Root Level) ── */}
      <div className="bg-white py-16 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Dudas Frecuentes del Mercado Fotovoltaico (FAQ)</h2>
            <p className="text-slate-500">Respuestas rápidas para las preguntas más extendidas sobre transición energética e instalación técnica.</p>
          </div>
          <FaqAccordion faqs={homeFaqs} municipio="toda España" />
        </div>
      </div>

      {/* ── Trendings / Deep Links ── */}
      <div className="bg-slate-100 border-t border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Municipios Más Buscados</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {rows.map((row) => {
                const muni = row.municipio || "";
                const prov = row.provincia || "";
                
                // Deduplication logic: If muni contains provincial name or vice versa, show only once
                let displayName = muni;
                const muniLower = muni.toLowerCase();
                const provLower = prov.toLowerCase();
                
                if (muniLower === provLower) {
                  displayName = muni;
                } else if (muniLower.includes(provLower)) {
                  displayName = muni;
                } else if (provLower.includes(muniLower)) {
                  displayName = prov;
                } else {
                  displayName = `${muni} (${prov})`;
                }

                // Handle bilingual names (e.g. Alacant/Alicante -> Alicante)
                if (displayName.includes("/")) {
                  const parts = displayName.split("/");
                  displayName = parts.length > 1 ? parts[1].trim() : parts[0].trim();
                }

                return (
                  <Link 
                    key={row.slug} 
                    href={`/placas-solares/${row.slug}`}
                    className="bg-white border border-slate-300 px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {displayName}
                  </Link>
                );
              })}
              <Link 
                  href="/placas-solares"
                  className="bg-blue-600 border border-blue-600 px-4 py-2 rounded-full text-sm font-bold text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  Ver mapa completo <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
            </div>
            <p className="mt-8 text-xs text-slate-400">
              Datos cruzados utilizando fuentes oficiales y cálculos de ingeniería técnica.
            </p>
        </div>
      </div>
      
    </main>
  );
}