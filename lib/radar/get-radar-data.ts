type NarrativeItem = {
  key: string;
  coins: string[];
  asset_count: number;
  avg_change_24h: number | null;
  confidence: number;
  status: string;
  lead_asset: string;
};

type RadarAsset = {
  id: string;
  name: string;
  symbol: string;
  narrative: string;
  market_cap_rank: number | null;
  image: string;
  price_usd: number | null;
  market_cap_usd: number | null;
  change_24h: number | null;
  last_updated_at: number | null;
};

export type RadarResponse = {
  updatedAt: string;
  assets: RadarAsset[];
  narratives: NarrativeItem[];
  error?: string;
};

export async function getRadarData(): Promise<RadarResponse> {
  try {
    const trendingRes = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const trendingJson = await trendingRes.json();

    const coins = trendingJson?.coins ?? [];

    const assets: RadarAsset[] = coins.map((item: any, index: number) => {
      const coin = item.item;

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        narrative: "AI",
        market_cap_rank: coin.market_cap_rank ?? null,
        image: coin.small,
        price_usd: null,
        market_cap_usd: null,
        change_24h: null,
        last_updated_at: null,
      };
    });

    const narratives: NarrativeItem[] = [
      {
        key: "AI",
        coins: assets.slice(0, 5).map((a) => a.symbol.toUpperCase()),
        asset_count: assets.length,
        avg_change_24h: 4.2,
        confidence: 82,
        status: "Bullish",
        lead_asset: assets[0]?.symbol?.toUpperCase() || "N/A",
      },
    ];

    return {
      updatedAt: new Date().toISOString(),
      assets,
      narratives,
    };
  } catch (error) {
    console.error("GET_RADAR_DATA_ERROR", error);

    return {
      updatedAt: new Date().toISOString(),
      assets: [],
      narratives: [],
      error: "Failed to fetch radar data.",
    };
  }
}