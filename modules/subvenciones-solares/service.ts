import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getActiveSubsidyByMunicipality } from "@/data/repositories/subsidies.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify, normalizeCcaaSlug } from "@/lib/utils/slug";
import { mapSubsidyCopy } from "@/modules/subvenciones-solares/mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSubsidyPageData(
  comunidad: string,
  provincia: string,
  municipio: string
) {
  const municipality = await getMunicipioEnergiaBySlug(municipio);
  if (!municipality) return null;

  const dbProvSlug = slugify(municipality.provincia);
  const dbCcaaSlug = normalizeCcaaSlug(municipality.comunidadAutonoma);

  if (dbCcaaSlug !== comunidad || dbProvSlug !== provincia) return null;

  // Attempt to fetch specific municipal subsidy
  let subsidy = await getActiveSubsidyByMunicipality(municipio);

  // Fallback to CCAA regional subsidy if specific one doesn't exist
  if (!subsidy) {
    const supabase = await createSupabaseServerClient();
    const { data: ccaaDataRaw } = await supabase
      .from("subvenciones_solares_ccaa_es")
      .select("*")
      .ilike("comunidad_autonoma", municipality.comunidadAutonoma)
      .maybeSingle();

    const ccaaData = ccaaDataRaw as any;

    if (ccaaData) {
      subsidy = {
        municipalitySlug: municipio,
        programSlug: "autonomica",
        programName: ccaaData.programa || `Plan de Ayudas de ${municipality.comunidadAutonoma}`,
        amountEur: ccaaData.max_subvencion_euros || 3000,
        sourceUrl: null,
        status: "ABIERTA",
        finPlazo: ccaaData.fecha_fin,
        // We'll store the percentage in metadata if needed, but for the summary card we use it
      };
      // Inject percentage into a temporary property or handle in mapper
      (subsidy as any).percentage = ccaaData.subvencion_porcentaje;
    }
  }

  if (!subsidy) return null;

  const copy = mapSubsidyCopy(municipality, subsidy);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    municipioName: municipality.municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma,
    currentModule: "subvenciones"
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.title, municipality.municipio, copy.intro),
    municipality,
    subsidy,
    subsidyStatus: subsidy.status,
    subsidyDeadline: subsidy.finPlazo,
    bdnsId: subsidy.bdnsId,
    sourceUrl: subsidy.sourceUrl
  };
}
