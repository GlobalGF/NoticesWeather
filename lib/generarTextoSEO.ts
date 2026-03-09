import { slugToVariant } from "@/lib/utils/validate-slug";
import type { MunicipioPageData } from "@/lib/data/types";

type TextoSEOInput = Pick<
  MunicipioPageData,
  | "municipio"
  | "provincia"
  | "comunidadAutonoma"
  | "ahorroEstimado"
  | "irradiacionSolar"
  | "horasSol"
  | "bonificacionIbi"
  | "subvencionAutoconsumo"
  | "precioMedioLuz"
  | "slug"
>;

/**
 * Generates a unique, deterministic SEO paragraph for a municipality.
 *
 * ✅ Deterministic: the same slug always produces the same variant (no Math.random())
 * ✅ Uses real data from Supabase fields
 * ✅ 8 unique variants to maximize content uniqueness across thousands of pages
 * ✅ Safe for SSR/SSG: no hydration mismatches
 */
export function generarTextoSEO(data: TextoSEOInput): string {
  const {
    municipio,
    provincia,
    ahorroEstimado,
    irradiacionSolar,
    horasSol,
    bonificacionIbi,
    subvencionAutoconsumo,
    precioMedioLuz,
    slug,
  } = data;

  const ahorro = Math.round(ahorroEstimado);
  const radiacion = Math.round(irradiacionSolar);
  const horas = Math.round(horasSol);
  const precio = precioMedioLuz.toFixed(2);
  const ibi = bonificacionIbi != null ? Math.round(bonificacionIbi) : null;
  const subv = subvencionAutoconsumo != null ? Math.round(subvencionAutoconsumo) : null;

  const VARIANTES: string[] = [
    // 0
    `Instalar placas solares en ${municipio} (${provincia}) puede generar un ahorro de hasta un ${ahorro}% en la factura eléctrica anual. Con una irradiación solar de ${radiacion} kWh/m² al año y más de ${horas} horas de sol, ${municipio} es uno de los municipios con mayor potencial de autoconsumo de España.`,

    // 1
    `En ${municipio}, la energía solar fotovoltaica es especialmente rentable: la zona recibe ${radiacion} kWh/m² anuales, lo que permite amortizar una instalación doméstica en pocos años. El precio medio del kWh en España es de ${precio} €, por lo que cada kWh producido en casa supone un ahorro directo.`,

    // 2
    `¿Te preguntas si merece la pena instalar paneles solares en ${municipio}? Con ${horas} horas de sol al año y un ahorro estimado del ${ahorro}%, la respuesta es sí.${ibi != null ? ` Además, el ayuntamiento ofrece una bonificación del IBI del ${ibi}% para instalaciones fotovoltaicas.` : ""}`,

    // 3
    `La irradiación solar en ${municipio} alcanza los ${radiacion} kWh/m² anuales, por encima de la media europea. Esto convierte a ${municipio} en un lugar óptimo para el autoconsumo fotovoltaico: una instalación de 3 kWp genera una media de ${Math.round(radiacion * 3 * 0.85)} kWh al año.`,

    // 4
    `${subv != null ? `Las subvenciones de la comunidad autónoma cubren hasta un ${subv}% del coste de instalación en ${municipio}.` : `En ${municipio} existen ayudas autonómicas y estatales para la instalación de placas solares.`} Combinadas con un ahorro energético del ${ahorro}% anual, las placas solares son la inversión más rentable para los hogares de ${provincia}.`,

    // 5
    `Cada año, los hogares de ${municipio} pagan de media ${precio} €/kWh a la comercializadora. Con una instalación fotovoltaica bien dimensionada, puedes producir entre el 60% y el 80% de tu consumo desde tu propio tejado, eliminando prácticamente la dependencia de la red eléctrica en los meses de mayor irradiación.`,

    // 6
    `${ibi != null ? `La ordenanza municipal de ${municipio} permite obtener una bonificación del IBI del ${ibi}% durante los primeros años tras la instalación solar.` : `Instalar placas solares en ${municipio} es más sencillo de lo que parece.`} Junto con las subvenciones del Plan de Recuperación y las deducciones fiscales autonómicas, la inversión inicial se reduce significativamente.`,

    // 7
    `Con ${radiacion} kWh/m² de irradiación anual y un precio de la electricidad de ${precio} €/kWh, los vecinos de ${municipio} tienen todas las condiciones necesarias para rentabilizar una instalación solar en menos de ${Math.round(6200 / (radiacion * 3 * 0.85 * parseFloat(precio)))} años.`,
  ];

  // Deterministic variant: same slug → same text always (SSR safe)
  const variant = slugToVariant(slug, VARIANTES.length);
  return VARIANTES[variant];
}
