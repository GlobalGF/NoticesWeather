/**
 * weather-seo.ts — Dynamic FAQ item tied to weather/solar irradiance.
 *
 * Adds unique long-tail keyword content per municipality page,
 * reducing duplicate content risk across 10k+ pSEO pages.
 */

type WeatherFaq = {
  q: string;
  a: string;
};

export function generateWeatherFaqItem(municipio: string): WeatherFaq {
  const year = new Date().getFullYear();
  return {
    q: `¿Cómo afecta el clima actual a la producción solar en ${municipio}?`,
    a: `La producción fotovoltaica en ${municipio} varía según la irradiancia solar del momento, medida en W/m² (GTI — Global Tilted Irradiance). En días soleados con un GTI superior a 300 W/m², una instalación de 5 kW puede producir a plena capacidad. En días nublados (GTI < 100 W/m²) la producción se reduce, aunque los paneles modernos siguen generando entre un 10 y un 25% de su capacidad nominal. Los datos en tiempo real del widget meteorológico de esta página te ayudan a visualizar la producción estimada en ${municipio} en este momento (${year}).`,
  };
}
