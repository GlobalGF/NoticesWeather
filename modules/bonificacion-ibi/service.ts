import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapIbiCopy } from "@/modules/bonificacion-ibi/mapper";

export async function getIbiPageData(municipio: string) {
  const municipality = await getMunicipioEnergiaBySlug(municipio);

  if (!municipality) return null;

  const copy = mapIbiCopy(municipality);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipality.slug,
    municipioName: municipality.municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma,
    currentModule: "ibi"
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(`${copy.header.titlePrefix} ${copy.header.titleHighlight}`, municipality.municipio, copy.header.description),
    municipality
  };
}