import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { getTopSubsidyProgramSlugs } from "@/data/repositories/subsidies.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
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
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedPrograma) return {};

  const data = await getSubsidyPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedPrograma);
  if (!data) return {};

  return subsidyMetadata(
    parsedComunidad,
    parsedProvincia,
    parsedMunicipio,
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
  if (!data) notFound();

  return <SeoLandingTemplate {...data} />;
}
