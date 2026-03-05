export function canonicalFromPath(pathname: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  return `${base}${pathname}`;
}