import { buildMetadata } from "@/lib/seo/metadata-builder";

export function inverterEvMetadata(inversor: string, cargador: string, tarifa: string) {
  return buildMetadata({
    title: `Compatibilidad inversor ${inversor} con cargador ${cargador}`,
    description: `Analisis de compatibilidad inversor + cargador EV para tarifa ${tarifa}, con eficiencia y observaciones tecnicas.`,
    pathname: `/inversores-cargadores-ev/${inversor}/${cargador}/${tarifa}`
  });
}
