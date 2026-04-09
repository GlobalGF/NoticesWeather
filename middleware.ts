/**
 * Middleware — protects /admin with a simple password check.
 *
 * Auth: HTTP Basic Auth via ADMIN_PASSWORD env var.
 * If ADMIN_PASSWORD is not set, the dashboard is blocked entirely in production.
 *
 * Usage: set ADMIN_PASSWORD=tu-contraseña-secreta in Vercel env vars.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 301 redirect: /precio-luz/[municipio] → /placas-solares/[municipio]
  // Keep /precio-luz hub and known sub-pages (horas-baratas, etc.) intact.
  // Also skip slugs that contain non-municipality keywords to avoid 301 → 404 chains.
  const PRECIO_LUZ_SUBPAGES = new Set([
    "horas-baratas",
    "tarifas",
    "mercado-regulado",
    "discriminacion-horaria",
    "pvpc",
    "franjas-horarias",
  ]);
  const precioLuzMatch = pathname.match(/^\/precio-luz\/([^/]+)$/);
  if (precioLuzMatch) {
    const slug = precioLuzMatch[1];
    if (!PRECIO_LUZ_SUBPAGES.has(slug)) {
      return NextResponse.redirect(
        new URL(`/placas-solares/${slug}`, request.url),
        301
      );
    }
  }

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Block entirely if no password is configured in production
  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Admin no configurado.", { status: 503 });
    }
    // In dev, allow without password for convenience
    return NextResponse.next();
  }

  // Check Authorization header (Basic Auth)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const base64 = authHeader.split(" ")[1] ?? "";
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [, password] = decoded.split(":");
    if (password === adminPassword) {
      return NextResponse.next();
    }
  }

  // Prompt browser for credentials
  return new NextResponse("Acceso no autorizado.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Panel de Control PSEO Solar"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};