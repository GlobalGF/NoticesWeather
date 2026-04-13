import type { Metadata } from "next";
import { BASE_URL, SITE_CONFIG } from "./seo-config";

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
  noIndex?: boolean;
};

const SITE_NAME = SITE_CONFIG.name;
const DEFAULT_OG_IMAGE = "/og-default.png";

export function buildMetadata(input: MetadataInput): Metadata {
  const base = BASE_URL;
  const canonical = `${base}${input.pathname}`;
  const ogImageUrl = `${base}${DEFAULT_OG_IMAGE}`;

  // SMART SEO TITLE LOGIC: Handle length and branding
  let finalTitle = input.title;
  const brandFull = " | SolaryEco";
  const brandShort = " - S&E";

  if (finalTitle.length <= 48) {
    finalTitle = `${finalTitle}${brandFull}`;
  } else if (finalTitle.length <= 54) {
    finalTitle = `${finalTitle}${brandShort}`;
  }
  // If > 54 chars, we keep only the pure keyword title to avoid truncation

  return {
    title: finalTitle,
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: true } : undefined,
    authors: [{ name: SITE_NAME, url: base }],
    publisher: SITE_NAME,
    openGraph: {
      title: finalTitle,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "es_ES",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: input.description,
      site: SITE_CONFIG.twitter,
      images: [ogImageUrl],
    },
  };
}