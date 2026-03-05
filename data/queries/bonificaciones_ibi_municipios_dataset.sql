-- =========================================================
-- Dataset de bonificaciones IBI por instalacion solar (municipios)
-- Formato SQL listo para importar en Supabase
-- Nota: valores orientativos para analitica/SEO (validar con ordenanzas)
-- =========================================================

create table if not exists bonificaciones_ibi_municipios_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  porcentaje_bonificacion numeric(5,2) not null check (porcentaje_bonificacion between 0 and 100),
  duracion_anos smallint not null check (duracion_anos >= 0 and duracion_anos <= 50),
  condiciones text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio, provincia)
);

create or replace function set_ibi_municipios_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ibi_municipios_updated_at on bonificaciones_ibi_municipios_es;
create trigger trg_ibi_municipios_updated_at
before update on bonificaciones_ibi_municipios_es
for each row execute function set_ibi_municipios_updated_at();

insert into bonificaciones_ibi_municipios_es (
  municipio,
  provincia,
  porcentaje_bonificacion,
  duracion_anos,
  condiciones
)
values
  ('Madrid', 'Madrid', 50.00, 3, 'Aplicable a instalaciones de autoconsumo legalizadas. Puede requerir limite de potencia y solicitud en plazo anual.'),
  ('Barcelona', 'Barcelona', 50.00, 3, 'Bonificacion para inmuebles con instalacion fotovoltaica certificada y comunicacion de obra/instalacion.'),
  ('Valencia', 'Valencia', 50.00, 5, 'Exige licencia o declaracion responsable y justificante de puesta en servicio de la instalacion.'),
  ('Sevilla', 'Sevilla', 50.00, 3, 'Aplicacion sobre cuota integra con condicion de mantenimiento de la instalacion durante el periodo bonificado.'),
  ('Malaga', 'Malaga', 30.00, 3, 'Requiere acreditacion tecnica y solicitud expresa dentro de convocatoria municipal.'),
  ('Zaragoza', 'Zaragoza', 30.00, 5, 'Se exige compatibilidad urbanistica y documentacion tecnica de autoconsumo.'),
  ('Murcia', 'Murcia', 50.00, 3, 'Bonificacion condicionada a legalizacion electrica y, en su caso, licencia de obra.'),
  ('Palma', 'Illes Balears', 50.00, 3, 'Aplicable a viviendas con instalacion solar homologada y alta en autoconsumo.'),
  ('Las Palmas de Gran Canaria', 'Las Palmas', 50.00, 5, 'Requiere memoria tecnica, boletin y solicitud telematica en periodo habilitado.'),
  ('Bilbao', 'Bizkaia', 50.00, 3, 'Bonificacion para instalaciones en cubierta con cumplimiento de ordenanza fiscal vigente.'),
  ('Valladolid', 'Valladolid', 50.00, 5, 'Exige acreditar inversion minima en instalacion y mantenimiento de uso residencial.'),
  ('Vigo', 'Pontevedra', 50.00, 3, 'Requiere certificado de instalacion y justificante de registro/autoconsumo.'),
  ('A Coruna', 'A Coruna', 50.00, 3, 'Condicionada a instalacion legalizada y no estar incurso en deudas tributarias municipales.'),
  ('Gijon', 'Asturias', 50.00, 3, 'Bonificacion en IBI urbano con documentacion tecnica completa y solicitud en plazo.'),
  ('Oviedo', 'Asturias', 50.00, 3, 'Aplicable a inmuebles con energia solar para autoconsumo y cumplimiento normativo.'),
  ('Pamplona', 'Navarra', 50.00, 3, 'Requiere puesta en marcha de instalacion y adecuacion a ordenanza local.'),
  ('Logrono', 'La Rioja', 50.00, 3, 'Condiciones vinculadas a potencia instalada y justificacion del autoconsumo.'),
  ('Badajoz', 'Badajoz', 50.00, 5, 'Exige licencia municipal cuando proceda y alta de instalacion en registro competente.'),
  ('Caceres', 'Caceres', 50.00, 5, 'Bonificacion para vivienda habitual con instalacion solar de autoconsumo legalizada.'),
  ('Salamanca', 'Salamanca', 50.00, 3, 'Aplicable previa solicitud y comprobacion de requisitos tecnicos/tributarios.'),
  ('Burgos', 'Burgos', 50.00, 5, 'Requiere acreditacion de la instalacion y mantenimiento de condiciones durante la bonificacion.'),
  ('Leon', 'Leon', 50.00, 3, 'Bonificacion en cuota del IBI para inmuebles con sistemas de aprovechamiento solar.'),
  ('Cordoba', 'Cordoba', 50.00, 3, 'Puede exigir limite maximo de bonificacion anual y solicitud antes de devengo.'),
  ('Granada', 'Granada', 50.00, 3, 'Condiciones de ordenanza fiscal municipal y documentacion de legalizacion electrica.'),
  ('Alicante', 'Alicante', 50.00, 3, 'Aplicable con instalacion certificada y sin incidencias tributarias del titular.'),
  ('Elche', 'Alicante', 50.00, 3, 'Bonificacion vinculada a autoconsumo en inmueble urbano y solicitud formal.'),
  ('Tarragona', 'Tarragona', 50.00, 3, 'Requiere cumplimiento de normativa urbanistica y tecnica de la instalacion.'),
  ('Santander', 'Cantabria', 50.00, 3, 'Aplicable en inmuebles con instalacion solar y acreditacion de puesta en servicio.'),
  ('Toledo', 'Toledo', 50.00, 5, 'Bonificacion sobre cuota integra con permanencia minima de la instalacion.'),
  ('Albacete', 'Albacete', 50.00, 5, 'Requiere memoria tecnica, boletin y solicitud dentro del periodo establecido.'),
  ('Ciudad Real', 'Ciudad Real', 50.00, 5, 'Aplicable tras validacion municipal de requisitos fiscales y tecnicos.'),
  ('Guadalajara', 'Guadalajara', 50.00, 5, 'Exige acreditacion de instalacion de autoconsumo con energia solar en inmueble.'),
  ('Huelva', 'Huelva', 50.00, 3, 'Condiciones de ordenanza: instalacion homologada y solicitud en forma/plazo.'),
  ('Jaen', 'Jaen', 50.00, 3, 'Bonificacion para instalaciones legalizadas de autoconsumo en bienes urbanos.'),
  ('Almeria', 'Almeria', 50.00, 3, 'Aplicable con presentacion de certificado final de instalacion y registro.'),
  ('Cadiz', 'Cadiz', 50.00, 3, 'Requiere cumplimiento de normativa tecnica y ausencia de deuda tributaria local.'),
  ('Jerez de la Frontera', 'Cadiz', 50.00, 3, 'Bonificacion por aprovechamiento de energia solar en vivienda/local elegible.'),
  ('Marbella', 'Malaga', 50.00, 3, 'Aplicable bajo condiciones de potencia, legalizacion y solicitud anual.'),
  ('Donostia-San Sebastian', 'Gipuzkoa', 50.00, 3, 'Requiere instalacion de autoconsumo en inmueble urbano conforme a ordenanza.'),
  ('Vitoria-Gasteiz', 'Alava', 50.00, 3, 'Bonificacion sujeta a acreditacion documental y requisitos fiscales municipales.'),
  ('Lleida', 'Lleida', 50.00, 3, 'Aplicable con licencia/declaracion responsable y certificacion de instalacion.'),
  ('Girona', 'Girona', 50.00, 3, 'Condicionada a instalacion homologada y solicitud en plazo de ordenanza.'),
  ('Castellon de la Plana', 'Castellon', 50.00, 5, 'Bonificacion para inmuebles urbanos con sistemas de energia solar instalados.'),
  ('Ceuta', 'Ceuta', 50.00, 3, 'Aplicable con instalacion legalizada de autoconsumo y documentacion completa.'),
  ('Melilla', 'Melilla', 50.00, 3, 'Bonificacion municipal para inmuebles con energia solar y cumplimiento de ordenanza.')
on conflict (municipio, provincia) do update set
  porcentaje_bonificacion = excluded.porcentaje_bonificacion,
  duracion_anos = excluded.duracion_anos,
  condiciones = excluded.condiciones,
  updated_at = now();

create index if not exists idx_ibi_muni_provincia on bonificaciones_ibi_municipios_es (provincia, municipio);
create index if not exists idx_ibi_porcentaje on bonificaciones_ibi_municipios_es (porcentaje_bonificacion desc);
create index if not exists idx_ibi_duracion on bonificaciones_ibi_municipios_es (duracion_anos desc);
