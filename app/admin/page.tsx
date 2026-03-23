/**
 * Admin Dashboard — /admin
 *
 * Server component. Reads metrics directly from Supabase using the admin client.
 * Protected by HTTP Basic Auth in middleware.ts.
 *
 * Metrics shown:
 *   1. Páginas: pendientes / publicadas / indexadas
 *   2. Leads: hoy / nuevos / vendidos / tasa conversión
 *   3. Indexación: errores últimas 24h
 *   4. Últimos 10 leads recibidos
 *   5. Últimos 10 errores de indexación
 *   6. Últimos 10 errores de generación SEO
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Panel de Control — PSEO Solar",
    robots: "noindex, nofollow",
};

export const revalidate = 0; // always fresh

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n: number | null | undefined): string {
    if (n == null) return "—";
    return n.toLocaleString("es-ES");
}

function pct(num: number, den: number): string {
    if (!den) return "0%";
    return ((num / den) * 100).toFixed(1) + "%";
}

function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({
    label,
    value,
    sub,
    color = "slate",
}: {
    label: string;
    value: string;
    sub?: string;
    color?: "slate" | "amber" | "blue" | "green" | "red";
}) {
    const colors = {
        slate: "bg-slate-50 border-slate-200",
        amber: "bg-amber-50 border-amber-200",
        blue: "bg-blue-50 border-blue-200",
        green: "bg-green-50 border-green-200",
        red: "bg-red-50 border-red-200",
    };
    const textColors = {
        slate: "text-slate-900",
        amber: "text-amber-800",
        blue: "text-blue-800",
        green: "text-green-800",
        red: "text-red-800",
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-1 text-3xl font-extrabold tabular-nums ${textColors[color]}`}>{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

/* ── Section Header ──────────────────────────────────────── */
function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <h2 className="mt-10 mb-3 flex items-center gap-2 text-base font-bold uppercase tracking-widest text-slate-500">
            <span>{icon}</span> {title}
        </h2>
    );
}

