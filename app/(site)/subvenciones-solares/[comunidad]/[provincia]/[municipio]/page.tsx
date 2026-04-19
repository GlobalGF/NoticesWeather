import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { slugify, cleanMunicipalitySlug, normalizeCcaaSlug } from "@/lib/utils/slug";
import { subsidyMetadata } from "@/modules/subvenciones-solares/seo";
import { getSubsidyPageData } from "@/modules/subvenciones-solares/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.subsidy;
export const dynamicParams = true;

type Props = {
  params: {
    comunidad: string;
    provincia: string;
    municipio: string;
  };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const municipioBudget = getStaticPrebuildBudget("PSEO_PREBUILD_SUBVENCIONES_GEO", 500);
    const geoPaths = await getTopMunicipiosEnergiaGeoPaths(municipioBudget);
    return geoPaths;
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
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}`,
    noIndex: true
  });

  const data = await getSubsidyPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data || !data.municipality || !data.subsidy) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}`,
    noIndex: true
  });

  // Forzar canónica en metadata
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  return buildMetadata({
    title: data.title,
    description: data.intro.length > 160 ? data.intro.substring(0, 157) + "..." : data.intro,
    pathname: `/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`
  });
}

export default async function SubsidyPage({ params }: Props) {
  const { comunidad, provincia, municipio } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio) notFound();

  const data = await getSubsidyPageData(parsedComunidad, parsedProvincia, parsedMunicipio);
  if (!data || !data.municipality || !data.subsidy) notFound();

  // Redirect to canonical
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  if (comunidad !== dbCcaaSlug || provincia !== dbProvSlug || municipio !== dbMuniSlug) {
      permanentRedirect(`/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`);
  }

  return <SeoLandingTemplate {...data} municipioName={data.municipality.municipio} />;
}
