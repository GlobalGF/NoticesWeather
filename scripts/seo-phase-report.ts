import { getLaunchPhase } from "../lib/pseo/launch-phases";

function toPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function main() {
  const phase = getLaunchPhase();

  console.log("SEO Launch Phase Report");
  console.log("=======================");
  console.log(`Active phase: ${phase.label}`);
  console.log(`Target URLs: ${phase.targetUrls.toLocaleString("es-ES")}`);
  console.log(`Recommended weekly publish rhythm: ${phase.weeklyPublishMin}-${phase.weeklyPublishMax} URLs`);
  console.log(`Minimum quality score required: ${phase.minQualityScore}`);
  console.log("\nGate thresholds to move to next phase:");
  console.log(`- Indexed rate >= ${toPercent(phase.gateThresholds.minIndexedRate)}`);
  console.log(`- Soft 404 rate <= ${toPercent(phase.gateThresholds.maxSoft404Rate)}`);
  console.log(`- Organic CTR >= ${toPercent(phase.gateThresholds.minCtr)}`);
  console.log(`- Engaged time >= ${phase.gateThresholds.minEngagedTimeSeconds}s`);
}

main();
