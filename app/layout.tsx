import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
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
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MNDBG8WV');
          `}
        </Script>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNDBG8WV"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }} 
          />
        </noscript>
        
        <AdSenseDeferred />
        {children}
      </body>
    </html>
  );
}