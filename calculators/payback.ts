export function estimatePaybackYears(investmentEur: number, annualSavingsEur: number): number {
  if (annualSavingsEur <= 0) return Number.POSITIVE_INFINITY;
  return investmentEur / annualSavingsEur;
}