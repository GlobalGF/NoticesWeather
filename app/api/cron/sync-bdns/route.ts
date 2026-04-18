import { NextResponse } from "next/server";
import { syncBdnsSubsidies } from "@/lib/services/bdns";

// Permitir hasta 5 minutos de ejecución si Vercel Pro, o 10s en Hobby
export const maxDuration = 300; 
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verificación de seguridad CRON
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // En producción (Vercel), se usa CRON_SECRET. En manual local, pasamos ?token=
  const secret = process.env.CRON_SECRET || "dev-secret-token";

  if (authHeader !== `Bearer ${secret}` && token !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await syncBdnsSubsidies();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON BDNS] Error no controlado:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
