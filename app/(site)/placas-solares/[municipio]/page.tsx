import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { estimatePaybackYears } from "@/calculators/payback";
import { estimateAnnualPvProduction } from "@/calculators/pv-production";
import { estimateAnnualSavings } from "@/calculators/savings";
import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";
import { LeadCaptureForm } from "@/components/ui/LeadCaptureForm";
import { MunicipalityStats } from "@/components/ui/MunicipalityStats";
import {
  getMunicipioEnergiaBySlug,
  getTopMunicipiosEnergiaSlugs
} from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { buildSolarEnergyPageSchema } from "@/lib/seo/schema-org";
import { tryParseSlug } from "@/lib/utils/params";
import { buildPlacasContentTemplate } from "@/modules/placas-solares/content-template";

export const revalidate = cachePolicy.page.solarCity;
// App Router equivalent of fallback: "blocking": prebuild a subset and render the rest on-demand.
export const dynamicParams = true;
export const runtime = "nodejs";

type Props = {
  params: { municipio: string };
};

export async function generateStaticParams() {
  const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS", 2000);
  const top = await getTopMunicipiosEnergiaSlugs(budget);
  return top.map((m) => ({ municipio: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio } = params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) return {};
  const data = await getMunicipioEnergiaBySlug(parsed);
  if (!data) return {};

  const title = `Placas solares en ${data.municipio}: produccion, ahorro y rentabilidad`;
  const description = `Analisis en ${data.municipio}: horas de sol, precio medio de luz, subvencion, bonificacion IBI/ICIO y ahorro estimado.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/placas-solares/${data.slug}`
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      url: `/placas-solares/${data.slug}`
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function PlacasMunicipioPage({ params }: Props) {
  const { municipio } = params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) notFound();
  const data = await getMunicipioEnergiaBySlug(parsed);
  if (!data) notFound();

  const productionKwh = Math.round(estimateAnnualPvProduction(data.irradiacionSolar, 4.5));
  const savingsEur = Math.round(estimateAnnualSavings(productionKwh, 0.67, data.precioMedioLuz));
  const paybackYears = estimatePaybackYears(6200, savingsEur);
  const content = buildPlacasContentTemplate(data, paybackYears);

  const schemaGraph = buildSolarEnergyPageSchema({
    municipality: data.municipio,
    province: data.provincia,
    pagePath: `/placas-solares/${data.slug}`,
    serviceName: `Instalacion de placas solares en ${data.municipio}`,
    serviceDescription: content.intro,
    productName: `Kit solar residencial en ${data.municipio}`,
    productDescription: `${content.roiBody} Ahorro anual estimado de ${savingsEur.toLocaleString("es-ES")} EUR.`,
    productPriceEur: 6200,
    faqs: content.faqs
  });

  return (
    <article className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
      <header className="card overflow-hidden">
        <div className="grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Placas solares</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{content.h1}</h1>
            <p className="mt-3 text-slate-600">{content.intro}</p>
          </div>

          <Image
            src="/next.svg"
            alt={`Resumen solar en ${data.municipio}`}
            width={280}
            height={160}
            priority
            className="h-auto w-full max-w-[280px] justify-self-center rounded-xl border border-emerald-100 bg-white p-4"
          />
        </div>
      </header>

      <MunicipalityStats productionKwh={productionKwh} savingsEur={savingsEur} paybackYears={paybackYears} />

      <section className="card">
        <h2 className="text-xl font-semibold">{content.ahorroTitle}</h2>
        <p className="mt-3 text-slate-700">{content.ahorroBody}</p>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{content.horasSolTitle}</h2>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">Contexto solar en {data.municipio}</h3>
        <p className="mt-2 text-slate-700">{content.horasSolBody}</p>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{content.ayudasTitle}</h2>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">Incentivos activos</h3>
        <p className="mt-2 text-slate-700">{content.ayudasBody}</p>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>
            <strong>Bonificacion IBI:</strong> {data.bonificacionIbi ?? 0}%
          </li>
          <li>
            <strong>Subvencion autoconsumo:</strong> {(data.subvencionAutoconsumo ?? 0).toLocaleString("es-ES")} EUR
          </li>
          <li>
            <strong>Precio medio luz:</strong> {data.precioMedioLuz.toLocaleString("es-ES", { maximumFractionDigits: 3 })} EUR/kWh
          </li>
          <li>
            <strong>Ahorro estimado anual:</strong> {data.ahorroEstimado.toLocaleString("es-ES")} EUR
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{content.roiTitle}</h2>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">Retorno orientativo en {data.municipio}</h3>
        <p className="mt-2 text-slate-700">{content.roiBody}</p>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Calculadora: cuantas baterias solares necesito</h2>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">Simulador rapido para {data.municipio}</h3>
        <BatteryNeedsCalculator municipio={data.municipio} annualSunHours={data.horasSol} />
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-4 space-y-4">
          {content.faqs.map((faq) => (
            <article key={faq.question}>
              <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
              <p className="mt-1 text-slate-700">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card border-emerald-200 bg-emerald-50">
        <h2 className="text-xl font-semibold text-emerald-900">{content.ctaTitle}</h2>
        <p className="mt-2 text-emerald-800">{content.ctaBody}</p>
        <div className="mt-4">
          <LeadCaptureForm
            municipio={data.municipio}
            provincia={data.provincia}
            precioLuzEurKwh={data.precioMedioLuz}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Detalle tecnico del municipio</h2>
        <ul className="mt-3 space-y-2 text-slate-700">
          <li>
            <strong>Municipio:</strong> {data.municipio}
          </li>
          <li>
            <strong>Provincia:</strong> {data.provincia}
          </li>
          <li>
            <strong>Comunidad:</strong> {data.comunidadAutonoma}
          </li>
          <li>
            <strong>Irradiacion anual:</strong> {data.irradiacionSolar.toLocaleString("es-ES")} kWh/m2
          </li>
          <li>
            <strong>Horas de sol:</strong> {data.horasSol.toLocaleString("es-ES")}
          </li>
          <li>
            <strong>Precio medio de luz:</strong> {data.precioMedioLuz.toLocaleString("es-ES", { maximumFractionDigits: 3 })} EUR/kWh
          </li>
          <li>
            <strong>Ahorro estimado:</strong> {data.ahorroEstimado.toLocaleString("es-ES")} EUR
          </li>
          <li>
            <strong>Habitantes:</strong> {data.habitantes.toLocaleString("es-ES")}
          </li>
          <li>
            <strong>Bonificacion IBI:</strong> {data.bonificacionIbi ?? 0}%
          </li>
          <li>
            <strong>Bonificacion ICIO:</strong> {data.bonificacionIcio ?? 0}%
          </li>
        </ul>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
    </article>
  );
}