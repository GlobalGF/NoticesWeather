export type LaunchPhaseKey = "phase1" | "phase2" | "phase3" | "phase4";

export type LaunchPhase = {
  key: LaunchPhaseKey;
  label: string;
  targetUrls: number;
  weeklyPublishMin: number;
  weeklyPublishMax: number;
  minQualityScore: number;
  gateThresholds: {
    minIndexedRate: number;
    maxSoft404Rate: number;
    minCtr: number;
    minEngagedTimeSeconds: number;
  };
};

export const LAUNCH_PHASES: Record<LaunchPhaseKey, LaunchPhase> = {
  phase1: {
    key: "phase1",
    label: "Fase 1 - 1,000 URLs",
    targetUrls: 1000,
    weeklyPublishMin: 250,
    weeklyPublishMax: 400,
    minQualityScore: 55,
    gateThresholds: {
      minIndexedRate: 0.65,
      maxSoft404Rate: 0.03,
      minCtr: 0.025,
      minEngagedTimeSeconds: 45
    }
  },
  phase2: {
    key: "phase2",
    label: "Fase 2 - 5,000 URLs",
    targetUrls: 5000,
    weeklyPublishMin: 800,
    weeklyPublishMax: 1200,
    minQualityScore: 60,
    gateThresholds: {
      minIndexedRate: 0.72,
      maxSoft404Rate: 0.025,
      minCtr: 0.027,
      minEngagedTimeSeconds: 50
    }
  },
  phase3: {
    key: "phase3",
    label: "Fase 3 - 20,000 URLs",
    targetUrls: 20000,
    weeklyPublishMin: 2000,
    weeklyPublishMax: 3000,
    minQualityScore: 65,
    gateThresholds: {
      minIndexedRate: 0.78,
      maxSoft404Rate: 0.02,
      minCtr: 0.03,
      minEngagedTimeSeconds: 55
    }
  },
  phase4: {
    key: "phase4",
    label: "Fase 4 - 100,000 URLs",
    targetUrls: 100000,
    weeklyPublishMin: 5000,
    weeklyPublishMax: 8000,
    minQualityScore: 70,
    gateThresholds: {
      minIndexedRate: 0.8,
      maxSoft404Rate: 0.02,
      minCtr: 0.03,
      minEngagedTimeSeconds: 60
    }
  }
};

export function getLaunchPhase(): LaunchPhase {
  const envPhase = (process.env.PSEO_LAUNCH_PHASE ?? "phase1").toLowerCase() as LaunchPhaseKey;
  return LAUNCH_PHASES[envPhase] ?? LAUNCH_PHASES.phase1;
}
