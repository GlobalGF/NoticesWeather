import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { getTopSubsidyProgramSlugs } from "@/data/repositories/subsidies.repo";
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
    programa: string;
  };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const municipioBudget = getStaticPrebuildBudget("PSEO_PREBUILD_SUBVENCIONES_GEO", 500);
    const programBudget = getStaticPrebuildBudget("PSEO_PREBUILD_SUBVENCIONES_PROGRAMAS", 3);

    const [geoPaths, programs] = await Promise.all([
      getTopMunicipiosEnergiaGeoPaths(municipioBudget),
      getTopSubsidyProgramSlugs(programBudget)
    ]);

    return geoPaths.flatMap((geo) => programs.map((programa) => ({ ...geo, programa })));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad, provincia, municipio, programa } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedPrograma = tryParseSlug(programa);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedPrograma) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}/${programa}`,
    noIndex: true
  });

  const data = await getSubsidyPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedPrograma);
  if (!data || !data.municipality) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}/${programa}`,
    noIndex: true
  });

  // Forzar canónica en metadata
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  return subsidyMetadata(
    dbCcaaSlug,
    dbProvSlug,
    dbMuniSlug,
    parsedPrograma,
    data.municipality.municipio,
    data.subsidy.programName
  );
}

export default async function SubsidyPage({ params }: Props) {
  const { comunidad, provincia, municipio, programa } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedPrograma = tryParseSlug(programa);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedPrograma) notFound();

  const data = await getSubsidyPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedPrograma);
  if (!data || !data.municipality) notFound();

  // Redirect to canonical
  const dbCcaaSlug = normalizeCcaaSlug(data.municipality.comunidadAutonoma);
  const dbProvSlug = slugify(data.municipality.provincia);
  const dbMuniSlug = cleanMunicipalitySlug(data.municipality.slug, dbProvSlug);

  if (comunidad !== dbCcaaSlug || provincia !== dbProvSlug || municipio !== dbMuniSlug) {
      permanentRedirect(`/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}/${parsedPrograma}`);
  }

  return <SeoLandingTemplate {...data} />;
}
