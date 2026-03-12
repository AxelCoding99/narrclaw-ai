import { getRadarData } from "../../utils";

export async function radarAgent(args:any) {

  const data = await getRadarData();

  const narrative = args.narrative?.toLowerCase();

  const found = data.narratives.find(
    (n:any) => n.key.toLowerCase() === narrative
  );

  if (!found) {
    return {
      error: "Narrative not found"
    };
  }

  return {
    narrative: found.key,
    momentum: found.avg_change_24h,
    confidence: found.confidence,
    coins: found.coins
  };
}