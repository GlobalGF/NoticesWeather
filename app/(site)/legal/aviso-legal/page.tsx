import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Términos de uso y condiciones legales del portal energético SolaryEco.",
  robots: { index: false, follow: true }, // No necesitamos indexar páginas puramente legales en buscadores
};

export default function AvisoLegalPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 tracking-tight">Aviso Legal</h1>
        
        <div className="prose prose-slate prose-lg max-w-none text-slate-600 space-y-6">
          <p className="lead text-xl text-slate-500 font-light">
            Información legal y términos de uso en cumplimiento de la normativa vigente.
          </p>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 mt-0">1. Datos Identificativos</h2>
            <p>
              En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, 
              de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), 
              se informa que el titular de este sitio web es:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <li><strong>Denominación comercial:</strong> SolaryEco</li>
              <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:contact@globalgrowthframework.dev" className="text-blue-600 hover:underline">contact@globalgrowthframework.dev</a></li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              El resto de datos identificativos (NIF/CIF, domicilio social) se actualizarán una vez completada la constitución formal de la actividad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Condiciones de Uso y Acceso</h2>
            <p>
              El acceso al portal <strong>solaryeco.es</strong> (en adelante, la "Web") atribuye la condición de Usuario e implica 
              la aceptación de todas las condiciones aquí contenidas. El portal tiene un objetivo meramente informativo y de 
              orientación sobre el mercado energético y recursos solares.
            </p>
            <p>
              El Usuario se compromete a usar la Web y sus contenidos conforme a la ley, la moral y el orden público, 
              absteniéndose de cualquier acto ilícito o que perjudique derechos de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Responsabilidad sobre los Contenidos</h2>
            <p>
              SolaryEco se esfuerza en velar por la precisión de la información aquí mostrada (como estimaciones de irradiación 
              procedentes de PVGIS, precios oficiales del PVPC o datos de normativas municipales). Sin embargo, 
              los contenidos proporcionados son <strong>informativos y no constituyen una asesoría oficial, técnica ni vinculante</strong>.
            </p>
            <p>
              Las proyecciones de ahorro y estimaciones son simulaciones basadas en promedios geográficos. 
              SolaryEco no garantiza resultados exactos ni asume responsabilidad por las decisiones tomadas o inversiones realizadas 
              en base a esta información. Toda instalación debe ser presupuestada y visitada por un técnico homologado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Propiedad Intelectual e Industrial</h2>
            <p>
              El diseño del portal, así como los logos, marcas, textos y código fuente, 
              están sujetos a derechos de propiedad intelectual, prohibiéndose su reproducción total o parcial sin autorización expresa.
            </p>
            <p>
              Cualquier uso no autorizado previamente será considerado un incumplimiento grave de los derechos de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Legislación Aplicable y Jurisdicción</h2>
            <p>
              El presente Aviso Legal se rige íntegramente por la legislación española. Para cualquier controversia civil, las partes se 
              someterán a los Juzgados y Tribunales competentes según lo que establezca la ley aplicable a los usuarios o consumidores.
            </p>
          </section>
          
          <div className="text-sm text-slate-400 mt-12 pt-6 border-t border-slate-200">
            Última actualización: 30 de marzo de 2026.
          </div>
        </div>
      </div>
    </main>
  );
}
