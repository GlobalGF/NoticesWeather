const urls = {
  "alava": "https://www.guide-du-paysbasque.com/_bibli/pages_images/383/santa-cruz-de-compezo.jpg",
  "albacete": "https://www.hola.com/horizon/square/6f090a253196-imprescindibles-albacete-t.jpg",
  "alicante": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7j8vhURDdsf_kYpzN-t-TGaH33hHmN4KdWw&s",
  "almeria": "https://www.civitatis.com/blog/wp-content/uploads/2025/06/portada-almeria-1-scaled.jpg",
  "asturias": "https://cdn.sanity.io/images/nxpteyfv/goguides/d87c60e3e5b80215f2b54395adb1da5b00ecffa8-1600x1067.jpg",
  "avila": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/86/7e/c9/deel-van-het-stadsgezicht.jpg?w=1400&h=1400&s=1",
  "badajoz": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4U-U875yc8OFgVWBbeDCX7rZJIbVh1mcrA&s",
  "burgos": "https://losapuntesdelviajero.com/wp-content/uploads/2023/04/Catedral-de-Burgos-desde-el-mirador-del-castillo-1-1024x683.jpg",
  "caceres": "https://media.istockphoto.com/id/1663878820/es/foto/plaza-mayor-de-c%C3%A1ceres-al-atardecer-vista-cenital.jpg?s=612x612&w=0&k=20&c=84jSDpVSkJqBefuptJ75dcT7PMIJ-HGTBeO4dezaJX4=",
  "cadiz": "https://media.gettyimages.com/id/1316310859/es/foto/cadiz-landscape-with-typical-boats-spain.jpg?s=612x612&w=0&k=20&c=tjOflnq3AGxeT7nioQ9Oc34EjN9XCkP6timxLEJuLnk=",
  "cantabria": "https://www.fidalsaholidays.com/wp-content/uploads/2023/05/Que-ver-en-Cantabria-1.jpg",
  "castellon": "https://www.ccsalera.com/wp-content/uploads/2022/11/monumentos-castellon-scaled.jpg",
  "ciudad-real": "https://abrasador.com/wp-content/uploads/2023/05/Captura-de-Pantalla-2023-05-15-a-las-11.34.41.png",
  "cordoba": "https://www.gestilar.com/uploads/iStock-1088432392_2.jpg",
  "cuenca": "https://cdn.surfingtheplanet.com/wp-content/uploads/2024/04/vistas-desde-mirador-cuenca.jpg?strip=all",
  "girona": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Girona_des_de_l_aire_edited.jpg/1280px-Girona_des_de_l_aire_edited.jpg",
  "granada": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f7/94/granada.jpg?w=1200&h=700&s=1",
  "guadalajara": "https://visitagdl.com/wp-content/uploads/2025/06/Portada-Centro.jpg",
  "gipuzkoa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOJn-zLQlKEkBQPHY5Vw6xCECnNxt-6RPXfA&s",
  "huelva": "https://es.kampaoh.com/wp-content/uploads/2025/04/Diseno-sin-titulo-2025-04-14T132250.299.png",
  "huesca": "https://www.hola.com/horizon/square/35da80ded814-pueblos-huesca-t.jpg",
  "islas-baleares": "https://imagenes.20minutos.es/files/image_1920_1080/uploads/imagenes/2022/04/06/illes-balears-apuesta-por-la-calidad-en-su-nueva-ley-turistica.jpeg",
  "jaen": "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/andalucia/catedral-jaen-61352996-istock.jpg_1014274486.jpg",
  "a-coruna": "https://images.winalist.com/blog/wp-content/uploads/2025/06/04100410/adobestock-784648627-1500x844.jpeg",
  "la-rioja": "https://imagenes.heraldo.es/files/image_1920_1080/uploads/imagenes/2025/04/24/najera-gsc1.jpeg",
  "las-palmas": "https://experitour.com/wp-content/uploads/2018/07/Las-Palmas-CASAS-DE-COLORES.jpg",
  "leon": "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/12/leon.jpg",
  "lleida": "https://maspais.es/wp-content/uploads/2026/01/merece-pena-visitar-lleida.jpg",
  "lugo": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Muralla_Catedral_Lugo.jpg",
  "malaga": "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/andalucia/malaga-52886652-istock.jpg",
  "murcia": "https://www.escapadarural.com/_ipx/w_1536&f_webp&q_80/https://www.escapadarural.com/blog/wp-content/uploads/2025/02/02_PueblosPajaro_Aguilas_tamas_AdobeStock_920189173_WP02-768x575.webp",
  "melilla": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/44/b9/a0/vista-aerea-de-la-ciudad.jpg?w=900&h=500&s=1",
  "navarra": "https://i0.wp.com/www.comprarbanderas.es/blog/wp-content/uploads/2013/12/navarra-ochagavia-001.jpg?resize=800%2C445&ssl=1",
  "ourense": "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/09/que-ver-en-ourense.jpg",
  "palencia": "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/castilla-leon/palencia-40689156-istock.jpg",
  "pontevedra": "https://www.barcelo.com/guia-turismo/wp-content/uploads/2023/07/que-visitar-en-pontevdra.jpg",
  "salamanca": "https://res.klook.com/image/upload/w_750,h_469,c_fill,q_85/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/qv4qxcpmznqiipwj4h9r.jpg",
  "santa-cruz-de-tenerife": "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/canarias/santa-cruz-de-tenerife-s362881445.jpg",
  "segovia": "https://www.turismocastillayleon.com/cm/images?locale=es_ES&idMmedia=266443",
  "sevilla": "https://losdosviajeros.com/img/sevilla/plaza-espana-noche.jpg",
  "soria": "https://i0.wp.com/www.soriaestademoda.org/wp-content/uploads/2020/04/Soria-Capital.jpg?fit=2400%2C1440&ssl=1",
  "tarragona": "https://www.naturaki.com/fotografies/s/44347ciutat-de-tarragona-amfiteatre-roma-ok-online.jpg",
  "teruel": "https://hips.hearstapps.com/hmg-prod/images/turismo-que-ver-teruel-1643035892.jpg?crop=0.984375xw:1xh;center,top&resize=1200:*",
  "toledo": "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/castilla-mancha/vistas-toledo-s535820527.jpg",
  "valencia": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwOU3PXwPZUyI4Twn0qleI5Ehrf82ybkUcsA&s",
  "valladolid": "https://www.turismocastillayleon.com/es/patrimonio-cultura/valladolid.ficheros/266440-hq_Valladolid27.jpg?width=1900&height=700&crop=true&cropMode=CENTER",
  "bizkaia": "https://elviajerofeliz.com/wp-content/uploads/2019/08/Qu%C3%A9-ver-en-Vizcaya.jpg",
  "zamora": "https://cloud.inspain.org/imgwbp/localidades/8/8/6/i76vjbugkgxdu6bx7zgqqvec4m_2000.webp",
  "zaragoza": "https://blog.blablacar.es/wp-content/uploads/2025/01/basilica-zaragoza.webp"
};

async function checkUrl(name, url) {
  try {
    const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`${name}: ${response.status} ${response.statusText}`);
  } catch (err) {
    console.log(`${name}: ERROR ${err.message}`);
  }
}

async function run() {
  for (const [name, url] of Object.entries(urls)) {
    await checkUrl(name, url);
  }
}

run();
