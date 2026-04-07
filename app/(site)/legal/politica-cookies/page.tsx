import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre el uso de cookies en SolaryEco según la directiva ePrivacy europea.",
  robots: { index: false, follow: true },
};

export default function PoliticaCookiesPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 tracking-tight">Política de Cookies</h1>
        
        <div className="prose prose-slate prose-lg max-w-none text-slate-600 space-y-6">
          <p className="lead text-xl text-slate-500 font-light">
            En cumplimiento del artículo 22.2 de la Ley 34/2002 LSSI-CE, sobre Servicios de Sociedad de la Información, 
            te informamos del uso y tipos de cookies que emplea SolaryEco.
          </p>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 mt-0">1. ¿Qué son las cookies?</h2>
            <p>
              Una cookie es un pequeño archivo de texto y números que se descarga en tu navegador (ordenador, smartphone o tablet)
              al acceder a determinadas páginas web. Las cookies permiten almacenar y recuperar información sobre los hábitos 
              de navegación o el equipo desde el cual te conectas de forma anónima, mejorando la usabilidad general del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. ¿Qué tipos de cookies usa SolaryEco?</h2>
            <p>
              Según el plazo de tiempo que permanecen activadas:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
              <li><strong>Cookies de sesión:</strong> Diseñadas para recabar y almacenar datos mientras el usuario accede a nuestra plataforma.</li>
              <li><strong>Cookies persistentes:</strong> Los datos siguen almacenados en el terminal y pueden ser accedidos durante un periodo definido.</li>
            </ul>

            <p className="mt-6 mb-2">Según su finalidad (Nivel de intrusión):</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 border-l-4 border-blue-500 rounded-r-xl">
                <h3 className="font-bold text-slate-800 text-lg mb-1">Cookies Técnicas Estríctamente Necesarias</h3>
                <p className="text-sm">
                  Permiten la navegación por la página y la utilización de la misma, como identificar la sesión de cálculo en curso,
                  funcionar como carrito o recordar opciones temporales en nuestros simuladores solares. 
                  <em>No pueden rechazarse pues el sitio dejaría de ser funcional.</em>
                </p>
              </div>

              <div className="bg-amber-50/50 p-4 border-l-4 border-amber-500 rounded-r-xl">
                <h3 className="font-bold text-slate-800 text-lg mb-1">Cookies Analíticas / Estadísticas</h3>
                <p className="text-sm">
                  Utilizamos herramientas como Google Analytics (o equivalentes anonimizados) para medir la audiencia, 
                  visitas a páginas como el &quot;precio de la luz&quot; o parámetros de tráfico, que nos ayudan siempre a mejorar. 
                  Se usan exclusivamente con fines analíticos internos.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Gestión, Bloqueo y Eliminación</h2>
            <p>
              Tienes el derecho de restringir, bloquear o borrar las cookies de SolaryEco en cualquier momento utilizando la configuración 
              nativa de tu navegador de internet. Cada navegador opera de forma diferente, consulta sus apartados de ayuda oficial:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
              <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad &amp; Seguridad.</li>
              <li><strong>Safari:</strong> Preferencias &gt; Privacidad.</li>
              <li><strong>Edge:</strong> Configuración &gt; Permisos del sitio &gt; Cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Actualizaciones a esta Política</h2>
            <p>
              Es posible que actualicemos la Política de Cookies de nuestro Portal de cuando en cuando. 
              Por ello, te recomendamos revisar esta política periódicamente para estar adecuadamente informado sobre cómo y para 
              qué usamos las cookies tecnológicas en nuestro entorno de simulación fotovoltaica.
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
