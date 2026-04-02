const DEFAULT_STATIC_ROUTES = 400;
const MAX_ALLOWED_STATIC_ROUTES = 1000;

export function getStaticPrebuildBudget(envName: string, fallback = DEFAULT_STATIC_ROUTES): number {
  const raw = process.env[envName];
  const parsed = Number(raw);

  if (!raw || !Number.isFinite(parsed)) {
    return fallback;
  }

  const safe = Math.floor(parsed);
  if (safe < 1) return 1;
  if (safe > MAX_ALLOWED_STATIC_ROUTES) return MAX_ALLOWED_STATIC_ROUTES;
  return safe;
}
