/**
 * POST /api/leads
 *
 * Validates, deduplicates, and stores a solar lead in Supabase.
 * After saving, fires the n8n webhook for real-time notification and scoring.
 *
 * Body:
 *   nombre        string   — first/full name
 *   telefono      string   — 9-digit Spanish phone (E.164 normalised here)
 *   tipo_vivienda string   — 'unifamiliar' | 'piso' | 'empresa'
 *   consumo_kwh   number   — annual kWh consumption
 *   municipio     string   — display name
 *   municipio_slug string  — URL slug
 *   provincia     string   — province name
 *
 * Returns:
 *   200 { ok: true, id: number }
 *   422 { error: string }   — validation error
 *   409 { error: string }   — duplicate lead
 *   500 { error: string }   — server error
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";
import { Resend } from "resend";

/* ── Config ──────────────────────────────────────────────── */
const MAX_BODY_BYTES = 4_096;
const DEDUP_WINDOW_HOURS = 24;
const LEAD_NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL ?? "contact@globalgrowthframework.dev";

/* ── Validation helpers ──────────────────────────────────── */
function normalisePhone(raw: string): string | null {
    const digits = raw.replace(/[\s\-\.]/g, "");
    // Spanish mobile/landline: starts with 6,7,8,9 — 9 digits total
    if (/^[6789]\d{8}$/.test(digits)) return digits;
    return null;
}

function isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

/* ── Hash helpers (GDPR: never store raw IP) ──────────────── */
function hashIp(ip: string): string {
    return createHash("sha256").update(ip + (process.env.IP_SALT ?? "solar")).digest("hex").slice(0, 16);
}

/* ── Route handler ───────────────────────────────────────── */
export async function POST(req: NextRequest): Promise<NextResponse> {
    /* -- Size guard -- */
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    /* -- Extract & validate -- */
    const nombre = typeof body.nombre === "string" ? body.nombre : "";
    const rawPhone = typeof body.telefono === "string" ? body.telefono : "";
    const tipo = (typeof body.tipo_vivienda === "string" ? body.tipo_vivienda : "unifamiliar") as "unifamiliar" | "piso" | "empresa" | null;
    const consumo = typeof body.consumo_kwh === "number" ? body.consumo_kwh : null;
    const municipio = typeof body.municipio === "string" ? body.municipio : "";
    const slug = typeof body.municipio_slug === "string" ? body.municipio_slug : null;
    const provincia = typeof body.provincia === "string" ? body.provincia : "";
    const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : null;

    /* Extra fields from LeadCaptureForm */
    const tejado = typeof body.tejado === "string" ? body.tejado : null;
    const bateria = typeof body.bateria === "string" ? body.bateria : null;
    const consumoMensual = typeof body.consumo_mensual === "string" ? body.consumo_mensual : null;

    const telefono = normalisePhone(rawPhone);
    if (!telefono) {
        return NextResponse.json(
            { error: "Teléfono inválido. Debes introducir un número español de 9 dígitos." },
            { status: 422 }
        );
    }
    if (!isValidName(nombre)) {
        return NextResponse.json(
            { error: "Nombre inválido. Mínimo 2 caracteres." },
            { status: 422 }
        );
    }
    if (!tipo || !["unifamiliar", "piso", "empresa"].includes(tipo)) {
        return NextResponse.json({ error: "Tipo de vivienda inválido." }, { status: 422 });
    }

    const supabase = createSupabaseAdminClient();

    /* -- Deduplication: same phone in last DEDUP_WINDOW_HOURS -- */
    const windowStart = new Date(
        Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("telefono", telefono)
        .gte("created_at", windowStart)
        .maybeSingle();

    if (existing) {
        // Silently accept but don't double-insert (good UX, prevents spam)
        return NextResponse.json({ ok: true, deduplicated: true });
    }

    /* -- Read UTM params from Referer or forward from client -- */
    const referer = req.headers.get("referer") ?? "";
    const utmSource = typeof body.utm_source === "string" ? body.utm_source : null;
    const utmMedium = typeof body.utm_medium === "string" ? body.utm_medium : null;
    const utmCampaign = typeof body.utm_campaign === "string" ? body.utm_campaign : null;

    /* -- IP hash for GDPR-safe dedup -- */
    const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";
    const ipHash = hashIp(rawIp);

    /* -- Insert lead -- */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = (await supabase
        .from("leads")
        .insert({
            nombre: nombre.trim(),
            telefono,
            email,
            tipo_vivienda: tipo,
            consumo_kwh: consumo,
            municipio_nombre: municipio,
            municipio_slug: slug,
            provincia,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            ip_hash: ipHash,
            estado: "nuevo",
        } as any)
        .select("id")
        .single()) as any;

    if (insertError || !inserted) {
        console.error("[api/leads] Insert error:", insertError);
        return NextResponse.json(
            { error: "Error al guardar tu solicitud. Inténtalo de nuevo." },
            { status: 500 }
        );
    }

    /* -- Fire n8n webhook (non-blocking) -- */
    const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: inserted.id,
                nombre: nombre.trim(),
                telefono,
                tipo_vivienda: tipo,
                consumo_kwh: consumo,
                municipio,
                provincia,
                referer,
            }),
        }).catch((err) => {
            // Non-critical: log but don't fail the request
            console.warn("[api/leads] n8n webhook failed:", err?.message);
        });
    }

    /* -- Send email notification (non-blocking) -- */
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        const resend = new Resend(resendKey);
        const extraLines = [
            tejado ? `Tejado: ${tejado}` : null,
            bateria ? `Interés baterías: ${bateria}` : null,
            consumoMensual ? `Consumo mensual: ${consumoMensual}` : null,
            email ? `Email cliente: ${email}` : null,
        ].filter(Boolean).join("\n");

        resend.emails.send({
            from: "SolaryEco Leads <onboarding@resend.dev>",
            to: LEAD_NOTIFY_EMAIL,
            subject: `🔆 Nuevo lead solar: ${nombre.trim()} — ${municipio} (${provincia})`,
            text: [
                `Nuevo lead recibido en SolaryEco`,
                ``,
                `ID: ${inserted.id}`,
                `Nombre: ${nombre.trim()}`,
                `Teléfono: ${telefono}`,
                `Municipio: ${municipio}`,
                `Provincia: ${provincia}`,
                `Tipo vivienda: ${tipo ?? "—"}`,
                `Consumo anual: ${consumo ? consumo + " kWh" : "—"}`,
                extraLines,
                ``,
                `Fuente: ${referer || "directo"}`,
                `Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`,
            ].filter(Boolean).join("\n"),
        }).catch((err) => {
            console.warn("[api/leads] Email notification failed:", err?.message ?? err);
        });
    }

    return NextResponse.json({ ok: true, id: inserted.id }, { status: 200 });
}
