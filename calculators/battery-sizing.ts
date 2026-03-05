export function recommendBatteryKwh(minKwh: number, maxKwh: number): number {
  const avgAnnual = (minKwh + maxKwh) / 2;
  const avgDaily = avgAnnual / 365;
  return Number((avgDaily * 0.8).toFixed(1));
}