import React from "react";

type AntiCommercialWarningProps = {
  municipio: string;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
};

export function AntiCommercialWarning({ municipio, irradiacionAnual, horasSol }: AntiCommercialWarningProps) {
  // We determine a "high risk" factor if radiation is particularly low, but generally we play the honesty card.
  const isBajoRendimiento = (horasSol && horasSol < 1400) || (irradiacionAnual && irradiacionAnual < 1300);

  return (
    <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 mt-6 mb-8 text-left shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Asesoramiento Experto: Requisitos para una instalación rentable
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Para garantizar que tu inversión en {municipio} recupere su coste rápidamente, te recomendamos verificar que tu vivienda cumple con el perfil ideal para instalar placas solares:
          </p>
          <ul className="text-slate-600 text-sm space-y-3 mb-5">
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              <span><strong>Cubierta en buen estado:</strong> Tu tejado debe estar libre de desgaste estructural o materiales protegidos como la uralita (amianto).</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              <span><strong>Orientación óptima:</strong> Disponer de espacio libre orientado al Sur, Este u Oeste, evitando orientaciones puramente orientadas al Norte.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              <span><strong>Libre de sombras:</strong> Ausencia de edificios muy cercanos o árboles frondosos que proyecten sombra sobre el tejado durante las horas punta.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              <span><strong>Consumo eléctrico relevante:</strong> Facturas de luz que superen los 40€-50€ mensuales para acortar el plazo de amortización.</span>
            </li>
          </ul>
          
          {isBajoRendimiento ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 text-xs leading-relaxed">
                <span className="font-bold block mb-1">Nota sobre la radiación local:</span>
                Dado que los registros geográficos en el área de {municipio} están en la franja baja de horas de sol, es especialmente importante que confíes el proyecto a un instalador certificado que diseñe un estudio en 3D detallado para compensarlo adecuadamente.
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-xs bg-white rounded-lg p-3 border border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              A la hora de solicitar presupuesto en {municipio}, pide siempre que te realicen un estudio 3D completo de tus cubiertas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
