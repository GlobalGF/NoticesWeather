import Link from "next/link";

const WEAK_URLS = [
  "/subvenciones-solares/aragon/teruel/villarroya-de-los-pinares",
  "/subvenciones-solares/extremadura/badajoz/zafra",
  "/subvenciones-solares/comunitat-valenciana/valencia-valencia/cullera",
  "/subvenciones-solares/extremadura/caceres/robledollano",
  "/placas-solares/chagarcia-medianero",
  "/placas-solares/viloria",
  "/placas-solares/penafiel",
  "/placas-solares/la-alamedilla",
  "/placas-solares/villasbuenas",
  "/placas-solares/carcastillo",
  "/placas-solares/bidaurreta",
  "/placas-solares/banastas",
  "/placas-solares/la-guingueta-daneu",
  "/placas-solares/maia-de-montcal",
  "/subvenciones-solares/castilla-y-leon/salamanca/castellanos-de-moriscos",
  "/subvenciones-solares/castilla-y-leon/salamanca/el-campo-de-penaranda",
  "/subvenciones-solares/cataluna/tarragona/arnes",
  "/subvenciones-solares/castilla-y-leon/salamanca/berrocal-de-salvatierra",
  "/placas-solares/cabredo",
  "/subvenciones-solares/castilla-y-leon/valladolid/bolanos-de-campos",
  "/placas-solares/peralada",
  "/subvenciones-solares/castilla-y-leon/palencia/autillo-de-campos",
  "/placas-solares/castrillo-de-duero",
  "/placas-solares/salas-altas"
];

const TOP_URLS = [
  "/",
  "/placas-solares/onis",
  "/subvenciones-solares/andalucia/sevilla/gelves",
  "/subvenciones-solares/cataluna/barcelona/saldes",
  "/subvenciones-solares/comunitat-valenciana/valencia-valencia/riba-roja-de-turia",
  "/subvenciones-solares/illes-balears/balears-illes/santa-eugenia",
  "/subvenciones-solares/cataluna/barcelona/sant-pere-de-ribes",
  "/subvenciones-solares/castilla-la-mancha/cuenca/villares-del-saz",
  "/subvenciones-solares/castilla-la-mancha/guadalajara/guadalajara",
  "/subvenciones-solares/castilla-y-leon/leon/astorga",
  "/subvenciones-solares/castilla-y-leon/leon/leon",
  "/subvenciones-solares/castilla-y-leon/segovia/aldehorno",
  "/subvenciones-solares/cataluna/girona/girona",
  "/subvenciones-solares/comunitat-valenciana/valencia-valencia/l-eliana",
  "/subvenciones-solares/illes-balears/balears-illes/buger",
  "/placas-solares/aldeamayor-de-san-martin",
  "/subvenciones-solares/castilla-y-leon/segovia/fuenterrebollo",
  "/subvenciones-solares/castilla-y-leon/zamora/pozoantiguo",
  "/placas-solares/termens",
  "/placas-solares/a-pobra-do-caraminal",
  "/placas-solares/ortigueira",
  "/subvenciones-solares/andalucia/almeria/berja",
  "/subvenciones-solares/canarias/santa-cruz-de-tenerife/santa-cruz-de-la-palma",
  "/subvenciones-solares/castilla-la-mancha/albacete/la-herrera",
  "/subvenciones-solares/cataluna/girona/rabos"
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
