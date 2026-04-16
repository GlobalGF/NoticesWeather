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
import { sendTelegramMessage, escapeHtml } from "@/lib/utils/telegram";

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
    const codigo_postal = typeof body.codigo_postal === "string" ? body.codigo_postal.trim() : null;
    const direccion = typeof body.direccion === "string" ? body.direccion.trim() : null;

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
        .select("id, created_at")
        .eq("telefono", telefono)
        .gte("created_at", windowStart)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const isDuplicate = !!existing;

    if (isDuplicate) {
        console.info(`[api/leads] Duplicate lead detected for phone ${telefono}. Sending 'Repeat' notification.`);
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
    const leadData: any = {
        nombre: nombre.trim(),
        telefono,
        email,
        codigo_postal,
        direccion,
        interes_bateria: bateria,
        tipo_tejado: tejado,
        consumo_mensual: consumoMensual,
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
    };

    /* -- Insert lead (if not duplicate to avoid DB spam, or always if you prefer) -- */
    let insertedId = (existing as any)?.id;
    if (!isDuplicate) {
        const { data: inserted, error: insertError } = (await supabase
            .from("leads")
            .insert(leadData)
            .select("id")
            .single()) as any;

        if (insertError || !inserted) {
            console.error("[api/leads] Insert error:", insertError);
            return NextResponse.json(
                { error: "Error al guardar tu solicitud. Inténtalo de nuevo." },
                { status: 500 }
            );
        }
        insertedId = inserted.id;
    }


    /* -- 1. Send Telegram Alert (Native, no n8n) -- */
    const telegramHeader = isDuplicate ? "⚠️ <b>Lead REPETIDO (24h)</b>" : "🔆 <b>Nuevo Lead Solar</b>";
    const telegramText = `
${telegramHeader}
<b>Nombre:</b> ${escapeHtml(nombre.trim())}
<b>Teléfono:</b> ${escapeHtml(telefono)}
<b>Email:</b> ${escapeHtml(email || "—")}
<b>C.P.:</b> ${escapeHtml(codigo_postal || "—")}
<b>Dirección:</b> ${escapeHtml(direccion || "—")}
<b>Municipio:</b> ${escapeHtml(municipio)} (${escapeHtml(provincia)})
<b>Tipo:</b> ${escapeHtml(tipo ?? "—")}
<b>Consumo Anual:</b> ${consumo ? escapeHtml(String(consumo)) + " kWh/año" : "—"}
<b>Consumo Mes:</b> ${escapeHtml(consumoMensual || "—")}
<b>Tejado:</b> ${escapeHtml(tejado || "—")}
<b>Batería:</b> ${escapeHtml(bateria || "—")}

<i>Fuente: ${escapeHtml(referer || "directo")}</i>
    `.trim();

    sendTelegramMessage(telegramText)
        .then(res => {
            if (res.success) console.log(`[api/leads] Telegram alert sent for lead ${insertedId}${isDuplicate ? ' (DUPLICATE)' : ''}`);
            else console.error(`[api/leads] Telegram alert failed for lead ${insertedId}:`, JSON.stringify(res.error));
        })
        .catch(err => console.error(`[api/leads] Telegram fatal error for lead ${insertedId}:`, err));

    /* -- Send email notification (non-blocking) -- */
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        const resend = new Resend(resendKey);
        const subjectPrefix = isDuplicate ? "[REPETIDO] " : "";

        resend.emails.send({
            from: "SolaryEco Leads <onboarding@resend.dev>",
            to: LEAD_NOTIFY_EMAIL,
            subject: `${subjectPrefix}🔆 Nuevo lead solar: ${nombre.trim()} — ${municipio} (${provincia})`,
            text: [
                isDuplicate ? "SISTEMA: Este lead ya ha sido enviado en las últimas 24h." : "Nuevo lead recibido en SolaryEco",
                ``,
                `ID: ${insertedId}`,
                `Nombre: ${nombre.trim()}`,
                `Teléfono: ${telefono}`,
                `Email: ${email || "—"}`,
                `Código Postal: ${codigo_postal || "—"}`,
                `Dirección: ${direccion || "—"}`,
                `Municipio: ${municipio}`,
                `Provincia: ${provincia}`,
                `Tipo vivienda: ${tipo ?? "—"}`,
                `Consumo anual: ${consumo ? consumo + " kWh" : "—"}`,
                `Consumo mensual: ${consumoMensual || "—"}`,
                `Tipo Tejado: ${tejado || "—"}`,
                `Interés Baterías: ${bateria || "—"}`,
                ``,
                `Fuente: ${referer || "directo"}`,
                `Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`,
            ].filter(Boolean).join("\n"),
        }).then(res => {
            console.log(`[api/leads] Resend email attempt for lead ${insertedId}:`, res);
        }).catch((err) => {
            console.warn("[api/leads] Email notification failed:", err?.message ?? err);
        });
    }

    return NextResponse.json({ ok: true, id: insertedId, deduplicated: isDuplicate }, { status: 200 });
}
