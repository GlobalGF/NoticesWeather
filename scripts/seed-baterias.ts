import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATERIAS_DATA = [
  {
    fabricante: "Huawei",
    modelo: "LUNA2000-5-S0",
    slug: "huawei-luna2000-5",
    tecnologia: "LFP",
    capacidad_kwh: 5.0,
    potencia_descarga_kw: 2.5,
    ciclos: 6000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 95.0,
    tension_v: 360,
    garantia_anos: 10,
    ficha_tecnica_url: "https://solar.huawei.com/download?p=%2F-%2Fmedia%2FSolarV4%2Fsolar-version2%2Fspain%2Fpdf%2Fluna2000-5-15-s0.pdf",
    activo: true
  },
  {
    fabricante: "Huawei",
    modelo: "LUNA2000-10-S0",
    slug: "huawei-luna2000-10",
    tecnologia: "LFP",
    capacidad_kwh: 10.0,
    potencia_descarga_kw: 5.0,
    ciclos: 6000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 95.0,
    tension_v: 360,
    garantia_anos: 10,
    ficha_tecnica_url: "https://solar.huawei.com/download?p=%2F-%2Fmedia%2FSolarV4%2Fsolar-version2%2Fspain%2Fpdf%2Fluna2000-5-15-s0.pdf",
    activo: true
  },
  {
    fabricante: "BYD",
    modelo: "Battery-Box Premium HVS 5.1",
    slug: "byd-hvs-5-1",
    tecnologia: "LFP",
    capacidad_kwh: 5.12,
    potencia_descarga_kw: 5.12,
    ciclos: 6000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 96.0,
    tension_v: 204,
    garantia_anos: 10,
    ficha_tecnica_url: "https://www.bydbatterybox.com/uploads/downloads/BYD%20Battery-Box%20Premium%20HVS%20&%20HVM%20Compatible%20Inverter%20List%20V2.26-6435c7075c3db.pdf",
    activo: true
  },
  {
    fabricante: "BYD",
    modelo: "Battery-Box Premium HVM 11.0",
    slug: "byd-hvm-11-0",
    tecnologia: "LFP",
    capacidad_kwh: 11.04,
    potencia_descarga_kw: 11.04,
    ciclos: 6000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 96.0,
    tension_v: 204,
    garantia_anos: 10,
    ficha_tecnica_url: "https://www.bydbatterybox.com/uploads/downloads/BYD%20Battery-Box%20Premium%20HVS%20&%20HVM%20Compatible%20Inverter%20List%20V2.26-6435c7075c3db.pdf",
    activo: true
  },
  {
    fabricante: "Enphase",
    modelo: "IQ Battery 5P",
    slug: "enphase-iq-5p",
    tecnologia: "LFP",
    capacidad_kwh: 5.0,
    potencia_descarga_kw: 3.84,
    ciclos: 6000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 90.0,
    tension_v: 230,
    garantia_anos: 15,
    ficha_tecnica_url: "https://enphase.com/es-es/homeowners/home-solar-batteries",
    activo: true
  },
  {
    fabricante: "Sigenergy",
    modelo: "SigenStor BAT 5",
    slug: "sigenergy-bat-5",
    tecnologia: "LFP",
    capacidad_kwh: 5.0,
    potencia_descarga_kw: 2.5,
    ciclos: 8000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 95.0,
    tension_v: 400,
    garantia_anos: 10,
    ficha_tecnica_url: "https://int.sigenergy.com/es",
    activo: true
  },
  {
    fabricante: "SolarEdge",
    modelo: "Energy Bank 10kWh",
    slug: "solaredge-energy-bank",
    tecnologia: "NMC",
    capacidad_kwh: 9.7,
    potencia_descarga_kw: 5.0,
    ciclos: 4000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 94.5,
    tension_v: 400,
    garantia_anos: 10,
    ficha_tecnica_url: "https://www.solaredge.com/es/products/solaredge-energy-bank",
    activo: true
  },
  {
    fabricante: "Tesla",
    modelo: "Powerwall 2",
    slug: "tesla-powerwall-2",
    tecnologia: "NMC",
    capacidad_kwh: 13.5,
    potencia_descarga_kw: 5.0,
    ciclos: 5000,
    profundidad_descarga_pct: 100,
    eficiencia_roundtrip_pct: 90.0,
    tension_v: 230,
    garantia_anos: 10,
    ficha_tecnica_url: "https://www.tesla.com/es_es/powerwall",
    activo: true
  }
];

async function seedBaterias() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("Missing credentials");
        return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log("Seeding baterias_solares...");
    
    // Deactivate old ones
    await supabase.from("baterias_solares").update({ activo: false }).neq("id", "000"); // Deactivate all

    // Insert new ones
    for (const bat of BATERIAS_DATA) {
        const { error } = await supabase
            .from("baterias_solares")
            .upsert(bat, { onConflict: "slug" });
        
        if (error) {
            console.error(`Error inserting ${bat.slug}:`, error);
        } else {
            console.log(`Inserted / Updated ${bat.slug}`);
        }
    }

    console.log("Seeding completed.");
}

seedBaterias();
