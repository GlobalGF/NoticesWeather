import { getIbiByMunicipalitySlug } from "@/data/repositories/ibi.repo";
import { getMunicipalityBySlug } from "@/data/repositories/municipalities.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapIbiCopy } from "@/modules/bonificacion-ibi/mapper";

export async function getIbiPageData(municipio: string) {
  const [municipality, ibi] = await Promise.all([
    getMunicipalityBySlug(municipio),
    getIbiByMunicipalitySlug(municipio)
  ]);

  if (!municipality || !ibi) return null;

  const copy = mapIbiCopy(municipality, ibi.percentage, ibi.years);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipality.slug,
    municipioName: municipality.name,
    provincia: municipality.province,
    comunidadAutonoma: municipality.autonomousCommunity
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.title, municipality.name, copy.intro),
    municipality
  };
}