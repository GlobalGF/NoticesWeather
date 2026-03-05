import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getRadiationByMunicipalitySlug } from "@/data/repositories/radiation.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify } from "@/lib/utils/slug";
import { mapRadiationCopy } from "@/modules/radiacion-solar/mapper";

export async function getRadiationPageData(comunidad: string, provincia: string, municipio: string) {
  const [municipality, radiation] = await Promise.all([
    getMunicipioEnergiaBySlug(municipio),
    getRadiationByMunicipalitySlug(municipio)
  ]);

  if (!municipality || !radiation) return null;

  if (slugify(municipality.comunidadAutonoma) !== comunidad || slugify(municipality.provincia) !== provincia) {
    return null;
  }

  const copy = mapRadiationCopy(municipality, radiation);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.title, municipality.municipio, copy.intro),
    municipality,
    radiation
  };
}
