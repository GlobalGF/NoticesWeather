import { BASE_URL } from "./seo-config";

export function canonicalFromPath(pathname: string): string {
  const base = BASE_URL;
  return `${base}${pathname}`;
}