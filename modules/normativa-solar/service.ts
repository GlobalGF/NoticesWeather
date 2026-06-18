import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getUrbanRegulationByMunicipalityAndRule } from "@/data/repositories/urban-regulations.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify } from "@/lib/utils/slug";
import { mapUrbanRegulationCopy } from "@/modules/normativa-solar/mapper";

export async function getUrbanRegulationPageData(
  comunidad: string,
  provincia: string,
  municipio: string,
  norma: string
) {
  const [municipality, regulation] = await Promise.all([
    getMunicipioEnergiaBySlug(municipio),
    getUrbanRegulationByMunicipalityAndRule(municipio, norma)
  ]);

  if (!municipality || !regulation) return null;

  // CCAA/province canonicalization is handled by the page component via permanentRedirect.
  // Do NOT return null for non-canonical URL slugs here.

  const copy = mapUrbanRegulationCopy(municipality, regulation);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    municipioName: municipality.municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(`${copy.header.titlePrefix} ${copy.header.titleHighlight}`, municipality.municipio, copy.header.description),
    municipality,
    regulation
  };
}
