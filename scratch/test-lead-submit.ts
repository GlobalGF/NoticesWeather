async function testLead() {
  const url = "http://localhost:3000/api/leads";
  const body = {
    nombre: "Filipy Test ÉXITO",
    telefono: "688776655",
    tipo_vivienda: "unifamiliar",
    consumo_kwh: 6000,
    municipio: "Ciudad Real",
    municipio_slug: "ciudad-real",
    provincia: "Ciudad Real"
  };

  console.log("Sending test lead to:", url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Response Status:", res.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log("SUCCESS: Lead was sent correctly.");
    } else {
      console.error("FAILED: Lead submission failed.");
    }
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}

testLead();
