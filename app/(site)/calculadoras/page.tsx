import { Metadata } from "next";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { CalculadorasClient } from "./CalculadorasClient";

export const metadata: Metadata = {
  title: "Calculadoras Solares — Simulador de Paneles, Baterías y Ahorro",
  description: "Herramientas profesionales para dimensionar tu instalación fotovoltaica: calcula paneles necesarios, capacidad de baterías, compensación de excedentes y financiación solar.",
};

type Props = {
  searchParams: { m?: string };
};

export default async function CalculadorasPage({ searchParams }: Props) {
  const { m: slug } = searchParams;

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
