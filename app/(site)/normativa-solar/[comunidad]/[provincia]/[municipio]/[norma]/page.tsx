import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { getTopUrbanRuleSlugs } from "@/data/repositories/urban-regulations.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { urbanRegulationMetadata } from "@/modules/normativa-solar/seo";
import { getUrbanRegulationPageData } from "@/modules/normativa-solar/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.regulation;
export const dynamicParams = true;

type Props = {
  params: {
    comunidad: string;
    provincia: string;
    municipio: string;
    norma: string;
  };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const municipioBudget = getStaticPrebuildBudget("PSEO_PREBUILD_NORMATIVA_GEO", 500);
    const ruleBudget = getStaticPrebuildBudget("PSEO_PREBUILD_NORMATIVA_REGLAS", 3);

    const [geoPaths, rules] = await Promise.all([
      getTopMunicipiosEnergiaGeoPaths(municipioBudget),
      getTopUrbanRuleSlugs(ruleBudget)
    ]);

    return geoPaths.flatMap((geo) => rules.map((norma) => ({ ...geo, norma })));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad, provincia, municipio, norma } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedNorma = tryParseSlug(norma);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedNorma) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/normativa-solar/${comunidad}/${provincia}/${municipio}/${norma}`,
    noIndex: true
  });

  const data = await getUrbanRegulationPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedNorma);
  if (!data) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/normativa-solar/${comunidad}/${provincia}/${municipio}/${norma}`,
    noIndex: true
  });

  return urbanRegulationMetadata(
    parsedComunidad,
    parsedProvincia,
    parsedMunicipio,
    parsedNorma,
    data.municipality.municipio,
    data.regulation.title
  );
}

export default async function UrbanRegulationPage({ params }: Props) {
  const { comunidad, provincia, municipio, norma } = params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedNorma = tryParseSlug(norma);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedNorma) notFound();

  const data = await getUrbanRegulationPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedNorma);
  if (!data) notFound();

  return <SeoLandingTemplate {...data} />;
}
