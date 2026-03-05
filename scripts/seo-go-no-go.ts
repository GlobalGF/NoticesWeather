import { getLaunchPhase } from "../lib/pseo/launch-phases";

type MetricStatus = {
  name: string;
  observed: number;
  target: number;
  pass: boolean;
  comparator: ">=" | "<=";
};

function parseEnvNumber(name: string): number {
  const raw = process.env[name];
  if (!raw) {
    throw new Error(`Missing env var: ${name}`);
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric env var ${name}='${raw}'`);
  }

  return parsed;
}

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

function main() {
  const phase = getLaunchPhase();

  const indexedRate = parseEnvNumber("SEO_OBS_INDEXED_RATE");
  const soft404Rate = parseEnvNumber("SEO_OBS_SOFT404_RATE");
  const ctrRate = parseEnvNumber("SEO_OBS_ORGANIC_CTR");
  const engagedSeconds = parseEnvNumber("SEO_OBS_ENGAGED_SECONDS");

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

  console.log("SEO Phase Go/No-Go");
  console.log("==================");
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
