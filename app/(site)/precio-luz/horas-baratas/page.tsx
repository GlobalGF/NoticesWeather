import { Metadata } from "next";
import Link from "next/link";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { ElectrodomesticoCalculator } from "@/components/ui/ElectrodomesticoCalculator";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { getPvpcAnalysis } from "@/lib/data/pvpc";

export const revalidate = 3600; // 1h

export async function generateMetadata(): Promise<Metadata> {
  const pvpc = await getPvpcAnalysis();
  const hoy = pvpc.hoy;
  const cheapest = hoy?.horasBaratas?.sort((a, b) => a.hora - b.hora).slice(0, 3);
  const horasStr = cheapest?.map(h => `${String(h.hora).padStart(2, "0")}:00`).join(", ") ?? "madrugada";

  return buildMetadata({
    title: `Horas Baratas de Luz Hoy — Cuándo es Más Barata la Electricidad (${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })})`,
    description: `Horas baratas de luz hoy: las mejores horas para poner la lavadora son ${horasStr}. Precio PVPC hora a hora actualizado con datos de Red Eléctrica. Ahorra hasta un 40% en tu factura.`,
    pathname: "/precio-luz/horas-baratas",
  });
}

export default async function HorasBaratasPage() {
  const pvpc = await getPvpcAnalysis();
  const hoy = pvpc.hoy;
  const manana = pvpc.manana;
  const fmt = (n: number) => n.toFixed(3);

  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Classify hours by period
  const horasPunta = hoy?.horas.filter(h =>
    (h.hora >= 10 && h.hora < 14) || (h.hora >= 18 && h.hora < 22)
  ) ?? [];
  const horasLlano = hoy?.horas.filter(h =>
    (h.hora >= 8 && h.hora < 10) || (h.hora >= 14 && h.hora < 18) || (h.hora >= 22 && h.hora < 24)
  ) ?? [];
  const horasValle = hoy?.horas.filter(h => h.hora >= 0 && h.hora < 8) ?? [];

  const avgPeriod = (arr: typeof horasPunta) =>
    arr.length > 0 ? arr.reduce((s, h) => s + h.precio_kwh, 0) / arr.length : 0;

  const mediaPunta = avgPeriod(horasPunta);
  const mediaLlano = avgPeriod(horasLlano);
  const mediaValle = avgPeriod(horasValle);

  // Appliance recommendations
  const appliances = [
    { name: "Lavadora", kWh: 1.2, icon: "W", best: "valle", tip: "Programa para las 03:00–06:00 h" },
    { name: "Lavavajillas", kWh: 1.5, icon: "D", best: "valle", tip: "Activa la función de inicio diferido" },
    { name: "Horno eléctrico", kWh: 2.0, icon: "H", best: "valle-llano", tip: "Cocina en fin de semana (todo valle) o almuerzo en llano" },
    { name: "Coche eléctrico", kWh: 7.5, icon: "E", best: "valle", tip: "Carga nocturna entre 00:00 y 08:00" },
    { name: "Termo de agua", kWh: 1.8, icon: "T", best: "valle", tip: "Programa para calentar a las 06:00–07:00" },
    { name: "Aire acondicionado", kWh: 1.0, icon: "A", best: "llano", tip: "Pre-enfría la casa a las 14:00–15:00 antes de punta" },
  ];

  return (
    <main className="bg-slate-50 min-h-screen font-sans">

      {/* Hero */}
      <div className="bg-emerald-900 pb-16 pt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3"></div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-4xl px-4 relative z-30 mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-emerald-300/70">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            </li>
            <li className="select-none">/</li>
            <li>
              <Link href="/precio-luz" className="hover:text-white transition-colors">Precio de la luz</Link>
            </li>
            <li className="select-none">/</li>
            <li className="text-white font-medium">Horas baratas</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-emerald-300 font-bold tracking-widest uppercase text-[10px]">Actualizado cada hora · Datos REE</p>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
            Horas Baratas de Luz Hoy<br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              ¿Cuándo es Más Barata?
            </span>
          </h1>

          <p className="text-base md:text-lg text-emerald-200 max-w-2xl mx-auto font-light leading-relaxed mb-3">
            {fechaHoy}
          </p>
          <p className="text-sm md:text-base text-emerald-300/80 max-w-2xl mx-auto leading-relaxed">
            Descubre las horas más baratas del PVPC para poner la lavadora, cargar el coche eléctrico
            o programar el lavavajillas. Precio hora a hora con datos oficiales de Red Eléctrica.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 space-y-12 -mt-8 relative z-20 pb-24">

        {/* Cheap hours grid */}
        {hoy && hoy.horasBaratas.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Las 6 horas más baratas de hoy
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Pon tus electrodomésticos de alto consumo en estas franjas para pagar menos en tu factura PVPC.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
              {(() => {
                const sorted = [...hoy.horasBaratas].sort((a, b) => a.hora - b.hora);
                const minPrice = Math.min(...sorted.map(h => h.precio_kwh));
                return sorted.map((h) => (
                  <div
                    key={h.hora}
                    className={`flex flex-col items-center rounded-xl p-4 ${
                      h.precio_kwh === minPrice
                        ? "border-2 border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                        : "border border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    {h.precio_kwh === minPrice && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                        Mejor hora
                      </span>
                    )}
                    <span className="text-3xl font-black text-emerald-700 tabular-nums">
                      {String(h.hora).padStart(2, "0")}:00
                    </span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums mt-1">
                      {fmt(h.precio_kwh)} €/kWh
                    </span>
                  </div>
                ));
              })()}
            </div>

            {/* Expensive hours */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-sm font-bold text-red-700 mb-3">Las 6 horas más caras — evita estas franjas</h3>
              <div className="flex flex-wrap gap-2">
                {hoy.horasCaras
                  .sort((a, b) => a.hora - b.hora)
                  .map((h) => (
                    <span key={h.hora} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-bold text-red-700 tabular-nums">
                      {String(h.hora).padStart(2, "0")}:00
                      <span className="text-red-400 text-xs">{fmt(h.precio_kwh)}€</span>
                    </span>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Precio medio por franja (resumen compacto) */}
        {hoy && hoy.horas.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Precio medio por franja horaria hoy
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Resumen del precio PVPC por franja del día — consulta el <Link href="/precio-luz" className="text-emerald-600 font-semibold underline underline-offset-2">gráfico hora a hora</Link> en la página principal.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Noche (00–08h)</p>
                <p className="text-3xl font-black text-indigo-700 tabular-nums">{fmt(mediaValle)} €</p>
                <p className="text-xs text-slate-500 mt-1">Franja valle — la más barata</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Mañana (08–14h)</p>
                <p className="text-3xl font-black text-amber-700 tabular-nums">{fmt((() => { const hrs = hoy.horas.filter(h => h.hora >= 8 && h.hora < 14); return hrs.length > 0 ? hrs.reduce((s, h) => s + h.precio_kwh, 0) / hrs.length : 0; })())} €</p>
                <p className="text-xs text-slate-500 mt-1">Incluye punta (10–14h)</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Tarde (14–00h)</p>
                <p className="text-3xl font-black text-orange-700 tabular-nums">{fmt((() => { const hrs = hoy.horas.filter(h => h.hora >= 14); return hrs.length > 0 ? hrs.reduce((s, h) => s + h.precio_kwh, 0) / hrs.length : 0; })())} €</p>
                <p className="text-xs text-slate-500 mt-1">Punta vespertina (18–22h)</p>
              </div>
            </div>
          </section>
        )}

        {/* Tramos horarios: punta, llano, valle */}
        {hoy && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Precio medio por tramo horario hoy
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Comparativa del coste real por kWh en cada periodo de discriminación horaria (tarifa 2.0TD).
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border-2 border-red-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-red-600">Punta</span>
                </div>
                <p className="text-3xl font-black text-red-700 tabular-nums">{fmt(mediaPunta)} €</p>
                <p className="text-xs text-slate-500 mt-1">10–14h y 18–22h (L-V)</p>
                <p className="text-xs text-red-500 font-semibold mt-2">
                  {mediaPunta > mediaValle
                    ? `${((mediaPunta / (mediaValle || 0.001) - 1) * 100).toFixed(0)}% más cara que valle`
                    : "–"}
                </p>
              </div>
              <div className="rounded-xl border-2 border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Llano</span>
                </div>
                <p className="text-3xl font-black text-amber-700 tabular-nums">{fmt(mediaLlano)} €</p>
                <p className="text-xs text-slate-500 mt-1">8–10h, 14–18h, 22–00h (L-V)</p>
              </div>
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Valle</span>
                </div>
                <p className="text-3xl font-black text-emerald-700 tabular-nums">{fmt(mediaValle)} €</p>
                <p className="text-xs text-slate-500 mt-1">00–08h todos los días + fines de semana</p>
                <p className="text-xs text-emerald-600 font-semibold mt-2">La franja más barata</p>
              </div>
            </div>
          </section>
        )}

        {/* Appliance guide */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            ¿Cuándo encender cada electrodoméstico?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Guía práctica para ahorrar hasta un 40% en tu factura programando el consumo a las horas valle.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map((a) => (
              <div key={a.name} className="rounded-xl border border-slate-200 p-5 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-black text-sm border border-slate-200">
                    {a.icon}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.kWh} kWh/ciclo</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{a.tip}</p>
                {hoy && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    Ahorro hoy: ~{fmt((mediaPunta - mediaValle) * a.kWh)} € vs punta
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Calculadora personalizada de ahorro */}
        <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/40 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Calculadora de ahorro por electrodoméstico
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Ajusta los usos semanales con los botones <strong>+ / −</strong> y descubre cuánto ahorras al pasar a horas valle.
          </p>
          <ElectrodomesticoCalculator
            precioPunta={mediaPunta}
            precioValle={mediaValle}
            precioLlano={mediaLlano}
          />
        </section>

        {/* Tomorrow preview */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Horas baratas de luz mañana
          </h2>
          {manana && manana.horas.length > 0 ? (
            <>
              <p className="text-slate-500 text-sm mb-6">
                Precios PVPC de mañana ({manana.fecha}) publicados por REE. Programa tus electrodomésticos con antelación.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {manana.horasBaratas
                  .sort((a, b) => a.hora - b.hora)
                  .map((h) => (
                    <div key={h.hora} className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <span className="text-2xl font-black text-emerald-700 tabular-nums">
                        {String(h.hora).padStart(2, "0")}:00
                      </span>
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">
                        {fmt(h.precio_kwh)} €
                      </span>
                    </div>
                  ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-slate-600">Media mañana: <strong className="tabular-nums">{fmt(manana.media)} €/kWh</strong></span>
                {hoy && (
                  <span className={manana.media > hoy.media ? "text-red-600" : "text-emerald-600"}>
                    {manana.media > hoy.media ? "↑" : "↓"} {Math.abs(((manana.media - hoy.media) / (hoy.media || 1)) * 100).toFixed(0)}% vs hoy
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-sm font-semibold text-amber-800 mb-1">Precios de mañana aún no disponibles</p>
              <p className="text-xs text-amber-600">
                REE publica los precios del día siguiente a partir de las 20:15 h.
              </p>
            </div>
          )}
        </section>

        {/* FAQ Schema / SEO Text */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
            ¿Cómo se determina cuándo es más barata la luz?
          </h2>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <p>
              El precio de la electricidad en la tarifa PVPC se fija cada hora mediante la subasta diaria del
              mercado mayorista operado por <strong>OMIE</strong>. Las horas más baratas coinciden con periodos de
              alta generación renovable (eólica y solar) y baja demanda, como las madrugadas y los fines de semana.
            </p>
            <p>
              La tarifa <strong>2.0TD con discriminación horaria</strong> divide el día en tres tramos: punta (10–14h y 18–22h,
              la más cara), llano (8–10h, 14–18h y 22–00h) y valle (00–08h, la más barata). Los sábados, domingos
              y festivos nacionales <strong>todas las horas son valle</strong>, lo que convierte el fin de semana
              en el mejor momento para concentrar el consumo de electrodomésticos de alto consumo.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
            Consejos para ahorrar con la discriminación horaria
          </h2>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <p>
              Desplazar al menos un 30% de tu consumo a horas valle puede reducir tu factura entre un 15% y un 40%.
              Aquí tienes las estrategias más efectivas, ordenadas por impacto:
            </p>
            <ol>
              <li><strong>Programa la lavadora y el lavavajillas</strong> con inicio diferido para que funcionen entre las 02:00 y las 06:00.</li>
              <li><strong>Carga el coche eléctrico de noche</strong> (00:00–08:00). Un ciclo de carga completo consume 7–10 kWh; en valle te ahorras hasta 1,50 € por carga frente a punta.</li>
              <li><strong>Ajusta el termostato del termo eléctrico</strong> para que caliente el agua a las 06:00–07:00 (final de valle).</li>
              <li><strong>Pre-enfría o pre-calienta la casa</strong> media hora antes del cambio a punta. La inercia térmica mantiene la temperatura sin consumo en las horas caras.</li>
              <li><strong>Cocina en fin de semana</strong> cuando todo es valle. Usa el horno y la vitrocerámica para preparar comidas de la semana (batch cooking).</li>
            </ol>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
            Preguntas frecuentes sobre horas baratas de luz
          </h2>
          <div className="space-y-6">
            <details className="group" open>
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿Cuándo es más barata la luz hoy?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {hoy?.horasBaratas
                  ? `Hoy las horas más baratas son ${hoy.horasBaratas.sort((a, b) => a.hora - b.hora).map(h => `${String(h.hora).padStart(2, "0")}:00`).join(", ")} con precios entre ${fmt(hoy.horasBaratas[0]?.precio_kwh ?? 0)} y ${fmt(hoy.horasBaratas[hoy.horasBaratas.length - 1]?.precio_kwh ?? 0)} €/kWh. `
                  : "Los precios se actualizan cada hora. "}
                Generalmente, las horas valle (00:00 – 08:00) ofrecen el precio PVPC más bajo,
                aunque el precio exacto varía cada día según la demanda y la generación renovable.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿A qué hora poner la lavadora para ahorrar?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Lo ideal es programarla para que funcione entre las 02:00 y las 06:00 (hora valle).
                Un ciclo de lavadora consume entre 1 y 1,5 kWh. A precio valle puedes ahorrar
                entre 0,10 € y 0,20 € por lavado frente a hora punta. Si acumulas 5 lavados/semana,
                son 30–50 € al año solo en lavadora.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿Merece la pena la discriminación horaria?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Sí, si puedes desplazar al menos un 30% de tu consumo a horas valle. La tarifa 2.0TD
                con discriminación horaria premia el consumo nocturno y de fin de semana.
                {hoy && mediaPunta > 0 && mediaValle > 0 && (
                  <> Hoy la diferencia entre punta ({fmt(mediaPunta)} €) y valle ({fmt(mediaValle)} €) es de {fmt(mediaPunta - mediaValle)} €/kWh,
                    lo que supone un {((1 - mediaValle / mediaPunta) * 100).toFixed(0)}% de ahorro por kWh desplazado.</>
                )}
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿Cuándo es más barata la luz los fines de semana?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Los sábados, domingos y festivos nacionales tienen tarifa valle las 24 horas. Es decir,
                todas las horas se cobran al tramo más barato. Es el mejor momento para tareas de alto
                consumo como pasar la aspiradora, cocinar con el horno o cargar el coche eléctrico.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿A qué hora cargar el coche eléctrico para ahorrar más?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Lo ideal es cargar entre las 00:00 y las 08:00 (hora valle). Una carga completa
                consume entre 7 y 10 kWh. A precio valle te ahorras entre 0,70 € y 1,50 € por
                carga frente a hora punta. Si cargas 3–4 veces por semana, son 150–300 € al año.
                Configura el temporizador del cargador o del propio vehículo para inicio diferido.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿Cuánto ahorro si muevo el consumo a horas valle?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Desplazar un 30–40% del consumo a horas valle puede reducir tu factura entre 150 y 400 €/año,
                dependiendo de tu consumo total. Los electrodomésticos más rentables de programar son la lavadora,
                el lavavajillas, el termo de agua y el coche eléctrico.
                {hoy && mediaPunta > 0 && mediaValle > 0 && (
                  <> Hoy la diferencia punta vs valle es de {fmt(mediaPunta - mediaValle)} €/kWh,
                    un {((1 - mediaValle / mediaPunta) * 100).toFixed(0)}% más barato por kWh desplazado.</>
                )}
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-bold text-slate-800 group-open:text-emerald-700 transition-colors">
                  ¿Cómo puedo dejar de depender del precio de la luz?
                </h3>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Instalando placas solares en autoconsumo produces tu propia electricidad durante las
                horas de sol (justo cuando la tarifa PVPC es más cara). Un hogar medio en España puede
                cubrir el 60–80% de su consumo diurno con paneles, reduciendo su factura entre 600 y 1.200 €/año.
                Los excedentes se compensan en tu factura a precio de mercado.
              </p>
            </details>
          </div>
        </section>

        {/* Solar CTA */}
        <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
            Genera tu propia electricidad a coste fijo
          </h2>
          <p className="text-indigo-200 max-w-2xl mx-auto mb-8">
            Con placas solares produces energía gratis durante las horas punta, cuando la luz es más cara.
            Calcula cuánto ahorrarías en tu municipio con datos reales de irradiación y tarifa PVPC.
          </p>
          <LocationSearchBar baseRoute="/placas-solares" placeholder="Tu municipio: calcula tu ahorro solar..." />
        </section>

        {/* Related pages */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Páginas relacionadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/precio-luz"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">P</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">Precio de la Luz Hoy</p>
                <p className="text-xs text-slate-500">Gráfico 24h y análisis PVPC en tiempo real</p>
              </div>
            </Link>
            <Link
              href="/placas-solares"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-amber-50 hover:border-amber-300 transition-colors group"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm shrink-0">S</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-700">Placas Solares por Municipio</p>
                <p className="text-xs text-slate-500">Calcula tu ahorro solar con datos reales</p>
              </div>
            </Link>
            <Link
              href="/subvenciones-solares"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm shrink-0">A</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Subvenciones y Ayudas</p>
                <p className="text-xs text-slate-500">Bonificaciones IBI, ICIO y ayudas autonómicas</p>
              </div>
            </Link>
            <Link
              href="/baterias-solares"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-purple-50 hover:border-purple-300 transition-colors group"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 text-purple-700 font-bold text-sm shrink-0">B</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700">Baterías Solares</p>
                <p className="text-xs text-slate-500">Almacena excedentes y reduce tu dependencia</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Sources */}
        <footer className="text-center text-xs text-slate-400">
          <p>
            Datos PVPC: <strong>Red Eléctrica de España (REE)</strong> / ESIOS. Actualización automática cada hora.
            Los precios mostrados corresponden a la tarifa regulada 2.0TD para potencia ≤ 10 kW, sin impuestos.
          </p>
        </footer>
      </div>

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "¿Cuándo es más barata la luz hoy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Las horas más baratas suelen ser entre las 00:00 y las 08:00 (horario valle de la tarifa 2.0TD). ${hoy?.horasBaratas ? `Hoy concretamente las mejores son ${hoy.horasBaratas.sort((a, b) => a.hora - b.hora).map(h => String(h.hora).padStart(2, "0") + ":00").join(", ")}.` : ""}`,
                },
              },
              {
                "@type": "Question",
                name: "¿A qué hora poner la lavadora para ahorrar?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Lo ideal es programarla entre las 02:00 y las 06:00 (hora valle). Un ciclo consume entre 1 y 1,5 kWh, ahorrando 0,10–0,20 € por lavado frente a hora punta.",
                },
              },
              {
                "@type": "Question",
                name: "¿Merece la pena la discriminación horaria?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sí, si puedes desplazar al menos un 30% de tu consumo a horas valle. La tarifa 2.0TD premia el consumo nocturno y de fin de semana, con ahorros de hasta el 40%.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cuándo es más barata la luz los fines de semana?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Los sábados, domingos y festivos nacionales tienen tarifa valle las 24 horas. Todas las horas se cobran al tramo más barato.",
                },
              },
              {
                "@type": "Question",
                name: "¿A qué hora cargar el coche eléctrico para ahorrar más?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Lo ideal es cargar entre las 00:00 y las 08:00 (hora valle). Una carga completa consume 7–10 kWh. A precio valle te ahorras entre 0,70 € y 1,50 € por carga frente a hora punta, unos 150–300 € al año.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cuánto ahorro si muevo el consumo a horas valle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Desplazar un 30–40% del consumo a horas valle puede reducir tu factura entre 150 y 400 €/año. Los electrodomésticos más rentables de programar son la lavadora, el lavavajillas, el termo de agua y el coche eléctrico.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cómo puedo dejar de depender del precio de la luz?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Instalando placas solares en autoconsumo produces tu propia electricidad durante las horas de sol. Un hogar medio puede cubrir el 60–80% de su consumo diurno, ahorrando entre 600 y 1.200 €/año.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
