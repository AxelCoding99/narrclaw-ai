import { getRadarData } from "../utils";

export async function runRadarAgent() {
  const radarData = await getRadarData();
  const narratives = radarData.narratives ?? [];
  const topNarrative = narratives[0] || null;

  return {
    ok: true,
    updatedAt: radarData.updatedAt ?? new Date().toISOString(),
    source: radarData.source ?? "live",
    narratives,
    topNarrative,
  };
}