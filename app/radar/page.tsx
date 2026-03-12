"use client";

import Navbar from "../../components/navbar";
import {
  Activity,
  ArrowRight,
  Brain,
  ChevronRight,
  Radar as RadarIcon,
  Sparkles,
  Waves,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

type NarrativeItem = {
  key: string;
  coins: string[];
  asset_count: number;
  avg_change_24h: number | null;
  confidence: number;
  status: string;
  lead_asset: string;
};

type RadarResponse = {
  updatedAt: string;
  assets: RadarAsset[];
  narratives: NarrativeItem[];
  error?: string;
};

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getMomentumTone(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "text-foreground";
  }

  if (value >= 6) return "text-primary";
  if (value >= 0) return "text-foreground";
  return "text-red-400";
}

function getStatusTone(status: string) {
  const value = status.toLowerCase();

  if (value.includes("strong") || value.includes("hot") || value.includes("bull")) {
    return "border-primary/25 bg-primary/10 text-primary";
  }

  if (value.includes("watch") || value.includes("build") || value.includes("neutral")) {
    return "border-border bg-background/70 text-muted-foreground";
  }

  if (value.includes("weak") || value.includes("risk") || value.includes("bear")) {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return "border-border bg-background/70 text-muted-foreground";
}

function getLifecycle(item: NarrativeItem, index: number) {
  const momentum = item.avg_change_24h ?? 0;

  if (index === 0 && momentum >= 4) return "Expansion";
  if (momentum >= 2.5) return "Emerging";
  if (momentum >= 0) return "Building";
  return "Fading";
}

function getBreadth(item: NarrativeItem) {
  if (item.asset_count >= 5) return "Broad";
  if (item.asset_count >= 3) return "Focused";
  return "Thin";
}

function getRisk(item: NarrativeItem, index: number) {
  const momentum = item.avg_change_24h ?? 0;

  if (index === 0 && momentum >= 5) return "Crowded";
  if (momentum < 0) return "Weak";
  if (item.asset_count <= 2) return "Fragile";
  return "Healthy";
}

function getRotationLabel(current?: NarrativeItem, previous?: NarrativeItem) {
  if (!current) return "No clear leader";
  if (!previous) return `${current.key} is leading attention`;

  return `${current.key} is leading, with ${previous.key} as the closest challenger`;
}

function getUpdatedText(updatedAt?: string) {
  if (!updatedAt) return "Unknown";

  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}h ago`;
}

function HeatCard({
  item,
  index,
  active,
}: {
  item: NarrativeItem;
  index: number;
  active?: boolean;
}) {
  const lifecycle = getLifecycle(item, index);
  const breadth = getBreadth(item);
  const risk = getRisk(item, index);

  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 ${
        active
          ? "border-primary/40 bg-primary/5 shadow-[0_0_50px_rgba(252,213,53,0.08)]"
          : "border-border bg-card/85 hover:border-primary/25"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-[26px] font-semibold text-foreground">
              {item.key}
            </div>

            {active && (
              <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                Leading
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Lead asset <span className="text-foreground">{item.lead_asset}</span>.{" "}
            {item.asset_count} tracked assets.
          </p>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${getStatusTone(
            item.status
          )}`}
        >
          {item.status}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/70 px-4 py-4">
          <div className="text-xs text-muted-foreground">Momentum</div>
          <div
            className={`mt-1 text-2xl font-semibold ${getMomentumTone(
              item.avg_change_24h
            )}`}
          >
            {formatPercent(item.avg_change_24h)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/70 px-4 py-4">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">
            {item.confidence}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-background/50 px-3 py-3">
          <div className="text-[11px] text-muted-foreground">Lifecycle</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {lifecycle}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/50 px-3 py-3">
          <div className="text-[11px] text-muted-foreground">Breadth</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {breadth}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/50 px-3 py-3">
          <div className="text-[11px] text-muted-foreground">Risk</div>
          <div className="mt-1 text-sm font-medium text-foreground">{risk}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.coins.slice(0, 4).map((coin) => (
          <div
            key={coin}
            className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground"
          >
            {coin}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/strategy?q=${encodeURIComponent(item.key.toLowerCase())}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
        >
          Analyze strategy
          <ChevronRight className="h-4 w-4" />
        </Link>

        <Link
          href={`/console?q=${encodeURIComponent(`/radar ${item.key.toLowerCase()}`)}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
        >
          Open in Console
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  title,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-card/90 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-primary">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-3 text-primary">
          {icon}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background/60 p-5 text-sm leading-7 text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

export default function RadarPage() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await fetch("/api/radar", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("RADAR_PAGE_ERROR", error);
      } finally {
        setLoading(false);
      }
    }

    loadRadar();

    const interval = setInterval(loadRadar, 60000);

    return () => clearInterval(interval);
  }, []);

  const narratives = data?.narratives ?? [];
  const assets = data?.assets ?? [];

  const lead = narratives[0];
  const second = narratives[1];
  const third = narratives[2];
  const weakest = narratives[narratives.length - 1];

  const topNarratives = useMemo(() => narratives.slice(0, 6), [narratives]);

  const emergingNarrative = useMemo(() => {
    if (narratives.length <= 2) return narratives[1];
    return [...narratives.slice(1)].sort(
      (a, b) => (b.avg_change_24h ?? -999) - (a.avg_change_24h ?? -999)
    )[0];
  }, [narratives]);

  const rotationSummary = getRotationLabel(lead, second);
  const updatedText = getUpdatedText(data?.updatedAt);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-80px] top-[180px] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Navbar />

      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div className="mb-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary">
              <RadarIcon className="h-3.5 w-3.5" />
              Narrative Radar
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Crypto narrative intelligence
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Radar groups live market assets into narratives so you can see
              where attention is rotating across the crypto market.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/console?q=${encodeURIComponent(
                  `compare ${lead?.key ?? "ai"} vs ${second?.key ?? "rwa"}`
                )}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary transition hover:bg-primary/15"
              >
                Compare top narratives
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/console?q=${encodeURIComponent(
                  `/radar ${lead?.key?.toLowerCase() ?? "ai"}`
                )}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/25 hover:text-foreground"
              >
                Open leader in Console
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card/80 p-5 shadow-[0_10px_50px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                  System
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {loading ? "Loading radar..." : "Radar active"}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase text-primary">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                {loading ? "Loading" : "Live"}
              </div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Updated {updatedText}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Leading</div>
                <div className="mt-1 font-semibold">{lead?.key ?? "N/A"}</div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Watch</div>
                <div className="mt-1 font-semibold">{second?.key ?? "N/A"}</div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Weakening</div>
                <div className="mt-1 font-semibold text-foreground">
                  {weakest?.key ?? "N/A"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                <Waves className="h-3.5 w-3.5" />
                Rotation now
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                {rotationSummary}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[26px] border border-border bg-card/85 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-primary">
                Market Leader
              </div>
              <Activity className="h-4 w-4 text-primary" />
            </div>

            <div className="mt-4 text-2xl font-semibold">
              {lead?.key ?? "N/A"}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Momentum {formatPercent(lead?.avg_change_24h ?? null)}
            </div>
          </div>

          <div className="rounded-[26px] border border-border bg-card/85 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-primary">
                Challenger
              </div>
              <Zap className="h-4 w-4 text-primary" />
            </div>

            <div className="mt-4 text-2xl font-semibold">
              {second?.key ?? "N/A"}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Closest narrative behind the leader
            </div>
          </div>

          <div className="rounded-[26px] border border-border bg-card/85 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-primary">
                Emerging
              </div>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="mt-4 text-2xl font-semibold">
              {emergingNarrative?.key ?? "N/A"}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Narrative showing constructive momentum
            </div>
          </div>

          <div className="rounded-[26px] border border-border bg-card/85 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-primary">
                Tracked Assets
              </div>
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>

            <div className="mt-4 text-2xl font-semibold">{assets.length}</div>

            <div className="mt-2 text-sm text-muted-foreground">
              Assets currently grouped into radar narratives
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-border bg-card/85 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.14)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">
                Narrative Heat
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                Sector momentum overview
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading && (
              <div className="col-span-full rounded-2xl border border-border bg-background/60 p-5 text-sm text-muted-foreground">
                Loading narratives...
              </div>
            )}

            {!loading && topNarratives.length === 0 && (
              <div className="col-span-full rounded-2xl border border-border bg-background/60 p-5 text-sm text-muted-foreground">
                No narrative data available yet.
              </div>
            )}

            {topNarratives.map((item, i) => (
              <HeatCard key={item.key} item={item} index={i} active={i === 0} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <InsightCard
            icon={<Brain className="h-5 w-5" />}
            label="AI Interpretation"
            title={`Why ${lead?.key ?? "this narrative"} is leading`}
            description={
              lead
                ? `${lead.key} is currently leading the radar with ${formatPercent(
                    lead.avg_change_24h
                  )} momentum, ${lead.confidence} confidence, and ${lead.asset_count} tracked assets. The move appears ${getBreadth(
                    lead
                  ).toLowerCase()} in breadth, led by ${lead.lead_asset}, while the current lifecycle reads as ${getLifecycle(
                    lead,
                    0
                  ).toLowerCase()}.`
                : "No narrative data yet."
            }
          />

          <div className="rounded-[32px] border border-border bg-card/85 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                  Ask NarrAI
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                  Suggested prompts
                </h2>
              </div>

              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-3">
              <Link
                href={`/console?q=${encodeURIComponent(
                  `compare ${lead?.key ?? "ai"} vs ${second?.key ?? "rwa"}`
                )}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                Compare top narratives
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/console?q=${encodeURIComponent(
                  `/learn ${lead?.key?.toLowerCase() ?? "ai"}`
                )}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                Explain leading narrative
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/console?q=${encodeURIComponent(
                  `/strategy ${lead?.key?.toLowerCase() ?? "ai"}`
                )}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                Generate strategy for leader
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/console?q=${encodeURIComponent(
                  `/radar ${third?.key?.toLowerCase() ?? "depin"}`
                )}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                Inspect another narrative
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}