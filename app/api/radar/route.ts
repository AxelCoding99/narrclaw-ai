import { NextResponse } from "next/server";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

type NarrativeKey =
  | "AI"
  | "RWA"
  | "DePIN"
  | "DeFi"
  | "Layer 1"
  | "Layer 2"
  | "Gaming"
  | "Memes"
  | "Infrastructure"
  | "Unknown";

const COIN_NARRATIVE_MAP: Record<string, NarrativeKey> = {
  btc: "Layer 1",
  eth: "Layer 1",
  sol: "Layer 1",
  sui: "Layer 1",
  apt: "Layer 1",

  arb: "Layer 2",
  op: "Layer 2",
  manta: "Layer 2",

  tao: "AI",
  fet: "AI",
  render: "AI",
  rndr: "AI",
  agix: "AI",
  near: "AI",

  ondo: "RWA",
  cfg: "RWA",
  polyx: "RWA",

  hnt: "DePIN",
  akt: "DePIN",
  iotx: "DePIN",

  ar: "Infrastructure",
  fil: "Infrastructure",

  aave: "DeFi",
  uni: "DeFi",
  dydx: "DeFi",
  pendle: "DeFi",

  imx: "Gaming",
  gala: "Gaming",
  beam: "Gaming",

  pepe: "Memes",
  doge: "Memes",
  bonk: "Memes",
  wif: "Memes",
};

type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  image?: string;
  current_price?: number | null;
  market_cap?: number | null;
  price_change_percentage_24h?: number | null;
  last_updated?: string | null;
};

type RadarAsset = {
  id: string;
  name: string;
  symbol: string;
  narrative: NarrativeKey;
  market_cap_rank: number | null;
  image: string;
  price_usd: number | null;
  market_cap_usd: number | null;
  change_24h: number | null;
  last_updated_at: number | null;
};

type NarrativeOutput = {
  key: NarrativeKey;
  coins: string[];
  asset_count: number;
  avg_change_24h: number | null;
  confidence: number;
  status: string;
  lead_asset: string;
};

