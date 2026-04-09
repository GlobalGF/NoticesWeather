import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/precio-luz/*/",  // municipio pages 301'd to /placas-solares/*
      },
    ],
    sitemap: [`${base}/sitemap_index.xml`]
  };
}