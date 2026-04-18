import { getMunicipalityBySlug } from "@/data/repositories/municipalities.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapSharedSelfConsumptionCopy } from "@/modules/autoconsumo-compartido/mapper";

export async function getSharedSelfConsumptionPageData(municipio: string) {
  const municipality = await getMunicipalityBySlug(municipio);
  if (!municipality) return null;

  const copy = mapSharedSelfConsumptionCopy(municipality);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipality.slug,
    municipioName: municipality.name,
    provincia: municipality.province,
    comunidadAutonoma: municipality.autonomousCommunity
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.header.titleHighlight, municipality.name, copy.header.description),
    municipality
  };
}