import Link from "next/link";

const WEAK_URLS = [
  "/subvenciones-solares/aragon/teruel/villarroya-de-los-pinares",
  "/subvenciones-solares/extremadura/badajoz/zafra",
  "/subvenciones-solares/valencia/valencia/cullera",
  "/subvenciones-solares/extremadura/caceres/robledollano",
  "/placas-solares/chagarcia-medianero-salamanca",
  "/placas-solares/viloria-valladolid",
  "/placas-solares/penafiel-valladolid",
  "/placas-solares/la-alamedilla-salamanca",
  "/placas-solares/villasbuenas-salamanca",
  "/placas-solares/carcastillo-navarra",
  "/placas-solares/bidaurreta-navarra",
  "/placas-solares/banastas-huesca",
  "/placas-solares/la-guingueta-daneu-lleida",
  "/placas-solares/maia-de-montcal-girona",
  "/subvenciones-solares/castellanos-de-moriscos-salamanca",
  "/subvenciones-solares/el-campo-de-penaranda-salamanca",
  "/subvenciones-solares/catalunya/tarragona/arnes",
  "/subvenciones-solares/berrocal-de-salvatierra-salamanca",
  "/placas-solares/cabredo-navarra",
  "/subvenciones-solares/castilla-leon/valladolid/bolanos-de-campos",
  "/placas-solares/peralada-girona",
  "/subvenciones-solares/castilla-leon/palencia/autillo-de-campos",
  "/placas-solares/castrillo-de-duero-valladolid",
  "/placas-solares/salas-altas-huesca"
];

const TOP_URLS = [
  "/",
  "/placas-solares/onis-asturias",
  "/subvenciones-solares/andalucia/sevilla/gelves",
  "/subvenciones-solares/catalunya/barcelona/saldes",
  "/subvenciones-solares/valencia/valencia/riba-roja-de-turia",
  "/subvenciones-solares/illes-balears/balears-illes/santa-eugenia-illes-balears",
  "/subvenciones-solares/catalunya/barcelona/sant-pere-de-ribes",
  "/subvenciones-solares/castilla-la-mancha/cuenca/villares-del-saz",
  "/subvenciones-solares/castilla-la-mancha/guadalajara/guadalajara",
  "/subvenciones-solares/castilla-leon/leon/astorga",
  "/subvenciones-solares/castilla-leon/leon/leon",
  "/subvenciones-solares/castilla-leon/segovia/aldehorno",
  "/subvenciones-solares/catalunya/girona/girona",
  "/subvenciones-solares/valencia/valencia/l-eliana",
  "/subvenciones-solares/illes-balears/balears-illes/buger-illes-balears",
  "/placas-solares/aldeamayor-de-san-martin-valladolid",
  "/subvenciones-solares/castilla-leon/segovia/fuenterrebollo",
  "/subvenciones-solares/castilla-leon/zamora/pozoantiguo",
  "/placas-solares/termens-lleida",
  "/placas-solares/a-pobra-do-caraminal-a-coruna",
  "/placas-solares/ortigueira-a-coruna",
  "/subvenciones-solares/andalucia/almeria/berja",
  "/subvenciones-solares/canarias/santa-cruz-de-tenerife/santa-cruz-de-la-palma",
  "/subvenciones-solares/castilla-la-mancha/albacete/la-herrera",
  "/subvenciones-solares/catalunya/girona/rabos"
];

/**
 * Determina recursivamente si se deben injectar enlaces.
 */
export function isTopPage(currentPath: string): boolean {
  // Manejo especial barra final y sin barra
  const cleanPath = currentPath.endsWith('/') && currentPath.length > 1 
    ? currentPath.slice(0, -1) 
    : currentPath;
  return TOP_URLS.includes(cleanPath);
}

/**
 * Hash para selección determinista de enlaces pseudo-aleatorios sin mutar en client-side.
 */
function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAnchorText(path: string) {
  const parts = path.split('/');
  const lastPart = parts[parts.length - 1];
  
  // Normalizar: "chagarcia-medianero-salamanca" -> "Chagarcia Medianero"
  let name = lastPart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  if (path.includes('subvenciones-solares')) {
    return `Ayudas y Subvenciones activas en ${name}`;
  }
  return `Estudio y presupuesto de instalación solar en ${name}`;
}

export function SeoLinkJuicer({ currentPath }: { currentPath: string }) {
  if (!isTopPage(currentPath)) return null;

  // Selección determinista de 5 enlaces basada en la ruta actual
  const hash = getStringHash(currentPath);
  
  // Clonar para no modificar la constante
  const shuffled = [...WEAK_URLS].sort((a, b) => {
    return getStringHash(a + currentPath) - getStringHash(b + currentPath);
  });
  
  const selectedLinks = shuffled.slice(0, 5);

  return (
    <section className="mt-16 mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">📍</span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Otras regiones donde damos servicio</h2>
        </div>
        <p className="text-slate-600 text-sm mb-6 max-w-3xl">
          Instaladores expertos de España y estudios energéticos a tu disposición para proyectos de energía fotovoltaica. Consulta la disponibilidad en otras localidades relevantes:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedLinks.map(link => {
            const currentRouteName = currentPath.split("/").pop() || "localidad";
            const cleanName = currentRouteName.replace(/-/g, " ");
            return (
              <li key={link}>
                <Link 
                  href={link}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform shrink-0" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 leading-snug">
                    {getAnchorText(link)}
                    <span className="sr-only"> (comparar con ofertas en {cleanName})</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
