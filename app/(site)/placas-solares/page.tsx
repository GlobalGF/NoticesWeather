import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats } from "@/lib/data/solar";
import { getProvinceStats, getAllProvinces } from "@/lib/data/getProvinceStats";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import ProvincePageClient from "@/components/ui/ProvincePageClient";
import { ProvinceCrossLinks } from "@/components/ui/ProvinceCrossLinks";
import { cachePolicy } from "@/lib/cache/policy";
import { generateDynamicText } from "@/lib/pseo/spintax";

export const revalidate = cachePolicy.page.solarCity;

type Props = {
  searchParams: { provincia?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { provincia } = searchParams;
  if (provincia) {
    const stats = await getProvinceStats(provincia);
    const name = stats?.provinceName ?? provincia;
    return buildMetadata({
      title: `Instalación Placas Solares ${name} · Ahorro`,
      description: `Paneles y placas solares en ${name}: irradiación, precio de instalación fotovoltaica, ahorro en factura y bonificaciones IBI/ICIO. ${stats?.totalMunicipios ?? ''} municipios disponibles.`,
      pathname: `/placas-solares?provincia=${encodeURIComponent(provincia)}`,
    });
  }
  return buildMetadata({
    title: "Instalación de Placas Solares en España · Guía",
    description: "Compara precios de instalación de placas solares fotovoltaicas en tu municipio. Paneles solares, rentabilidad energética, subvenciones y bonificaciones IBI en España.",
    pathname: "/placas-solares",
  });
}

export default async function PlacasSolaresIndexPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  // ── Province-specific Landing ──────────────────────────────────
  if (provincia) {
    const [provStats, allProvs] = await Promise.all([
      getProvinceStats(provincia),
      getAllProvinces(),
    ]);

    if (!provStats) {
      // Fallback: Province not found, show generic page
      return <GenericPlacasSolaresPage />;
    }

    const meta = getProvinceMetadata(provincia);

    return (
      <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

        {/* ── Province Hero with Background ── */}
        <div className="relative pb-24 pt-16 overflow-hidden shadow-lg">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={meta.backgroundUrl}
              alt={provStats.provinceName}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
          </div>

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
            {/* Province badge */}
            <div className="inline-flex items-center gap-3 mb-5 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2.5 rounded-full">
              <svg className="text-amber-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <p className="text-amber-300 font-bold tracking-widest uppercase text-[10px]">
                Provincia de {provStats.provinceName}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Placas Solares en <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{provStats.provinceName}</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Explora los <span className="text-white font-semibold" font-bold>{provStats.totalMunicipios} municipios</span> de {provStats.provinceName}. 
              Encuentra tu ciudad y accede al estudio completo de irradiación, rentabilidad y bonificaciones fiscales.
            </p>

            {/* Province highlights */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {meta.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white/80 font-medium">
                  <svg className="text-emerald-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Province Client Section (search + KPIs + grid) ── */}
        <ProvincePageClient
          hubName="Placas Solares"
          baseRoute="/placas-solares"
          provinceName={provStats.provinceName}
          provinceSlug={provStats.provinceSlug}
          municipios={provStats.municipios}
          allProvinces={allProvs}
          stats={{
            totalMunicipios: provStats.totalMunicipios,
            avgSunHours: provStats.avgSunHours,
            avgRadiation: provStats.avgRadiation,
            avgSavings: provStats.avgSavings,
            avgIBI: provStats.avgIBI,
          }}
          initialList={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {provStats.municipios.map((m: any) => (
                <Link
                  key={m.slug}
                  href={`/placas-solares/${m.slug}`}
                  className="group block bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate">{m.municipio}</span>
                  </div>
                </Link>
              ))}
            </div>
          }
        />

        {/* ── Province SEO Content Block (Moved to bottom) ── */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Instalación de paneles solares en la provincia de {provStats.provinceName}
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed font-medium space-y-8">
              {/* Bloque 1: Introducción y Contexto Regional */}
              <p>
                {generateDynamicText(
                  "{El potencial para instalar placas solares en [PROVINCIA] es uno de los más destacados de España debido a su ubicación privilegiada y su compromiso histórico con las energías renovables.|[PROVINCIA] se ha consolidado en los últimos años como una zona estratégica para la expansión de la energía fotovoltaica, atrayendo inversiones tanto industriales como particulares.|La transición energética en la provincia de [PROVINCIA] ofrece hoy oportunidades únicas para el autoconsumo residencial y comercial, impulsada por un entorno legislativo favorable y una geografía idónea.|Instalar paneles solares en [PROVINCIA] representa actualmente una de las mejores inversiones por su alta rentabilidad y el excelente recurso solar disponible.} {El compromiso de sus instituciones y la creciente red de instaladores locales especializados en [PROVINCIA] facilitan el paso hacia una energía limpia, soberana y de bajo coste.|Gracias al apoyo de los instaladores de la zona y la madurez del mercado en [PROVINCIA], el proceso de cambio a energía solar es más sencillo que nunca.|La infraestructura técnica y profesional en [PROVINCIA] garantiza que cualquier proyecto de autoconsumo se ejecute bajo los más altos estándares de calidad europeos.} {Apostar por paneles solares no solo es una decisión ecológica para los habitantes de [PROVINCIA], sino una de las estrategias de ahorro financiero más sólidas disponibles en el mercado actual para combatir la inflación energética.}",
                  `${provStats.provinceSlug}-p1-v3`,
                  { PROVINCIA: provStats.provinceName }
                )}
              </p>
              
              {/* Bloque 2: Análisis de Radiación y Rendimiento */}
              <h3 className="text-xl font-bold text-slate-900 mt-8 mb-2">Recurso solar e ingeniería fotovoltaica en {provStats.provinceName}</h3>
              <p>
                {generateDynamicText(
                  "{Con una media de [HORAS] horas de sol al año y una irradiación técnica de [IRRAD] kWh/m², la provincia de [PROVINCIA] supera con creces el recurso solar de la mayoría de países europeos y del norte del continente.|Los datos oficiales de la Comisión Europea a través de PVGIS confirman que [PROVINCIA] recibe una irradiación global horizontal de [IRRAD] kWh/m², lo que garantiza un rendimiento óptimo de los sistemas de autoconsumo instalados en tejados.|Gracias a recibir más de [HORAS] h de sol anuales según los registros meteorológicos históricos, los hogares y empresas de [PROVINCIA] cuentan con un recurso natural inagotable que permite generar excedentes significativos para compensación.|La posición geográfica de [PROVINCIA] le otorga una ventaja técnica innegable, con registros de irradiación de [IRRAD] kWh/m² que aseguran una producción eléctrica constante.} {Esta abundancia de radiación solar directa, combinada con las temperaturas medias de [PROVINCIA], permite que las células de silicio trabajen en rangos de eficiencia muy altos.|Este nivel de insolación permite a los inversores en [PROVINCIA] alcanzar el punto de máxima potencia (MPP) durante gran parte del día.|La excelente relación entre horas de sol ([HORAS]) y temperatura en [PROVINCIA] maximiza el rendimiento y prolonga la vida útil de los componentes electrónicos.}",
                  `${provStats.provinceSlug}-p2-v3`,
                  { PROVINCIA: provStats.provinceName, HORAS: provStats.avgSunHours.toLocaleString('es-ES'), IRRAD: provStats.avgRadiation.toLocaleString('es-ES') }
                )}
              </p>

              {/* Bloque 3: Amortización y Ahorro */}
              <p>
                {generateDynamicText(
                  "{Desde una perspectiva financiera, estas condiciones climáticas se traducen en un ahorro medio estimado de [AHORRO]€ anuales para una instalación doméstica de 4,5 kWp.|La rentabilidad de la inversión fotovoltaica en [PROVINCIA] es altamente competitiva, con ahorros proyectados que suelen situarse en los [AHORRO]€ anuales una vez amortizado el sistema inicial.|Cualquier propietario en [PROVINCIA] que decida instalar paneles solares puede aspirar a reducir su factura eléctrica en unos [AHORRO]€ de media, protegiéndose de la volatilidad del mercado energético.|El impacto económico en las viviendas de [PROVINCIA] es directo, logrando recortar el gasto eléctrico en una media de [AHORRO]€ al año tras la puesta en marcha.} {Este ahorro directo permite amortizar el capital invertido en tiempos récord, normalmente situados entre los 4 y 7 años.|Al reducir el recibo mensual en [PROVINCIA], el pay-back de la instalación fotovoltaica se acelera dramáticamente, convirtiéndose en un activo que genera dinero desde el primer día.|Incluso sin subvenciones directas, la potencia de ahorro en [PROVINCIA] garantiza que el sistema se pague solo en un periodo muy breve de tiempo.}",
                  `${provStats.provinceSlug}-p3-v3`,
                  { PROVINCIA: provStats.provinceName, AHORRO: String(provStats.avgSavings) }
                )}
              </p>

              {/* Bloque 4: Clima y Mantenimiento */}
              <h3 className="text-xl font-bold text-slate-900 mt-8 mb-2">Mantenimiento y durabilidad de los paneles en {provStats.provinceName}</h3>
              <p>
                {generateDynamicText(
                  "{El clima de [PROVINCIA] es generalmente amable con las estructuras de aluminio y los vidrios templados de los paneles solares, requiriendo un mantenimiento preventivo mínimo.|Dadas las características atmosféricas de [PROVINCIA], una limpieza anual de la superficie de los paneles suele ser suficiente para mantener el rendimiento por encima del 95% de su capacidad nominal.|En la provincia de [PROVINCIA], la durabilidad de los equipos fotovoltaicos actuales está garantizada por más de 25 años, con degradaciones de potencia inferiores al 0,5% anual.|Los sistemas solares montados en [PROVINCIA] están diseñados para resistir las inclemencias locales, desde vientos fuertes hasta variaciones térmicas estaciónales.} {Es recomendable realizar una revisión de las protecciones eléctricas cada 5 años para asegurar que tu sistema en [PROVINCIA] sigue inyectando energía de forma segura.|Mantener los cables y anclajes revisados por un técnico en [PROVINCIA] es vital para prolongar la rentabilidad del sistema por varias décadas.|La resistencia de los materiales ante las condiciones climáticas de [PROVINCIA] asegura que la degradación sea mínima, manteniendo la eficiencia proyectada a largo plazo.}",
                  `${provStats.provinceSlug}-p5-v3`,
                  { PROVINCIA: provStats.provinceName }
                )}
              </p>

              {/* Bloque 5: Incentivos y Bonificaciones */}
              <p>
                {generateDynamicText(
                  "{Además del ahorro directo, los [TOTAL] municipios que componen la red administrativa de [PROVINCIA] ofrecen potentes incentivos fiscales, destacando las bonificaciones medias del [IBI]% en el IBI.|Nuestro análisis técnico de los [TOTAL] municipios de [PROVINCIA] revela que la mayoría cuenta con ayudas locales activas, donde el descuento en el Impuesto de Bienes Inmuebles suele alcanzar el [IBI]%.|Consultar la normativa específica de los [TOTAL] ayuntamientos de [PROVINCIA] es vital, ya que la bonificación media del [IBI]% en tributos locales puede reducir el coste neto de la instalación en varios miles de euros.|Las políticas locales pro-autoconsumo en los [TOTAL] municipios de [PROVINCIA] incluyen reducciones impositivas críticas, con bonificaciones de hasta el [IBI]% en IBI e ICIO.} {A esto se suman las deducciones legales en el IRPF por mejora de eficiencia energética, muy solicitadas en [PROVINCIA] por su facilidad de trámite.|En [PROVINCIA], la combinación de ayudas de los ayuntamientos y las desgravaciones fiscales estatales crean el escenario perfecto para invertir ahora.|No dejes pasar la oportunidad de descontar parte del coste de tus placas solares en [PROVINCIA] a través de la próxima declaración de la renta.}",
                  `${provStats.provinceSlug}-p4-v3`,
                  { PROVINCIA: provStats.provinceName, TOTAL: String(provStats.totalMunicipios), IBI: String(provStats.avgIBI) }
                )}
              </p>

              {/* Bloque 6: Visión de Futuro */}
              <p>
                {generateDynamicText(
                  "{En definitiva, [PROVINCIA] se posiciona como una de las mejores regiones para la independencia energética. La combinación de sol, ayudas y tecnología hace del autoconsumo la opción más inteligente para cualquier hogar.|Mirando hacia el futuro, la provincia de [PROVINCIA] seguirá liderando la generación distribuida, transformando miles de tejados en centrales de energía limpia y gratuita para sus ciudadanos.|Elegir energía solar en [PROVINCIA] hoy es asegurar un precio de la luz bajo y estable para las próximas décadas, contribuyendo además a la sostenibilidad medioambiental de toda la provincia.|La apuesta por la fotovoltaica en [PROVINCIA] es un paso firme hacia un modelo energético descentralizado, eficiente y plenamente respetuoso con el entorno natural regional.} {Explora el listado de municipios a continuación para encontrar los datos exactos y las empresas instaladoras autorizadas que operan en tu zona de [PROVINCIA].|Te invitamos a buscar tu localidad de [PROVINCIA] en nuestro buscador para acceder al detalle de ayudas y rentabilidad en tu vivienda.|Comienza hoy tu ahorro consultando las opciones disponibles para tu tejado en cualquiera de los municipios de [PROVINCIA] listados abajo.}",
                  `${provStats.provinceSlug}-p6-v3`,
                  { PROVINCIA: provStats.provinceName }
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── Cross-Silo Provincial Interlinks ── */}
        <ProvinceCrossLinks
          provinceName={provStats.provinceName}
          provinceSlug={provStats.provinceSlug}
          currentSilo="placas"
        />
      </main>
    );
  }

  // ── Generic / No Province Selected ─────────────────────────────
  return <GenericPlacasSolaresPage />;
}

// ── Extracted generic page (no province selected) ────────────────
async function GenericPlacasSolaresPage() {
  const stats = await getNationalStats();

  return (
    <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

      {/* ── Corporate Hero with Search ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <p className="text-cyan-400 font-bold tracking-widest uppercase text-[10px]">Portal Nacional de Autoconsumo</p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Placas Solares en España <br className="hidden md:block" /> Rendimiento por Localidad
          </h1>

          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Encuentra tu municipio y accede al estudio completo de irradiación, precio de instalación fotovoltaica, rentabilidad de paneles solares y bonificaciones fiscales (IBI/ICIO).
          </p>

          <LocationSearchBar baseRoute="/placas-solares" />
        </div>
      </div>

      {/* ── National Statistics KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
          <div className="flex flex-col items-center text-center px-2">
            <span className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-2xl mb-4 shadow-inner border border-amber-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Media Nacional</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgSunHours.toLocaleString('es-ES')}</p>
            <p className="text-xs font-bold text-amber-600">horas solares/año</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8">
            <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-inner border border-blue-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Radiación Media</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgRadiation.toLocaleString('es-ES')}</p>
            <p className="text-xs font-bold text-blue-600">kWh/m² anuales</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
            <span className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-inner border border-emerald-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro Medio Anual</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgSavings}€</p>
            <p className="text-xs font-bold text-emerald-600">por instalación fotovoltaica</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
            <span className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-2xl mb-4 shadow-inner border border-purple-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Bonificación IBI</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgIBI}%</p>
            <p className="text-xs font-bold text-purple-600">descuento medio municipal</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Directorio de paneles y placas solares por municipio</h2>
          <p className="text-slate-500">
            Selecciona tu provincia para consultar el mapa de municipios con datos de energía solar fotovoltaica, precio de instalación de paneles y potencial de ahorro.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <GeoDirectory
            level="provincias"
            baseRoute="/placas-solares"
            queryParam="provincia"
          />
        </div>
      </div>
    </main>
  );
}
