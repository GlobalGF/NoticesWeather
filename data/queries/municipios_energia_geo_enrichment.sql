-- =========================================================
-- Enriquecimiento geografico de municipios_energia
-- Añade columnas de tipologia geografica y altitud para
-- permitir contenido SEO diferenciado (evitar thin content).
-- =========================================================

-- Paso 1: Nuevas columnas de enriquecimiento
alter table if exists public.municipios_energia
  add column if not exists tipo_zona text
    check (tipo_zona in ('costa','interior','sierra','isla','norte','urbano'));

alter table if exists public.municipios_energia
  add column if not exists descripcion_geo text;   -- texto preparado para el prompt IA

alter table if exists public.municipios_energia
  add column if not exists altitud_m integer;

alter table if exists public.municipios_energia
  add column if not exists superficie_km2 numeric(10,2);

-- Paso 2: Poblar tipo_zona por heuristica comunidad/provincia/poblacion
update public.municipios_energia
set tipo_zona = case
  when comunidad_autonoma in ('Canarias', 'Illes Balears')
    then 'isla'
  when comunidad_autonoma in ('Comunitat Valenciana', 'Andalucia', 'Region de Murcia', 'Cataluna')
    then 'costa'
  when provincia in ('Granada', 'Jaen', 'Huesca', 'Lleida', 'Girona', 'Caceres', 'Teruel', 'Soria', 'Avila', 'Segovia')
    then 'sierra'
  when comunidad_autonoma in ('La Rioja', 'Comunidad Foral de Navarra', 'Pais Vasco', 'Cantabria',
                               'Principado de Asturias', 'Galicia')
    then 'norte'
  when habitantes > 100000
    then 'urbano'
  else 'interior'
end
where tipo_zona is null;

-- Paso 3: Poblar descripcion_geo (input directo al prompt IA)
update public.municipios_energia
set descripcion_geo = case tipo_zona
  when 'isla'
    then municipio || ' se ubica en territorio insular con clima subtropical, maxima irradiacion anual y ' ||
         'independencia energetica de la peninsula como ventaja estrategica adicional.'
  when 'costa'
    then municipio || ' es un municipio costero con clima mediterraneo, alta radiacion solar y posibilidad ' ||
         'de autoconsumo combinado con ventilacion natural.'
  when 'sierra'
    then municipio || ' se emplaza en zona de sierra o montana con amplitud termica notable; ' ||
         'la alta irradiacion de altitud compensa la temperatura mas baja y aumenta la eficiencia de los paneles.'
  when 'norte'
    then municipio || ' pertenece al norte peninsular humedo; aunque con menos horas de sol que el sur, ' ||
         'las instalaciones orientadas al sur maximizan la captacion y los precios de luz son mas elevados, ' ||
         'mejorando el retorno de inversion.'
  when 'urbano'
    then municipio || ' es un nucleo urbano de gran poblacion donde la densidad de viviendas y la ' ||
         'comunidad de propietarios facilitan el autoconsumo compartido y reducen el coste por kWp instalado.'
  else
    municipio || ' es un municipio del interior peninsular con clima continental; los veranos calurosos ' ||
    'generan alta produccion solar y los inviernos frios hacen que el autoconsumo con bateria sea especialmente rentable.'
end
where descripcion_geo is null or descripcion_geo = '';

-- Paso 4: Indices de apoyo para consultas por zona
create index if not exists idx_municipios_energia_tipo_zona
  on public.municipios_energia (tipo_zona);

create index if not exists idx_municipios_energia_ccaa_zona
  on public.municipios_energia (comunidad_autonoma, tipo_zona);
