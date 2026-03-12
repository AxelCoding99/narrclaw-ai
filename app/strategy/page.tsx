"use client";

import Navbar from "../../components/navbar";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  Waves,
  Target,
  Shield,
  Clock3,
  BarChart3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  narratives?: NarrativeItem[];
  error?: string;
};

type OpenClawApiResponse = {
  ok: boolean;
  routed?: {
    intent: string;
    agent: string;
    args?: {
      topic?: string;
    };
  };
  result?: {
    ok: boolean;
    route: {
      intent: string;
      agent: string;
    };
    state: string;
    summary: string;
    reasoning1: string;
    reasoning2: string;
    reasoning3: string;
    stream: string[];
  };
  error?: string;
};

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function normalizeTopic(input: string) {
  const value = input.toLowerCase().trim();
  if (value === "ai") return "AI";
  if (value === "rwa") return "RWA";
  if (value === "depin") return "DePIN";
  if (value === "defi") return "DeFi";
  if (value === "layer 1" || value === "layer1" || value === "l1") return "Layer 1";
  if (value === "layer 2" || value === "layer2" || value === "l2") return "Layer 2";
  return input.trim() || "AI";
}

function parseTopicFromSearch(search: string | null) {
  if (!search) return "AI";
  const trimmed = search.trim();
  if (!trimmed) return "AI";

  if (trimmed.startsWith("/strategy")) {
    return normalizeTopic(trimmed.replace("/strategy", "").trim() || "AI");
  }

  return normalizeTopic(trimmed);
}

