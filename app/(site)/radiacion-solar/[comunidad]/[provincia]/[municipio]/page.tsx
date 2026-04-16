import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { PvgisEstimator } from "@/components/ui/PvgisEstimator";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { slugify, cleanMunicipalitySlug, normalizeCcaaSlug } from "@/lib/utils/slug";
import { radiationMetadata } from "@/modules/radiacion-solar/seo";
import { getRadiationPageData } from "@/modules/radiacion-solar/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.radiation;
export const dynamicParams = true;

type Props = {
  params: { comunidad: string; provincia: string; municipio: string };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_RADIACION_GEO", 800);
    return getTopMunicipiosEnergiaGeoPaths(budget);
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad, provincia, municipio } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/radiacion-solar/${comunidad}/${provincia}/${municipio}`,
    noIndex: true
  });

  const data = await getRadiationPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data || !data.municipality) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/radiacion-solar/${comunidad}/${provincia}/${municipio}`,
    noIndex: true
  });

  // Canonical logic: metadata uses clean database slugs, page component handles the redirect
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  return radiationMetadata(dbCcaaSlug, dbProvSlug, dbMuniSlug, data.municipality.municipio);
}

export default async function RadiationPage({ params }: Props) {
  const { comunidad, provincia, municipio } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio) notFound();

  const data = await getRadiationPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data || !data.municipality) notFound();

  // Redirect to canonical
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  if (comunidad !== dbCcaaSlug || provincia !== dbProvSlug || municipio !== dbMuniSlug) {
      permanentRedirect(`/radiacion-solar/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`);
  }

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
