import { ImageResponse } from "next/og";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Baterías Solares y Rentabilidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { municipio: string } }) {
    const slug = params.municipio;

    // Default fallback values
    let munName = "tu municipio";
    let provName = "España";
    let ahorro = "600";

    try {
        const supabase = await createSupabaseServerClient();
        const { data: rawData } = await supabase
            .from("municipios_energia")
            .select("municipio, provincia, ahorro_estimado")
            .eq("slug", slug)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = rawData as any;

        if (data) {
            munName = data.municipio;
            provName = data.provincia;
            const extra = Math.round((data.ahorro_estimado ?? 600) * 0.4);
            ahorro = String((data.ahorro_estimado ?? 600) + extra);
        }
    } catch (e) {
        console.error("OG Image Baterias Error:", e);
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    fontFamily: "Inter, sans-serif",
                    color: "white",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
                    <div style={{ background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "100px", fontSize: "24px", fontWeight: 700, letterSpacing: "1px" }}>
                        BATERÍAS SOLARES
                    </div>
                </div>

                <h1 style={{ fontSize: "72px", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px 0", letterSpacing: "-2px" }}>
                    ¿Son rentables las<br />
                    baterías en {munName}?
                </h1>

                <p style={{ fontSize: "36px", color: "#94a3b8", margin: "0 0 50px 0", maxWidth: "800px" }}>
                    Descubre cómo multiplicar el ahorro y alcanzar el 85% de autoconsumo en la provincia de {provName}.
                </p>

                <div style={{ display: "flex", gap: "30px" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px 40px", borderRadius: "16px", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontSize: "20px", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Ahorro estimado total</span>
                        <span style={{ fontSize: "56px", fontWeight: 800, color: "#34d399", display: "flex", alignItems: "baseline", gap: "8px" }}>
                            {ahorro}€ <span style={{ fontSize: "24px", color: "#94a3b8", fontWeight: 500 }}>/año</span>
                        </span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size
        }
    );
}
