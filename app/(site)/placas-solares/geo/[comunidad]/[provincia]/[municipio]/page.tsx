import { notFound, redirect } from "next/navigation";
import { getMunicipioEnergiaBySlug, getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { slugify } from "@/lib/utils/slug";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.solarCity;
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
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS_GEO", 800);
    return getTopMunicipiosEnergiaGeoPaths(budget);
  });
}

export default async function PlacasMunicipioGeoPage({ params }: Props) {
  const comunidad = tryParseSlug(params.comunidad);
  const provincia = tryParseSlug(params.provincia);
  const municipio = tryParseSlug(params.municipio);

  if (!comunidad || !provincia || !municipio) {
    notFound();
  }

  const data = await getMunicipioEnergiaBySlug(municipio);
  if (!data) notFound();

  // Prevent indexing malformed geo combinations and keep one canonical URL.
  if (slugify(data.comunidadAutonoma) !== comunidad || slugify(data.provincia) !== provincia) {
    notFound();
  }

  redirect(`/placas-solares/${data.slug}`);
}
