const PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/PVcalc";

export type PvgisEstimateInput = {
  lat: number;
  lon: number;
  powerKw: number;
  tiltDeg: number;
  azimuthDeg: number;
  shadeLossPct: number;
  systemLossPct: number;
};

export type PvgisEstimateOutput = {
  annualProductionKwh: number;
  annualProductionWithoutShadeKwh: number;
  orientationLossPct: number;
  shadeLossPct: number;
  systemLossPct: number;
  pvgisAnnualOptimalKwh: number;
  pvgisAnnualSelectedKwh: number;
};

type PvgisResponse = {
  outputs?: {
    totals?: {
      fixed?: {
        E_y?: number;
      };
    };
  };
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function fetchPvgisAnnual(params: {
  lat: number;
  lon: number;
  peakPowerKw: number;
  angleDeg: number;
  aspectDeg: number;
}): Promise<number> {
  const query = new URLSearchParams({
    lat: params.lat.toFixed(5),
    lon: params.lon.toFixed(5),
    peakpower: params.peakPowerKw.toFixed(3),
    loss: "0",
    angle: Math.round(params.angleDeg).toString(),
    aspect: Math.round(params.aspectDeg).toString(),
    outputformat: "json"
  });

  const response = await fetch(`${PVGIS_BASE_URL}?${query.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`PVGIS request failed: ${response.status}`);
  }

  const payload = (await response.json()) as PvgisResponse;
  const annual = payload.outputs?.totals?.fixed?.E_y;

  if (typeof annual !== "number" || !Number.isFinite(annual)) {
    throw new Error("PVGIS response missing annual production output");
  }

  return annual;
}

export async function estimateWithPvgis(input: PvgisEstimateInput): Promise<PvgisEstimateOutput> {
  const lat = clamp(input.lat, -90, 90);
  const lon = clamp(input.lon, -180, 180);
  const powerKw = clamp(input.powerKw, 0.5, 1000);
  const tiltDeg = clamp(input.tiltDeg, 0, 90);
  const azimuthDeg = clamp(input.azimuthDeg, -180, 180);
  const shadeLossPct = clamp(input.shadeLossPct, 0, 80);
  const systemLossPct = clamp(input.systemLossPct, 0, 40);

  const [optimalAnnual, selectedAnnual] = await Promise.all([
    fetchPvgisAnnual({ lat, lon, peakPowerKw: powerKw, angleDeg: 35, aspectDeg: 0 }),
    fetchPvgisAnnual({ lat, lon, peakPowerKw: powerKw, angleDeg: tiltDeg, aspectDeg: azimuthDeg })
  ]);

  const orientationLossPct =
    optimalAnnual <= 0 ? 0 : clamp(((optimalAnnual - selectedAnnual) / optimalAnnual) * 100, 0, 100);

  const annualProductionWithoutShadeKwh = selectedAnnual * (1 - systemLossPct / 100);
  const annualProductionKwh = annualProductionWithoutShadeKwh * (1 - shadeLossPct / 100);

  return {
    annualProductionKwh: Number(annualProductionKwh.toFixed(1)),
    annualProductionWithoutShadeKwh: Number(annualProductionWithoutShadeKwh.toFixed(1)),
    orientationLossPct: Number(orientationLossPct.toFixed(2)),
    shadeLossPct: Number(shadeLossPct.toFixed(2)),
    systemLossPct: Number(systemLossPct.toFixed(2)),
    pvgisAnnualOptimalKwh: Number(optimalAnnual.toFixed(1)),
    pvgisAnnualSelectedKwh: Number(selectedAnnual.toFixed(1))
  };
}