function getNarrativeForSymbol(symbol: string): NarrativeKey {
  return COIN_NARRATIVE_MAP[symbol.toLowerCase()] || "Unknown";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getStatusFromAverage(avg: number | null) {
  if (avg === null) return "Stable";
  if (avg >= 8) return "Hot";
  if (avg >= 3) return "Building";
  if (avg >= 0) return "Stable";
  if (avg >= -5) return "Mixed";
  return "Risky";
}

function getLeadAssetSymbol(assets: RadarAsset[]) {
  const sorted = [...assets].sort((a, b) => {
    const marketCapA = a.market_cap_usd ?? 0;
    const marketCapB = b.market_cap_usd ?? 0;

    if (marketCapB !== marketCapA) {
      return marketCapB - marketCapA;
    }

    const changeA = a.change_24h ?? -999;
    const changeB = b.change_24h ?? -999;
    return changeB - changeA;
  });

  return sorted[0]?.symbol?.toUpperCase() || "N/A";
}

function buildNarrativesFromAssets(assets: RadarAsset[]): NarrativeOutput[] {
  const grouped = new Map<
    NarrativeKey,
    {
      key: NarrativeKey;
      coins: string[];
      assets: RadarAsset[];
    }
  >();

  for (const asset of assets) {
    if (asset.narrative === "Unknown") continue;

    const existing = grouped.get(asset.narrative);

    if (existing) {
      existing.coins.push(asset.symbol.toUpperCase());
      existing.assets.push(asset);
    } else {
      grouped.set(asset.narrative, {
        key: asset.narrative,
        coins: [asset.symbol.toUpperCase()],
        assets: [asset],
      });
    }
  }

  return Array.from(grouped.values())
    .map((group) => {
      const validChanges = group.assets
        .map((asset) => asset.change_24h)
        .filter((value): value is number => value !== null && !Number.isNaN(value));

      const avg =
        validChanges.length > 0
          ? validChanges.reduce((sum, value) => sum + value, 0) /
            validChanges.length
          : null;

      const positiveCount = group.assets.filter(
        (asset) => (asset.change_24h ?? -999) > 0
      ).length;

      const breadthRatio =
        group.assets.length > 0 ? positiveCount / group.assets.length : 0;

      const confidenceBase =
        45 +
        group.assets.length * 5 +
        (avg ?? 0) * 2 +
        breadthRatio * 18;

      const confidence = clamp(Math.round(confidenceBase), 35, 96);
      const status = getStatusFromAverage(avg);
      const uniqueCoins = Array.from(new Set(group.coins));
      const lead_asset = getLeadAssetSymbol(group.assets);

      return {
        key: group.key,
        coins: uniqueCoins,
        asset_count: group.assets.length,
        avg_change_24h: avg,
        confidence,
        status,
        lead_asset,
      };
    })
    .sort((a, b) => {
      const aScore = (a.avg_change_24h ?? -999) + a.asset_count * 2;
      const bScore = (b.avg_change_24h ?? -999) + b.asset_count * 2;
      return bScore - aScore;
    });
}

function buildFallbackAssets(): RadarAsset[] {
  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: "bittensor",
      name: "Bittensor",
      symbol: "tao",
      narrative: "AI",
      market_cap_rank: 1,
      image: "",
      price_usd: 410,
      market_cap_usd: 3200000000,
      change_24h: 8.4,
      last_updated_at: now,
    },
    {
      id: "fetch-ai",
      name: "Fetch.ai",
      symbol: "fet",
      narrative: "AI",
      market_cap_rank: 2,
      image: "",
      price_usd: 1.45,
      market_cap_usd: 1800000000,
      change_24h: 6.1,
      last_updated_at: now,
    },
    {
      id: "render-token",
      name: "Render",
      symbol: "rndr",
      narrative: "AI",
      market_cap_rank: 3,
      image: "",
      price_usd: 7.8,
      market_cap_usd: 2900000000,
      change_24h: 5.2,
      last_updated_at: now,
    },
    {
      id: "ondo-finance",
      name: "Ondo",
      symbol: "ondo",
      narrative: "RWA",
      market_cap_rank: 4,
      image: "",
      price_usd: 1.1,
      market_cap_usd: 1500000000,
      change_24h: 3.7,
      last_updated_at: now,
    },
    {
      id: "centrifuge",
      name: "Centrifuge",
      symbol: "cfg",
      narrative: "RWA",
      market_cap_rank: 5,
      image: "",
      price_usd: 0.62,
      market_cap_usd: 300000000,
      change_24h: 2.4,
      last_updated_at: now,
    },
    {
      id: "akash-network",
      name: "Akash",
      symbol: "akt",
      narrative: "DePIN",
      market_cap_rank: 6,
      image: "",
      price_usd: 3.9,
      market_cap_usd: 950000000,
      change_24h: 4.9,
      last_updated_at: now,
    },
    {
      id: "helium",
      name: "Helium",
      symbol: "hnt",
      narrative: "DePIN",
      market_cap_rank: 7,
      image: "",
      price_usd: 6.3,
      market_cap_usd: 1100000000,
      change_24h: 3.5,
      last_updated_at: now,
    },
    {
      id: "aave",
      name: "Aave",
      symbol: "aave",
      narrative: "DeFi",
      market_cap_rank: 8,
      image: "",
      price_usd: 102,
      market_cap_usd: 1500000000,
      change_24h: 1.8,
      last_updated_at: now,
    },
    {
      id: "uniswap",
      name: "Uniswap",
      symbol: "uni",
      narrative: "DeFi",
      market_cap_rank: 9,
      image: "",
      price_usd: 9.2,
      market_cap_usd: 5500000000,
      change_24h: 1.1,
      last_updated_at: now,
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "sol",
      narrative: "Layer 1",
      market_cap_rank: 10,
      image: "",
      price_usd: 170,
      market_cap_usd: 75000000000,
      change_24h: 2.6,
      last_updated_at: now,
    },
  ];
}

async function fetchMarketData(): Promise<MarketCoin[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 120 },
        headers: {
          accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko returned status ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    let assets: RadarAsset[] = [];
    let source: "live" | "fallback" = "live";
    let warning: string | null = null;

    try {
      const marketJson = await fetchMarketData();

      assets = marketJson
        .map((coin) => {
          const narrative = getNarrativeForSymbol(coin.symbol);

          return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            narrative,
            market_cap_rank: coin.market_cap_rank,
            image: coin.image || "",
            price_usd: coin.current_price ?? null,
            market_cap_usd: coin.market_cap ?? null,
            change_24h: coin.price_change_percentage_24h ?? null,
            last_updated_at: coin.last_updated
              ? Math.floor(new Date(coin.last_updated).getTime() / 1000)
              : null,
          };
        })
        .filter((asset) => asset.narrative !== "Unknown");
    } catch (error) {
      console.error("RADAR_LIVE_FETCH_FAILED", error);
      assets = buildFallbackAssets();
      source = "fallback";
      warning = "Live market feed unavailable. Using fallback radar data.";
    }

    const narratives = buildNarrativesFromAssets(assets);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source,
      warning,
      assets,
      narratives,
    });
  } catch (error) {
    console.error("RADAR_API_ERROR", error);

    const fallbackAssets = buildFallbackAssets();
    const narratives = buildNarrativesFromAssets(fallbackAssets);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: "fallback",
      warning: "Radar recovered with fallback data after unexpected error.",
      assets: fallbackAssets,
      narratives,
    });
  }
}