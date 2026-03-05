import { NextRequest, NextResponse } from "next/server";
import { estimateWithPvgis } from "@/lib/pvgis/estimate";

export const runtime = "nodejs";

function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const lat = toNumber(body.lat);
  const lon = toNumber(body.lon);
  const powerKw = toNumber(body.powerKw);
  const tiltDeg = toNumber(body.tiltDeg);
  const azimuthDeg = toNumber(body.azimuthDeg);
  const shadeLossPct = toNumber(body.shadeLossPct);
  const systemLossPct = toNumber(body.systemLossPct);

  if (
    lat === null ||
    lon === null ||
    powerKw === null ||
    tiltDeg === null ||
    azimuthDeg === null ||
    shadeLossPct === null ||
    systemLossPct === null
  ) {
    return NextResponse.json({ ok: false, error: "Missing or invalid numeric input fields" }, { status: 400 });
  }

  try {
    const result = await estimateWithPvgis({
      lat,
      lon,
      powerKw,
      tiltDeg,
      azimuthDeg,
      shadeLossPct,
      systemLossPct
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PVGIS error";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
