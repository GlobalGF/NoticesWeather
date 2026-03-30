import { Metadata } from "next";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { CalculadorasClient } from "./CalculadorasClient";

export const metadata: Metadata = {
  title: "Simuladores Energéticos Profesionales",
  description: "Suite de calculadoras solares avanzadas para optimizar el autoconsumo, dimensionar baterías y estimar la rentabilidad fotovoltaica.",
};

type Props = {
  searchParams: Promise<{ m?: string }>;
};

export default async function CalculadorasPage({ searchParams }: Props) {
  const { m: slug } = await searchParams;

  let municipioNombre = "España";
  let horasSolAnuales = 2500;
  let costeMedio = 5000;
  let ahorroAnual = 800;

  if (slug) {
    const data = await getMunicipioBySlug(slug);
    if (data) {
      municipioNombre = data.municipio;
      if (data.horas_sol) horasSolAnuales = data.horas_sol;
      if (data.precio_instalacion_medio_eur) costeMedio = data.precio_instalacion_medio_eur;
      if (data.ahorro_estimado) ahorroAnual = data.ahorro_estimado;
    }
  }

  return (
    <CalculadorasClient
      municipioNombre={municipioNombre}
      horasSolAnuales={horasSolAnuales}
      costeMedio={costeMedio}
      ahorroAnual={ahorroAnual}
    />
  );
}
