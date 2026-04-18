import { getInverterEvCompatibility } from "@/data/repositories/inverter-ev.repo";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapInverterEvCompatibilityCopy } from "@/modules/inversores-cargadores-ev/mapper";

export async function getInverterEvPageData(inversor: string, cargador: string, tarifa: string) {
  const compatibility = await getInverterEvCompatibility(inversor, cargador, tarifa);
  if (!compatibility) return null;

  const copy = mapInverterEvCompatibilityCopy(compatibility);

  return {
    ...copy,
    links: [
      { href: `/baterias-solares/${tarifa}/4000-5500`, label: "Mejores baterías solares" },
      { href: "/placas-solares/madrid", label: "Empresas de placas solares" }
    ],
    schema: buildServiceSchema(copy.title, "Espana", copy.intro),
    compatibility
  };
}
