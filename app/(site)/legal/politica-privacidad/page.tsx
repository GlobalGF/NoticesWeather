import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | SolaryEco",
  description: "Protección de datos y política de privacidad de SolaryEco en base al RGPD europeo.",
  robots: { index: false, follow: true },
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 tracking-tight">Política de Privacidad</h1>
        
        <div className="prose prose-slate prose-lg max-w-none text-slate-600 space-y-6">
          <p className="lead text-xl text-slate-500 font-light">
            En cumplimiento del Reglamento General de Protección de Datos (RGPD) y la LOPDGDD 3/2018.
          </p>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-slate-900 text-amber-500 mb-4 mt-0">1. Quiénes somos</h2>
            <p>
              El responsable del tratamiento de los datos personales recogidos en <strong>solaryeco.es</strong> es SolaryEco,
              con correo electrónico de contacto: <a href="mailto:contact@globalgrowthframework.com" className="text-blue-600 font-medium">contact@globalgrowthframework.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Qué datos personales recogemos y por qué</h2>
            <p>
              SolaryEco recopila únicamente los datos estrictamente necesarios para la prestación de sus servicios,
              específicamente cuando rellenas de forma voluntaria nuestros formularios de contacto, estimación o solicitud de presupuesto.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
              <li><strong>Datos de contacto básicos:</strong> Nombre, teléfono o email para gestionar tu solicitud.</li>
              <li><strong>Datos geográficos:</strong> Código Postal, Municipio o Provincia para ofrecerte presupuestos precisos ajustados a tu ubicación solar.</li>
              <li><strong>Finalidad:</strong> Poner en contacto al usuario con instaladores locales certificados, enviar simulaciones energéticas, responder a tus consultas y enviar comunicaciones comerciales <strong>solo si has otorgado consentimiento explícito</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Cuál es la legitimación para el tratamiento</h2>
            <p>
              La base legal para el tratamiento de tus datos es principalmente tu <strong>consentimiento expreso</strong>, otorgado
              al marcar la casilla de aceptación y pulsar el botón de envío en cualquiera de nuestros formularios. 
              También nos legitima la posible ejecución de medidas precontractuales si nos solicitas un presupuesto formativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Durante cuánto tiempo conservamos tus datos</h2>
            <p>
              Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial, no solicites su 
              supresión o cancelación, y durante el tiempo estrictamente necesario para cumplir con las obligaciones legales
              generadas a raíz del tratamiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. A qué destinatarios se comunicarán</h2>
            <p>
              Para cumplir la misión de intermediación de SolaryEco (conseguir presupuestos de instalación), 
              tus datos <strong>serán compartidos exclusivamente con técnicos o empresas instaladoras homologadas</strong> que prestan
              servicio en la zona geográfica que tú has indicado (Ej: tu provincia o municipio). 
            </p>
            <p>
              Al enviar el formulario, estás autorizando expresamente la transmisión de estos datos de contacto a nuestro
              directorio de partners para que contacten contigo con propuestas de autoconsumo fotovoltaico. No vendemos ni cedemos 
              tus datos a terceros ajenos a la instalación solicitada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Cuáles son tus derechos legales (Derechos ARCO)</h2>
            <p>
              En cualquier momento, tienes el pleno derecho a obtener confirmación sobre si 
              en SolaryEco estamos tratando tus datos personales. Gozas de los siguientes derechos:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-800">Derecho de Acceso</strong>
                <p className="text-sm mt-1">Conocer qué datos tenemos sobre ti y los detalles del tratamiento.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-800">Rectificación o Supresión</strong>
                <p className="text-sm mt-1">Solicitar modificación de datos inexactos, o pedir que los borremos.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-800">Oposición y Limitación</strong>
                <p className="text-sm mt-1">Oponerte a que usemos tus datos para ciertos fines (como publicidad).</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-800">Portabilidad</strong>
                <p className="text-sm mt-1">Recibir tus datos en un formato estándar para llevarlos a otro lado.</p>
              </div>
            </div>
            <p className="mt-5">
              Para ejercer cualquiera de estos derechos, basta con enviar un email a 
              <strong> <a href="mailto:contact@globalgrowthframework.com" className="text-blue-600 hover:underline">contact@globalgrowthframework.com</a> </strong>
              adjuntando una copia de tu DNI e indicando el derecho que deseas ejercer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Medidas de Seguridad</h2>
            <p>
              SolaryEco se compromete a tratar tus datos con las mayores garantías técnicas y organizativas, encriptando los
              envíos de datos de formularios (mediante protocolo TLS/SSL) y almacenándolos en bases de datos seguras 
              (Infraestructura Supabase) con control de acceso restrictivo, evitando así su pérdida, alteración o alteración malintencionada.
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
