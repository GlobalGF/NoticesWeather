import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CODE ? {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CODE,
  } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}