import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AdSenseDeferred } from "@/components/ui/AdSenseDeferred";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: {
    default: "SolaryEco — Energía Solar y Precio de la Luz en España",
    template: "%s | SolaryEco",
  },
  description: "Portal de datos de autoconsumo solar: tarifa de la luz hoy, rendimiento fotovoltaico, subvenciones y precios de instalación para más de 8.000 municipios españoles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://solaryeco.es"),
  verification: {
    google: "IVu8bUUUoiOINKqraPzS1UtF2VRKS1nMdBSujHUN7Ao",
  },
  openGraph: {
    siteName: "SolaryEco",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "SolaryEco — Energía Solar en España" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@solaryeco",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={manrope.className}>
        <AdSenseDeferred />
        {children}
      </body>
    </html>
  );
}