function buildStrategyMetrics(narrative: NarrativeItem | null) {
  const confidence = narrative?.confidence ?? 62;
  const momentum = narrative?.avg_change_24h ?? 4.2;

  const riskReward =
    momentum >= 8 ? "3.2x" : momentum >= 3 ? "2.6x" : momentum >= 0 ? "2.1x" : "1.4x";

  const hitProbability =
    confidence >= 80 ? "72%" : confidence >= 70 ? "66%" : confidence >= 60 ? "59%" : "51%";

  const volatility =
    Math.abs(momentum) >= 8
      ? "Elevated"
      : Math.abs(momentum) >= 3
      ? "Moderate"
      : "Balanced";

  const positionSize =
    confidence >= 80 ? "2.0%" : confidence >= 70 ? "1.5%" : "1.0%";

  return {
    riskReward,
    hitProbability,
    volatility,
    positionSize,
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[28px] border border-border bg-card/85 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function HeaderChip({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
    >
      {icon}
      {text}
    </motion.div>
  );
}

function SmallMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border bg-background/60 p-4"
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className={`mt-2 text-xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}

function InsightBlock({
  icon,
  label,
  title,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border bg-background/60 p-5"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold text-foreground">{title}</div>
      <motion.p
        key={body}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="mt-3 text-sm leading-7 text-muted-foreground"
      >
        {body}
      </motion.p>
    </motion.div>
  );
}

function ActionRow({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <span>{text}</span>
      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group flex w-full items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-4 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-background/75 hover:text-foreground"
      >
        {content}
      </Link>
    );
  }

  return (
    <button className="group flex w-full items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-4 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-background/75 hover:text-foreground">
      {content}
    </button>
  );
}

function ThinkingStream({ active }: { active: boolean }) {
  const lines = [
    "Scanning live narrative posture...",
    "Evaluating conviction and breadth...",
    "Structuring execution framework...",
  ];

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.24 }}
          className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4"
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            OpenClaw thinking
          </div>

          <div className="space-y-2">
            {lines.map((line, index) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.22 }}
                className="text-sm text-muted-foreground"
              >
                {line}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function StrategyPage() {
  const [topic, setTopic] = useState("AI");
  const [inputValue, setInputValue] = useState("/strategy ai");
  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [runningStrategy, setRunningStrategy] = useState(false);
  const [strategySummary, setStrategySummary] =
    useState<OpenClawApiResponse["result"] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const nextTopic = parseTopicFromSearch(q);
    setTopic(nextTopic);
    setInputValue(`/strategy ${nextTopic.toLowerCase()}`);
  }, []);

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await fetch("/api/radar", {
          cache: "no-store",
        });
        const json: RadarResponse = await res.json();
        setRadarData(json);
      } catch (error) {
        console.error("STRATEGY_PAGE_RADAR_ERROR", error);
        setRadarData({
          updatedAt: new Date().toISOString(),
          narratives: [],
          error: "Failed to load radar data.",
        });
      } finally {
        setLoadingRadar(false);
      }
    }

    loadRadar();
    const interval = setInterval(loadRadar, 60000);
    return () => clearInterval(interval);
  }, []);

  const narratives = radarData?.narratives ?? [];

  const selectedNarrative = useMemo(() => {
    return (
      narratives.find(
        (item) => item.key.toLowerCase() === topic.toLowerCase()
      ) || narratives[0] || null
    );
  }, [narratives, topic]);

  const nextNarrative = useMemo(() => {
    return narratives.find(
      (item) =>
        item.key.toLowerCase() !== (selectedNarrative?.key || "").toLowerCase()
    );
  }, [narratives, selectedNarrative]);

  const metrics = buildStrategyMetrics(selectedNarrative);

  const thesisText = selectedNarrative
    ? `${selectedNarrative.key} is showing ${formatPercent(
        selectedNarrative.avg_change_24h
      )} grouped momentum with confidence ${selectedNarrative.confidence}/100.`
    : "No live narrative context is available yet.";

  const catalystText = selectedNarrative
    ? `${selectedNarrative.lead_asset} is leading the move, supported by ${selectedNarrative.coins.join(
        ", "
      )}.`
    : "No live catalyst stack is available yet.";

  const entryValue =
    selectedNarrative?.avg_change_24h !== null &&
    selectedNarrative?.avg_change_24h !== undefined
      ? selectedNarrative.avg_change_24h >= 8
        ? "Breakout"
        : selectedNarrative.avg_change_24h >= 3
        ? "Pullback"
        : "Confirmation"
      : "Watch";

  const invalidationValue =
    selectedNarrative?.status === "Risky"
      ? "Tight"
      : selectedNarrative?.status === "Hot"
      ? "Moderate"
      : "Standard";

  const targetValue =
    selectedNarrative?.confidence && selectedNarrative.confidence >= 80
      ? "Trend Continuation"
      : "Measured Expansion";

  async function generateStrategy() {
    const nextTopic = parseTopicFromSearch(inputValue);
    setTopic(nextTopic);
    setRunningStrategy(true);

    try {
      const res = await fetch("/api/openclaw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `/strategy ${nextTopic.toLowerCase()}`,
          sessionId: "strategy-page-session",
        }),
      });

      const data: OpenClawApiResponse = await res.json();

      if (data.ok && data.result) {
        setStrategySummary(data.result);
      } else {
        setStrategySummary({
          ok: false,
          route: {
            intent: "strategy",
            agent: "StrategyAgent",
          },
          state: "Execution Error",
          summary: data.error || "Strategy could not be generated.",
          reasoning1: "The strategy route was triggered but no result was returned.",
          reasoning2: "Check the API response and executor flow.",
          reasoning3: "UI is ready, but backend execution did not complete.",
          stream: [],
        });
      }
    } catch (error) {
      console.error("STRATEGY_PAGE_OPENCLAW_ERROR", error);
      setStrategySummary({
        ok: false,
        route: {
          intent: "strategy",
          agent: "StrategyAgent",
        },
        state: "Execution Error",
        summary: "Strategy generation failed unexpectedly.",
        reasoning1: "The page reached OpenClaw but execution failed.",
        reasoning2: "Check the browser console and API route.",
        reasoning3: "The strategy workspace is ready, but the response failed.",
        stream: [],
      });
    } finally {
      setRunningStrategy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.5, 0.95, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-120px] top-[120px] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(234,236,239,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(234,236,239,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      <Navbar />

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:pt-32"
      >
        <motion.div variants={itemVariants}>
          <GlassCard className="relative overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <HeaderChip icon={<Sparkles className="h-3.5 w-3.5" />} text="Strategy Lab" />

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className="text-4xl font-semibold tracking-tight md:text-5xl"
                  >
                    Build strategy from narrative conviction
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.14 }}
                    className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground"
                  >
                    Turn live narrative context into a cleaner trade plan with better
                    structure, less clutter, and clearer decision flow.
                  </motion.p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <motion.div variants={itemVariants}>
                    <SmallMetric
                      label="Selected theme"
                      value={selectedNarrative?.key || topic}
                      accent
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SmallMetric
                      label="Momentum"
                      value={formatPercent(selectedNarrative?.avg_change_24h ?? null)}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SmallMetric
                      label="Confidence"
                      value={
                        selectedNarrative ? `${selectedNarrative.confidence}/100` : "N/A"
                      }
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.03}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Strategy command
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Generate only when you decide
                  </h2>
                </div>

                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(252,213,53,0)",
                      "0 0 18px rgba(252,213,53,0.12)",
                      "0 0 0px rgba(252,213,53,0)",
                    ],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
                >
                  OpenClaw
                </motion.div>
              </div>

              <div className="rounded-[24px] border border-border bg-background/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  Prompt input
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <motion.input
                    whileFocus={{ scale: 1.005 }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 rounded-2xl border border-border bg-card/70 px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="/strategy ai"
                  />

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateStrategy}
                    disabled={runningStrategy}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {runningStrategy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Strategy
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["/strategy ai", "/strategy rwa", "/strategy depin", "/strategy defi"].map(
                    (item) => (
                      <motion.button
                        key={item}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInputValue(item)}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                      >
                        {item}
                      </motion.button>
                    )
                  )}
                </div>

                <div className="mt-4">
                  <ThinkingStream active={runningStrategy} />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.06}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Live context
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Narrative posture
                </h2>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-3 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Entry style" value={entryValue} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Invalidation" value={invalidationValue} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Target profile" value={targetValue} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Position size" value={metrics.positionSize} accent />
                </motion.div>
              </motion.div>

              <motion.div
                key={
                  loadingRadar
                    ? "loading"
                    : radarData?.error
                    ? "error"
                    : radarData?.updatedAt || "ready"
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="mt-4 rounded-2xl border border-border bg-background/60 p-4 text-sm leading-7 text-muted-foreground"
              >
                {loadingRadar
                  ? "Loading radar context..."
                  : radarData?.error
                  ? radarData.error
                  : `Updated from live radar data at ${
                      radarData?.updatedAt
                        ? new Date(radarData.updatedAt).toLocaleTimeString()
                        : "N/A"
                    }.`}
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.08}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Thesis workbench
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Strategy structure
                </h2>
              </div>

              <div className="grid gap-4">
                <InsightBlock
                  icon={<Brain className="h-4 w-4" />}
                  label="Narrative thesis"
                  title={selectedNarrative?.key || topic}
                  body={thesisText}
                />
                <InsightBlock
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Catalyst stack"
                  title={selectedNarrative?.lead_asset || "N/A"}
                  body={catalystText}
                />
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Reward / Risk" value={metrics.riskReward} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Hit Probability" value={metrics.hitProbability} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Volatility" value={metrics.volatility} accent />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SmallMetric label="Status" value={selectedNarrative?.status || "Balanced"} />
                </motion.div>
              </motion.div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.11}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    AI strategy output
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Generated explanation
                  </h2>
                </div>

                <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Structured
                </div>
              </div>

              {!strategySummary ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] border border-dashed border-border bg-background/40 p-6"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(252,213,53,0)",
                          "0 0 14px rgba(252,213,53,0.12)",
                          "0 0 0px rgba(252,213,53,0)",
                        ],
                      }}
                      transition={{ duration: 2.6, repeat: Infinity }}
                      className="mt-1 rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary"
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        Ready to generate
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                        Strategy output will appear here after you press{" "}
                        <span className="text-foreground">Generate Strategy</span>.
                        This keeps the page cleaner and gives you full control.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-[24px] border border-border bg-background/60 p-5">
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <SmallMetric
                      label="State"
                      value={strategySummary.state}
                      accent
                    />
                    <SmallMetric
                      label="Agent"
                      value={strategySummary.route.agent}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={strategySummary.summary}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.26 }}
                      className="grid gap-4"
                    >
                      <InsightBlock
                        icon={<Target className="h-4 w-4" />}
                        label="Summary"
                        title="Strategy overview"
                        body={strategySummary.summary}
                      />
                      <InsightBlock
                        icon={<BarChart3 className="h-4 w-4" />}
                        label="Reasoning 1"
                        title="Bias framework"
                        body={strategySummary.reasoning1}
                      />
                      <InsightBlock
                        icon={<Shield className="h-4 w-4" />}
                        label="Reasoning 2"
                        title="Risk logic"
                        body={strategySummary.reasoning2}
                      />
                      <InsightBlock
                        icon={<Clock3 className="h-4 w-4" />}
                        label="Reasoning 3"
                        title="Execution horizon"
                        body={strategySummary.reasoning3}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/console?q=${encodeURIComponent(
                    `/studio create thread for ${selectedNarrative?.key || topic} strategy`
                  )}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Create Thread
                </Link>
                <Link
                  href={`/console?q=${encodeURIComponent(
                    `simplify the ${selectedNarrative?.key || topic} strategy thesis`
                  )}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Simplify Thesis
                </Link>
                <Link
                  href={`/console?q=${encodeURIComponent(
                    `export ${selectedNarrative?.key || topic} strategy idea`
                  )}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Export Idea
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.14}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Scenario engine
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  What changes the setup
                </h2>
              </div>

              <div className="grid gap-3">
                <InsightBlock
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Bullish case"
                  title="Continuation"
                  body={`${selectedNarrative?.key || topic} keeps leadership and breadth remains healthy.`}
                />
                <InsightBlock
                  icon={<Waves className="h-4 w-4" />}
                  label="Neutral case"
                  title="Consolidation"
                  body="Price pauses while the narrative remains structurally intact."
                />
                <InsightBlock
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Bearish case"
                  title="Breakdown"
                  body={`Rotation leaves ${selectedNarrative?.key || topic} and conviction weakens.`}
                />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 md:p-7" delay={0.17}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Continue with AI
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Suggested actions
                </h2>
              </div>

              <div className="space-y-3">
                <ActionRow
                  text="/strategy refine — make this more conservative"
                  href={`/console?q=${encodeURIComponent(
                    `refine the ${selectedNarrative?.key || topic} strategy to be more conservative`
                  )}`}
                />
                <ActionRow
                  text="/strategy compare — compare with next narrative"
                  href={`/console?q=${encodeURIComponent(
                    `compare ${selectedNarrative?.key || topic} vs ${
                      nextNarrative?.key || "RWA"
                    }`
                  )}`}
                />
                <ActionRow
                  text="/studio strategy — turn setup into a brief"
                  href={`/console?q=${encodeURIComponent(
                    `/studio create brief for ${selectedNarrative?.key || topic} strategy`
                  )}`}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Execution conditions
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Valid if leadership stays broad, relative strength remains healthy,
                  and momentum does not collapse into weaker names.
                </p>
              </div>

              <motion.div
                whileHover={{ y: -1 }}
                className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-4 text-sm text-muted-foreground"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Next: generate, compare, or convert the strategy into content.
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}