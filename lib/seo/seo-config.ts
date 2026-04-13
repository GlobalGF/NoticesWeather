/**
 * Centralized SEO & Site Configuration
 * 
 * This ensures that even if we are on a Vercel preview URL, 
 * the canonical tags and sitemaps point to the production domain.
 */

const PRODUCTION_URL = "https://solaryeco.es";

export const SITE_CONFIG = {
  name: "SolaryEco",
  domain: "solaryeco.es",
  productionUrl: PRODUCTION_URL,
  twitter: "@solaryeco",
};

/**
 * Returns the absolute base URL for the site.
 * Logic: 
 * 1. If NODE_ENV is development, use localhost.
 * 2. If NEXT_PUBLIC_SITE_URL is set (and contains solaryeco.es), use it.
 * 3. Default to PRODUCTION_URL for all production deployments.
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // If NEXT_PUBLIC_SITE_URL is explicitly set to the production domain, use it.
  // Otherwise, force PRODUCTION_URL to prevent Vercel preview URLs from leaking into SEO.
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.includes(SITE_CONFIG.domain)) {
    return envUrl.replace(/\/$/, ""); // Remove trailing slash if present
  }

  return PRODUCTION_URL;
}

export const BASE_URL = getBaseUrl();
