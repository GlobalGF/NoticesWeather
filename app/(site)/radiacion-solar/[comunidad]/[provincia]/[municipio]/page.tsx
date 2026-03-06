import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { PvgisEstimator } from "@/components/ui/PvgisEstimator";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { radiationMetadata } from "@/modules/radiacion-solar/seo";
import { getRadiationPageData } from "@/modules/radiacion-solar/service";

export const revalidate = cachePolicy.page.radiation;
export const dynamicParams = true;

type Props = {
  params: Promise<{ comunidad: string; provincia: string; municipio: string }>;
};

export async function generateStaticParams() {
  const budget = getStaticPrebuildBudget("PSEO_PREBUILD_RADIACION_GEO", 800);
  return getTopMunicipiosEnergiaGeoPaths(budget);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad, provincia, municipio } = await params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio) return {};

  const data = await getRadiationPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data) return {};

  return radiationMetadata(parsedComunidad, parsedProvincia, parsedMunicipio, data.municipality.municipio);
}

export default async function RadiationPage({ params }: Props) {
  const { comunidad, provincia, municipio } = await params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio) notFound();

  const data = await getRadiationPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data) notFound();

  return (
    <>
      <SeoLandingTemplate {...data} municipioSlug={parsedMunicipio} showSolarStats />
      <section className="card mt-6">
        <h2 className="text-xl font-semibold">Estimador PVGIS</h2>
        <h3 className="mt-1 text-lg font-semibold text-slate-800">Produccion, orientacion y sombras</h3>
        <div className="mt-4">
          <PvgisEstimator municipio={data.municipality.municipio} />
        </div>
      </section>
    </>
  );
}
