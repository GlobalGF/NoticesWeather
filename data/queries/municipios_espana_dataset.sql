-- =========================================================
-- Dataset de municipios de Espana (seed estructurado)
-- Formato SQL listo para importar en Supabase
-- =========================================================

create table if not exists municipios_dataset_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  comunidad_autonoma text not null,
  poblacion integer not null,
  latitud numeric(9,6) not null,
  longitud numeric(9,6) not null,
  codigo_postal varchar(5) not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_municipios_dataset_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_municipios_dataset_updated_at on municipios_dataset_es;
create trigger trg_municipios_dataset_updated_at
before update on municipios_dataset_es
for each row execute function set_municipios_dataset_updated_at();

insert into municipios_dataset_es (
  municipio, provincia, comunidad_autonoma, poblacion, latitud, longitud, codigo_postal, slug
)
values
  ('Madrid', 'Madrid', 'Comunidad de Madrid', 3327691, 40.416775, -3.703790, '28001', 'madrid'),
  ('Mostoles', 'Madrid', 'Comunidad de Madrid', 209184, 40.322340, -3.864960, '28931', 'mostoles'),
  ('Alcala de Henares', 'Madrid', 'Comunidad de Madrid', 197562, 40.481980, -3.364900, '28801', 'alcala-de-henares'),
  ('Fuenlabrada', 'Madrid', 'Comunidad de Madrid', 190790, 40.283870, -3.794150, '28941', 'fuenlabrada'),
  ('Leganes', 'Madrid', 'Comunidad de Madrid', 188425, 40.327180, -3.763500, '28911', 'leganes'),
  ('Getafe', 'Madrid', 'Comunidad de Madrid', 185180, 40.308250, -3.732680, '28901', 'getafe'),
  ('Alcorcon', 'Madrid', 'Comunidad de Madrid', 171772, 40.346850, -3.824870, '28921', 'alcorcon'),

  ('Barcelona', 'Barcelona', 'Cataluna', 1664182, 41.387400, 2.168600, '08001', 'barcelona'),
  ('L Hospitalet de Llobregat', 'Barcelona', 'Cataluna', 265444, 41.359670, 2.099300, '08901', 'hospitalet-de-llobregat'),
  ('Badalona', 'Barcelona', 'Cataluna', 224804, 41.450040, 2.247410, '08911', 'badalona'),
  ('Sabadell', 'Barcelona', 'Cataluna', 216520, 41.548620, 2.107420, '08201', 'sabadell'),
  ('Terrassa', 'Barcelona', 'Cataluna', 224114, 41.563210, 2.008870, '08221', 'terrassa'),
  ('Mataro', 'Barcelona', 'Cataluna', 129870, 41.540260, 2.444510, '08301', 'mataro'),
  ('Girona', 'Girona', 'Cataluna', 103369, 41.979400, 2.821430, '17001', 'girona'),
  ('Lleida', 'Lleida', 'Cataluna', 140080, 41.617590, 0.620010, '25001', 'lleida'),
  ('Tarragona', 'Tarragona', 'Cataluna', 135436, 41.118880, 1.244490, '43001', 'tarragona'),
  ('Reus', 'Tarragona', 'Cataluna', 106084, 41.149820, 1.105170, '43201', 'reus'),

  ('Valencia', 'Valencia', 'Comunitat Valenciana', 791413, 39.469750, -0.377390, '46001', 'valencia'),
  ('Alicante', 'Alicante', 'Comunitat Valenciana', 349282, 38.345170, -0.481490, '03001', 'alicante'),
  ('Castellon de la Plana', 'Castellon', 'Comunitat Valenciana', 174264, 39.986400, -0.051320, '12001', 'castellon-de-la-plana'),
  ('Elche', 'Alicante', 'Comunitat Valenciana', 235580, 38.269930, -0.712560, '03201', 'elche'),
  ('Torrevieja', 'Alicante', 'Comunitat Valenciana', 89195, 37.978720, -0.682220, '03181', 'torrevieja'),

  ('Sevilla', 'Sevilla', 'Andalucia', 686741, 37.389090, -5.984460, '41001', 'sevilla'),
  ('Malaga', 'Malaga', 'Andalucia', 579076, 36.721270, -4.421400, '29001', 'malaga'),
  ('Cordoba', 'Cordoba', 'Andalucia', 325916, 37.888180, -4.779380, '14001', 'cordoba'),
  ('Granada', 'Granada', 'Andalucia', 232770, 37.177340, -3.598560, '18001', 'granada'),
  ('Cadiz', 'Cadiz', 'Andalucia', 114244, 36.527060, -6.288600, '11001', 'cadiz'),
  ('Huelva', 'Huelva', 'Andalucia', 143663, 37.261420, -6.944720, '21001', 'huelva'),
  ('Jaen', 'Jaen', 'Andalucia', 112757, 37.779600, -3.784900, '23001', 'jaen'),
  ('Almeria', 'Almeria', 'Andalucia', 200753, 36.834050, -2.463710, '04001', 'almeria'),
  ('Jerez de la Frontera', 'Cadiz', 'Andalucia', 213267, 36.686450, -6.136060, '11401', 'jerez-de-la-frontera'),
  ('Marbella', 'Malaga', 'Andalucia', 159000, 36.510120, -4.882560, '29601', 'marbella'),

  ('Zaragoza', 'Zaragoza', 'Aragon', 675302, 41.648820, -0.889090, '50001', 'zaragoza'),
  ('Huesca', 'Huesca', 'Aragon', 53956, 42.136150, -0.408700, '22001', 'huesca'),
  ('Teruel', 'Teruel', 'Aragon', 36026, 40.344110, -1.106910, '44001', 'teruel'),

  ('Oviedo', 'Asturias', 'Principado de Asturias', 219910, 43.361390, -5.849390, '33001', 'oviedo'),
  ('Gijon', 'Asturias', 'Principado de Asturias', 269182, 43.532200, -5.661120, '33201', 'gijon'),
  ('Aviles', 'Asturias', 'Principado de Asturias', 75793, 43.555730, -5.924830, '33401', 'aviles'),

  ('Santander', 'Cantabria', 'Cantabria', 172240, 43.462300, -3.809980, '39001', 'santander'),
  ('Torrelavega', 'Cantabria', 'Cantabria', 51063, 43.351300, -4.047200, '39300', 'torrelavega'),

  ('Toledo', 'Toledo', 'Castilla-La Mancha', 85649, 39.862830, -4.027320, '45001', 'toledo'),
  ('Albacete', 'Albacete', 'Castilla-La Mancha', 174336, 38.994240, -1.858540, '02001', 'albacete'),
  ('Ciudad Real', 'Ciudad Real', 'Castilla-La Mancha', 74995, 38.984830, -3.927370, '13001', 'ciudad-real'),
  ('Cuenca', 'Cuenca', 'Castilla-La Mancha', 54731, 40.070390, -2.137420, '16001', 'cuenca'),
  ('Guadalajara', 'Guadalajara', 'Castilla-La Mancha', 87484, 40.633330, -3.166670, '19001', 'guadalajara'),
  ('Talavera de la Reina', 'Toledo', 'Castilla-La Mancha', 84426, 39.963480, -4.830760, '45600', 'talavera-de-la-reina'),

  ('Valladolid', 'Valladolid', 'Castilla y Leon', 295639, 41.652130, -4.728560, '47001', 'valladolid'),
  ('Burgos', 'Burgos', 'Castilla y Leon', 175821, 42.343990, -3.696910, '09001', 'burgos'),
  ('Leon', 'Leon', 'Castilla y Leon', 124028, 42.598730, -5.567100, '24001', 'leon'),
  ('Salamanca', 'Salamanca', 'Castilla y Leon', 143954, 40.970100, -5.663540, '37001', 'salamanca'),
  ('Segovia', 'Segovia', 'Castilla y Leon', 51683, 40.942900, -4.108800, '40001', 'segovia'),
  ('Soria', 'Soria', 'Castilla y Leon', 39821, 41.763280, -2.464850, '42001', 'soria'),
  ('Zamora', 'Zamora', 'Castilla y Leon', 59700, 41.503320, -5.744560, '49001', 'zamora'),
  ('Palencia', 'Palencia', 'Castilla y Leon', 77556, 42.009550, -4.528780, '34001', 'palencia'),
  ('Avila', 'Avila', 'Castilla y Leon', 58697, 40.656060, -4.681390, '05001', 'avila'),
  ('Ponferrada', 'Leon', 'Castilla y Leon', 62398, 42.546640, -6.596190, '24400', 'ponferrada'),

  ('A Coruna', 'A Coruna', 'Galicia', 245711, 43.362300, -8.411540, '15001', 'a-coruna'),
  ('Lugo', 'Lugo', 'Galicia', 98519, 43.012080, -7.555850, '27001', 'lugo'),
  ('Ourense', 'Ourense', 'Galicia', 105233, 42.336690, -7.863910, '32001', 'ourense'),
  ('Pontevedra', 'Pontevedra', 'Galicia', 83260, 42.431000, -8.644350, '36001', 'pontevedra'),
  ('Vigo', 'Pontevedra', 'Galicia', 293837, 42.240600, -8.720730, '36201', 'vigo'),
  ('Santiago de Compostela', 'A Coruna', 'Galicia', 98347, 42.878210, -8.544840, '15701', 'santiago-de-compostela'),
  ('Ferrol', 'A Coruna', 'Galicia', 64616, 43.489610, -8.219400, '15401', 'ferrol'),

  ('Murcia', 'Murcia', 'Region de Murcia', 462979, 37.983440, -1.129890, '30001', 'murcia'),
  ('Cartagena', 'Murcia', 'Region de Murcia', 216365, 37.625680, -0.996580, '30201', 'cartagena'),
  ('Lorca', 'Murcia', 'Region de Murcia', 96415, 37.671190, -1.700350, '30800', 'lorca'),
  ('Molina de Segura', 'Murcia', 'Region de Murcia', 74762, 38.054560, -1.207630, '30500', 'molina-de-segura'),

  ('Pamplona', 'Navarra', 'Comunidad Foral de Navarra', 203418, 42.812530, -1.645770, '31001', 'pamplona'),
  ('Tudela', 'Navarra', 'Comunidad Foral de Navarra', 37995, 42.061660, -1.603520, '31500', 'tudela'),

  ('Bilbao', 'Bizkaia', 'Pais Vasco', 345821, 43.262710, -2.925280, '48001', 'bilbao'),
  ('Vitoria-Gasteiz', 'Araba', 'Pais Vasco', 255886, 42.846720, -2.671630, '01001', 'vitoria-gasteiz'),
  ('Donostia-San Sebastian', 'Gipuzkoa', 'Pais Vasco', 188743, 43.318330, -1.981230, '20001', 'donostia-san-sebastian'),
  ('Barakaldo', 'Bizkaia', 'Pais Vasco', 100369, 43.296390, -2.987700, '48901', 'barakaldo'),

  ('Logrono', 'La Rioja', 'La Rioja', 151136, 42.462720, -2.444980, '26001', 'logrono'),
  ('Calahorra', 'La Rioja', 'La Rioja', 24472, 42.305060, -1.965210, '26500', 'calahorra'),

  ('Las Palmas de Gran Canaria', 'Las Palmas', 'Canarias', 378675, 28.123550, -15.436260, '35001', 'las-palmas-de-gran-canaria'),
  ('Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 'Canarias', 209194, 28.463630, -16.251850, '38001', 'santa-cruz-de-tenerife'),
  ('San Cristobal de La Laguna', 'Santa Cruz de Tenerife', 'Canarias', 159034, 28.487400, -16.315910, '38201', 'san-cristobal-de-la-laguna'),
  ('Telde', 'Las Palmas', 'Canarias', 102164, 27.994810, -15.419150, '35200', 'telde'),

  ('Palma', 'Illes Balears', 'Illes Balears', 422587, 39.569600, 2.650160, '07001', 'palma'),
  ('Ibiza', 'Illes Balears', 'Illes Balears', 51582, 38.908830, 1.432960, '07800', 'ibiza'),
  ('Mahon', 'Illes Balears', 'Illes Balears', 29655, 39.889010, 4.265830, '07701', 'mahon'),

  ('Badajoz', 'Badajoz', 'Extremadura', 150984, 38.879450, -6.970610, '06001', 'badajoz'),
  ('Caceres', 'Caceres', 'Extremadura', 96126, 39.476490, -6.372240, '10001', 'caceres'),
  ('Merida', 'Badajoz', 'Extremadura', 59894, 38.916110, -6.343660, '06800', 'merida'),
  ('Plasencia', 'Caceres', 'Extremadura', 39597, 40.031160, -6.088450, '10600', 'plasencia'),

  ('Ceuta', 'Ceuta', 'Ceuta', 83117, 35.889390, -5.321350, '51001', 'ceuta'),
  ('Melilla', 'Melilla', 'Melilla', 86261, 35.292340, -2.938130, '52001', 'melilla')
on conflict (slug) do update set
  municipio = excluded.municipio,
  provincia = excluded.provincia,
  comunidad_autonoma = excluded.comunidad_autonoma,
  poblacion = excluded.poblacion,
  latitud = excluded.latitud,
  longitud = excluded.longitud,
  codigo_postal = excluded.codigo_postal,
  updated_at = now();

create index if not exists idx_municipios_dataset_slug on municipios_dataset_es(slug);
create index if not exists idx_municipios_dataset_geo on municipios_dataset_es(comunidad_autonoma, provincia, municipio);
create index if not exists idx_municipios_dataset_poblacion on municipios_dataset_es(poblacion desc);
