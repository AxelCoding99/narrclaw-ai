export type NarrativeItem = {
  key: string;
  coins: string[];
  asset_count: number;
  avg_change_24h: number | null;
  confidence: number;
  status: string;
  lead_asset: string;
};

export type RadarResponse = {
  updatedAt: string;
  assets?: unknown[];
  narratives?: NarrativeItem[];
  error?: string;
  warning?: string | null;
  source?: "live" | "fallback";
};

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function getRadarData(): Promise<RadarResponse> {
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/radar`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`RADAR_HTTP_${res.status}`);
  }

  const radarData: RadarResponse = await res.json();

  if (radarData.error) {
    throw new Error("RADAR_JSON_ERROR");
  }

  return radarData;
}

export function formatMomentum(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function getMomentumScore(value: number | null) {
  if (value === null || Number.isNaN(value)) return -999;
  return value;
}

export function normalizeTopic(input?: string) {
  const value = input?.trim() || "";
  if (!value) return "";

  const lower = value.toLowerCase();

  if (lower === "ai") return "AI";
  if (lower === "rwa") return "RWA";
  if (lower === "depin") return "DePIN";
  if (lower === "defi") return "DeFi";
  if (lower === "layer 1" || lower === "layer1" || lower === "l1") return "Layer 1";
  if (lower === "layer 2" || lower === "layer2" || lower === "l2") return "Layer 2";
  if (lower === "infra" || lower === "infrastructure") return "Infrastructure";
  if (lower === "meme" || lower === "memes") return "Memes";
  if (lower === "gaming") return "Gaming";

  return value;
}