import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLaunchPhase } from "../lib/pseo/launch-phases";

type MetricStatus = {
  name: string;
  observed: number;
  target: number;
  pass: boolean;
  comparator: ">=" | "<=";
};

function toPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function buildStatus(name: string, observed: number, target: number, comparator: ">=" | "<="): MetricStatus {
  const pass = comparator === ">=" ? observed >= target : observed <= target;
  return { name, observed, target, pass, comparator };
}

function printStatus(status: MetricStatus, asPercent = true) {
  const observed = asPercent ? toPercent(status.observed) : `${status.observed.toFixed(2)}s`;
  const target = asPercent ? toPercent(status.target) : `${status.target.toFixed(2)}s`;
  const icon = status.pass ? "PASS" : "FAIL";
  console.log(`- [${icon}] ${status.name}: ${observed} ${status.comparator} ${target}`);
}

function getArgValue(flag: string): string | null {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index < 0 || index + 1 >= process.argv.length) return null;
  return process.argv[index + 1] ?? null;
}

function getFirstPositionalArg(): string | null {
  const positional = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  return positional ?? null;
}

function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must contain headers and at least one data row");
  }

  const commaHeaders = lines[0].split(",");
  const semicolonHeaders = lines[0].split(";");
  const delimiter = semicolonHeaders.length > commaHeaders.length ? ";" : ",";

  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(delimiter).map((v) => v.trim()));
  return { headers, rows };
}

function getCellValue(
  headers: string[],
  row: string[],
  candidates: string[]
): string | null {
  for (const key of candidates) {
    const idx = headers.findIndex((header) => header === key.toLowerCase());
    if (idx >= 0) {
      return row[idx] ?? null;
    }
  }
  return null;
}

function parsePercentLike(value: string, metricName: string): number {
  const cleaned = value.replace("%", "").replace(",", ".").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid value for ${metricName}: '${value}'`);
  }

  if (parsed > 1 && parsed <= 100) {
    return parsed / 100;
  }

  return parsed;
}

function parseSeconds(value: string, metricName: string): number {
  const cleaned = value.replace(",", ".").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid value for ${metricName}: '${value}'`);
  }
  return parsed;
}

function main() {
  const fileArg = getArgValue("--file") ?? getFirstPositionalArg();
  const filePath = fileArg ?? process.env.SEO_METRICS_CSV_PATH;

  if (!filePath) {
    throw new Error("Missing CSV path. Use --file <path> or set SEO_METRICS_CSV_PATH");
  }

  const csvRaw = readFileSync(resolve(filePath), "utf8");
  const { headers, rows } = parseCsv(csvRaw);
  const latestRow = rows[rows.length - 1];

  if (!latestRow) {
    throw new Error("No data rows found in CSV");
  }

  const indexedValue = getCellValue(headers, latestRow, [
    "indexed_rate",
    "indexed_rate_pct",
    "indexedrate",
    "indexed_percent"
  ]);
  const soft404Value = getCellValue(headers, latestRow, [
    "soft404_rate",
    "soft404_rate_pct",
    "soft_404_rate"
  ]);
  const ctrValue = getCellValue(headers, latestRow, [
    "organic_ctr",
    "organic_ctr_pct",
    "ctr"
  ]);
  const engagedValue = getCellValue(headers, latestRow, [
    "engaged_seconds",
    "engaged_time_seconds",
    "avg_engagement_time_seconds"
  ]);

  if (!indexedValue || !soft404Value || !ctrValue || !engagedValue) {
    throw new Error(
      "CSV missing required columns. Required metrics: indexed_rate, soft404_rate, organic_ctr, engaged_seconds (or supported aliases)"
    );
  }

  const indexedRate = parsePercentLike(indexedValue, "indexed_rate");
  const soft404Rate = parsePercentLike(soft404Value, "soft404_rate");
  const ctrRate = parsePercentLike(ctrValue, "organic_ctr");
  const engagedSeconds = parseSeconds(engagedValue, "engaged_seconds");

  process.env.SEO_OBS_INDEXED_RATE = String(indexedRate);
  process.env.SEO_OBS_SOFT404_RATE = String(soft404Rate);
  process.env.SEO_OBS_ORGANIC_CTR = String(ctrRate);
  process.env.SEO_OBS_ENGAGED_SECONDS = String(engagedSeconds);

  const phase = getLaunchPhase();

  const indexedAlertMin = Number(process.env.SEO_ALERT_MIN_INDEXED_RATE ?? phase.gateThresholds.minIndexedRate - 0.05);
  const soft404AlertMax = Number(process.env.SEO_ALERT_SOFT404_RATE ?? phase.gateThresholds.maxSoft404Rate + 0.01);
  const ctrAlertMin = Number(process.env.SEO_ALERT_MIN_ORGANIC_CTR ?? phase.gateThresholds.minCtr - 0.003);
  const engagedAlertMin = Number(
    process.env.SEO_ALERT_MIN_ENGAGED_SECONDS ?? Math.max(0, phase.gateThresholds.minEngagedTimeSeconds - 5)
  );

  const gateChecks = [
    buildStatus("Indexed rate", indexedRate, phase.gateThresholds.minIndexedRate, ">="),
    buildStatus("Soft 404 rate", soft404Rate, phase.gateThresholds.maxSoft404Rate, "<="),
    buildStatus("Organic CTR", ctrRate, phase.gateThresholds.minCtr, ">="),
    buildStatus("Engaged time", engagedSeconds, phase.gateThresholds.minEngagedTimeSeconds, ">=")
  ];

  const alertChecks = [
    buildStatus("Indexed rate alert", indexedRate, indexedAlertMin, ">="),
    buildStatus("Soft 404 alert", soft404Rate, soft404AlertMax, "<="),
    buildStatus("CTR alert", ctrRate, ctrAlertMin, ">="),
    buildStatus("Engaged time alert", engagedSeconds, engagedAlertMin, ">=")
  ];

  const gatesPass = gateChecks.every((item) => item.pass);
  const alertsPass = alertChecks.every((item) => item.pass);

  console.log("SEO Phase Go/No-Go (CSV)");
  console.log("=========================");
  console.log(`CSV source: ${resolve(filePath)}`);
  console.log(`Active phase: ${phase.label}`);

  console.log("\nGate checks:");
  printStatus(gateChecks[0]);
  printStatus(gateChecks[1]);
  printStatus(gateChecks[2]);
  printStatus(gateChecks[3], false);

  console.log("\nAlert checks:");
  printStatus(alertChecks[0]);
  printStatus(alertChecks[1]);
  printStatus(alertChecks[2]);
  printStatus(alertChecks[3], false);

  if (gatesPass && alertsPass) {
    console.log("\nDecision: GO (puedes ampliar volumen de publicacion en la siguiente cohorte)");
    return;
  }

  if (!alertsPass) {
    console.log("\nDecision: HOLD (hay alertas activas; mantener volumen o reducir hasta estabilizar)");
  } else {
    console.log("\nDecision: NO-GO (no cumple gates de fase; no escalar)");
  }

  process.exitCode = 1;
}

main();