/* ── Badge ───────────────────────────────────────────────── */
function Badge({ text, color }: { text: string; color: "green" | "amber" | "red" | "slate" }) {
    const cls = {
        green: "bg-green-100 text-green-800",
        amber: "bg-amber-100 text-amber-800",
        red: "bg-red-100 text-red-800",
        slate: "bg-slate-100 text-slate-700",
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls[color]}`}>
            {text}
        </span>
    );
}

function estadoBadge(estado: string) {
    const map: Record<string, "green" | "amber" | "red" | "slate"> = {
        nuevo: "blue" as "slate",
        contactado: "amber",
        vendido: "green",
        descartado: "red",
    };
    return <Badge text={estado} color={map[estado] ?? "slate"} />;
}

/* ── Page ────────────────────────────────────────────────── */
export default async function AdminDashboard() {
    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split("T")[0];

    /* Fetch all metrics in parallel */
    const [
        { count: pagesPending },
        { count: pagesPublished },
        { count: pagesIndexed },
        { count: leadsTotal },
        { count: leadsHoy },
        { count: leadsNuevos },
        { count: leadsVendidos },
        { count: indexingErrors24h },
        { data: lastLeads },
        { data: lastIndexErrors },
        { data: lastSeoErrors },
    ] = await Promise.all([
        supabase.from("publish_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("publish_queue").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("publish_queue").select("*", { count: "exact", head: true }).eq("status", "indexed"),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("estado", "nuevo"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("estado", "vendido"),
        supabase.from("indexing_log").select("*", { count: "exact", head: true })
            .eq("status", "error")
            .gte("submitted_at", new Date(Date.now() - 86400000).toISOString()),
        supabase.from("leads")
            .select("id, nombre, municipio_nombre, provincia, tipo_vivienda, estado, score, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
        supabase.from("indexing_log")
            .select("id, url, status, http_status, submitted_at")
            .eq("status", "error")
            .order("submitted_at", { ascending: false })
            .limit(10),
        (async () => {
            try {
                return await supabase.from("seo_generation_errors" as never)
                    .select("municipio, error, created_at")
                    .order("created_at", { ascending: false })
                    .limit(10);
            } catch {
                return { data: [] as { municipio: string; error: string; created_at: string }[] };
            }
        })(),
    ]);

    const totalPages = (pagesPending ?? 0) + (pagesPublished ?? 0) + (pagesIndexed ?? 0);
    const convRate = pct(leadsVendidos ?? 0, leadsTotal ?? 1);

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Panel de Control</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-slate-900">PSEO Solar 🌞</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Actualizado: {new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
                    </p>
                </div>
                <a
                    href="/"
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                    ← Ver web
                </a>
            </div>

            {/* ── PÁGINAS ─────────────────────────────────────────── */}
            <SectionHeader title="Páginas" icon="📄" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total creadas" value={fmt(totalPages)} color="slate" />
                <StatCard label="Pendientes" value={fmt(pagesPending)} color="amber" />
                <StatCard label="Publicadas" value={fmt(pagesPublished)} color="blue" />
                <StatCard label="Indexadas" value={fmt(pagesIndexed)}
                    sub={totalPages > 0 ? pct(pagesIndexed ?? 0, totalPages) + " del total" : undefined}
                    color="green"
                />
            </div>

            {/* Progress bar publicadas vs total */}
            {totalPages > 0 && (
                <div className="mt-4 rounded-full bg-slate-100 h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                        style={{ width: pct(pagesPublished ?? 0, totalPages) }}
                    />
                </div>
            )}

            {/* ── LEADS ───────────────────────────────────────────── */}
            <SectionHeader title="Leads" icon="💰" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total leads" value={fmt(leadsTotal)} color="slate" />
                <StatCard label="Leads hoy" value={fmt(leadsHoy)} color="amber" />
                <StatCard label="Sin contactar" value={fmt(leadsNuevos)} color="blue" />
                <StatCard label="Vendidos" value={fmt(leadsVendidos)}
                    sub={`Conversión: ${convRate}`}
                    color="green"
                />
            </div>

            {/* ── INDEXACIÓN ──────────────────────────────────────── */}
            <SectionHeader title="Indexación" icon="🔍" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                <StatCard
                    label="Errores indexación (24h)"
                    value={fmt(indexingErrors24h)}
                    color={(indexingErrors24h ?? 0) > 0 ? "red" : "green"}
                />
                <StatCard
                    label="Estado del sistema"
                    value={(indexingErrors24h ?? 0) === 0 ? "✅ OK" : "⚠️ Con errores"}
                    color={(indexingErrors24h ?? 0) > 0 ? "amber" : "green"}
                />
            </div>

            {/* ── ÚLTIMOS LEADS ───────────────────────────────────── */}
            <SectionHeader title="Últimos leads recibidos" icon="📋" />
            {lastLeads && lastLeads.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                {["#", "Nombre", "Municipio", "Tipo", "Estado", "Score", "Hace"].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lastLeads.map((l: {
                                id: number; nombre: string; municipio_nombre: string | null;
                                provincia: string | null; tipo_vivienda: string | null;
                                estado: string; score: number | null; created_at: string;
                            }) => (
                                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 tabular-nums">{l.id}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900">{l.nombre}</td>
                                    <td className="px-4 py-3 text-slate-700">{l.municipio_nombre ?? "—"}</td>
                                    <td className="px-4 py-3 text-slate-500">{l.tipo_vivienda ?? "—"}</td>
                                    <td className="px-4 py-3">{estadoBadge(l.estado)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold tabular-nums ${(l.score ?? 0) >= 5 ? "text-green-700" : "text-slate-500"}`}>
                                            {l.score ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">{timeAgo(l.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-slate-400 mt-2">Aún no hay leads recibidos.</p>
            )}

            {/* ── ERRORES INDEXACIÓN ───────────────────────────────── */}
            {lastIndexErrors && lastIndexErrors.length > 0 && (
                <>
                    <SectionHeader title="Errores de indexación recientes" icon="⚠️" />
                    <div className="overflow-x-auto rounded-xl border border-red-200">
                        <table className="w-full text-sm">
                            <thead className="bg-red-50 text-left">
                                <tr>
                                    {["URL", "HTTP", "Hace"].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {lastIndexErrors.map((e: {
                                    id: number; url: string; status: string | null;
                                    http_status: number | null; submitted_at: string;
                                }) => (
                                    <tr key={e.id} className="hover:bg-red-50">
                                        <td className="px-4 py-3 max-w-xs truncate text-slate-700 font-mono text-xs">{e.url}</td>
                                        <td className="px-4 py-3 text-red-700 font-bold">{e.http_status ?? "—"}</td>
                                        <td className="px-4 py-3 text-slate-400">{timeAgo(e.submitted_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ── ERRORES SEO GENERATION ───────────────────────────── */}
            {lastSeoErrors && lastSeoErrors.length > 0 && (
                <>
                    <SectionHeader title="Errores de generación de contenido (n8n)" icon="🤖" />
                    <div className="overflow-x-auto rounded-xl border border-amber-200">
                        <table className="w-full text-sm">
                            <thead className="bg-amber-50 text-left">
                                <tr>
                                    {["Municipio", "Error", "Hace"].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-amber-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {(lastSeoErrors as { municipio: string; error: string; created_at: string }[]).map((e, i) => (
                                    <tr key={i} className="hover:bg-amber-50">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{e.municipio}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-sm truncate">{e.error}</td>
                                        <td className="px-4 py-3 text-slate-400">{timeAgo(e.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Footer */}
            <p className="mt-12 text-center text-xs text-slate-300">
                Panel interno — acceso restringido · PSEO Solar España
            </p>
        </main>
    );
}
