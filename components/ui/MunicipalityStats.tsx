type Props = {
  productionKwh: number;
  savingsEur: number;
  paybackYears: number;
};

export function MunicipalityStats({ productionKwh, savingsEur, paybackYears }: Props) {
  return (
    <section className="grid gap-3 md:grid-cols-3" aria-label="Resumen energetico del municipio">
      <article className="card">
        <h3 className="text-sm font-medium text-slate-500">Produccion anual estimada</h3>
        <p className="mt-2 text-2xl font-semibold">{productionKwh.toLocaleString("es-ES")} kWh</p>
      </article>
      <article className="card">
        <h3 className="text-sm font-medium text-slate-500">Ahorro anual estimado</h3>
        <p className="mt-2 text-2xl font-semibold">{savingsEur.toLocaleString("es-ES")} EUR</p>
      </article>
      <article className="card">
        <h3 className="text-sm font-medium text-slate-500">Retorno de inversion</h3>
        <p className="mt-2 text-2xl font-semibold">{paybackYears.toFixed(1)} anos</p>
      </article>
    </section>
  );
}
