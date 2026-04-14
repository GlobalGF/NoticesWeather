import React from "react";

interface IncentivesModuleProps {
  ibi?: number;
  icio?: number;
  roi?: number | null;
}

const IncentivesModule: React.FC<IncentivesModuleProps> = ({ ibi, icio, roi }) => (
  <section className="my-8 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-md">
    <h3 className="text-xl font-bold text-emerald-900 mb-2">Ayudas y Bonificaciones</h3>
    <ul className="list-disc list-inside text-emerald-800 mb-2">
      {ibi ? <li>Bonificación IBI: <span className='font-bold'>{ibi}%</span></li> : null}
      {icio ? <li>Bonificación ICIO: <span className='font-bold'>{icio}%</span></li> : null}
      {!ibi && !icio && <li>No se han identificado incentivos específicos para este municipio.</li>}
    </ul>
    <div className="mt-2 text-emerald-700">
      {roi ? (
        <span>Retorno estimado de la inversión: <span className='font-bold'>{roi.toLocaleString("es-ES", { maximumFractionDigits: 1 })} años</span></span>
      ) : (
        <span>Solicita un estudio personalizado para calcular el ROI exacto.</span>
      )}
    </div>
  </section>
);

export default IncentivesModule;
