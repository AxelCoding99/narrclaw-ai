"use client";

import Navbar from "../../components/navbar";
import {
  BookOpen,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  effectiveCommand?: string;
  error?: string;
};

type StudioMode = "post" | "thread";

type Draft = {
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
};

const STUDIO_SESSION_ID = "studio-session-1";
const SHARED_CONTEXT_KEY = "narrai-shared-context";

function ControlCard({
  label,
  value,
  onClick,
  active = false,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-background/60 hover:border-primary/25"
      }`}
    >
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold text-foreground">{value}</div>
    </button>
  );
}

function normalizeTopic(input?: string) {
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
  if (lower === "meme" || lower === "memes" || lower === "memecoin" || lower === "memecoins") return "Memes";
  if (lower === "gaming" || lower === "gamefi") return "Gaming";

  return value;
}

function inferTopicFromPrompt(prompt: string, fallbackTopic: string) {
  const lower = ` ${prompt.toLowerCase()} `;

  if (lower.includes(" ai ")) return "AI";
  if (lower.includes(" rwa ")) return "RWA";
  if (lower.includes(" depin ")) return "DePIN";
  if (lower.includes(" defi ")) return "DeFi";
  if (lower.includes(" layer 1 ") || lower.includes(" layer1 ") || lower.includes(" l1 ")) {
    return "Layer 1";
  }
  if (lower.includes(" layer 2 ") || lower.includes(" layer2 ") || lower.includes(" l2 ")) {
    return "Layer 2";
  }
  if (lower.includes(" infrastructure ") || lower.includes(" infra ")) {
    return "Infrastructure";
  }
  if (
    lower.includes(" meme ") ||
    lower.includes(" memes ") ||
    lower.includes(" memecoin ") ||
    lower.includes(" memecoins ")
  ) {
    return "Memes";
  }
  if (lower.includes(" gaming ") || lower.includes(" gamefi ")) {
    return "Gaming";
  }

  return normalizeTopic(fallbackTopic) || "AI";
}

function formatMomentum(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function modeLabel(mode: StudioMode) {
  return mode === "post" ? "Binance Square" : "X Thread";
}

function parseLabelValue(text: string, prefix: string) {
  if (!text) return "";
  const lowered = text.toLowerCase();
  const loweredPrefix = prefix.toLowerCase();

  if (lowered.startsWith(loweredPrefix)) {
    return text.slice(prefix.length).trim();
  }

  return text.trim();
}

function draftFromResult(
  result: NonNullable<OpenClawApiResponse["result"]>
): Draft {
  return {
    headline: parseLabelValue(result.summary, "Headline:") || result.summary,
    paragraph1:
      parseLabelValue(result.reasoning1, "Paragraph 1:") || result.reasoning1,
    paragraph2:
      parseLabelValue(result.reasoning2, "Paragraph 2:") || result.reasoning2,
    paragraph3:
      parseLabelValue(result.reasoning3, "Paragraph 3:") || result.reasoning3,
  };
}

function sharedTopicFromStorage() {
  try {
    const raw = localStorage.getItem(SHARED_CONTEXT_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as {
      topic?: string;
      narrative?: string;
    };
    return parsed.topic || parsed.narrative || "";
  } catch {
    return "";
  }
}

function buildDefaultPrompt(mode: StudioMode, topic: string, audience: string) {
  const cleanTopic = normalizeTopic(topic) || "AI";

  if (mode === "post") {
    return `Write a natural Binance Square post about why ${cleanTopic} is moving right now, what is likely driving the move, and what users should understand from the current market context. Make it specific, readable, and non-generic for ${audience}.`;
  }

  return `Write a clean X thread about why ${cleanTopic} is moving right now, what is likely driving the move, and what users should watch next. Keep it specific, natural, and easy to follow for ${audience}.`;
}

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState("AI");
  const [audience, setAudience] = useState("Retail users");
  const [tone, setTone] = useState("clear, natural, and specific");
  const [mode, setMode] = useState<StudioMode>("post");
  const [promptText, setPromptText] = useState("");
  const [draft, setDraft] = useState<Draft>({
    headline: "Nothing generated yet.",
    paragraph1: "Set the topic, review the prompt, then press Generate.",
    paragraph2: "",
    paragraph3: "",
  });
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [lastResolvedCommand, setLastResolvedCommand] = useState("");
  const [regenerateVersion, setRegenerateVersion] = useState(0);
  const [topicInitialized, setTopicInitialized] = useState(false);

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await fetch("/api/radar", {
          cache: "no-store",
        });
        const json: RadarResponse = await res.json();
        setRadarData(json);
      } catch {
        setRadarData({
          updatedAt: new Date().toISOString(),
          narratives: [],
          error: "Failed to load radar context.",
        });
      }
    }

    loadRadar();
  }, []);

  useEffect(() => {
    if (topicInitialized) return;

    const initialTopic =
      normalizeTopic(searchParams.get("topic") || searchParams.get("q") || "") ||
      normalizeTopic(sharedTopicFromStorage()) ||
      normalizeTopic(radarData?.narratives?.[0]?.key) ||
      "AI";

    setTopic(initialTopic);
    setPromptText(buildDefaultPrompt(mode, initialTopic, audience));
    setTopicInitialized(true);
  }, [searchParams, radarData, topicInitialized, mode, audience]);

  const activeNarrative = useMemo(() => {
    const effectiveTopic = inferTopicFromPrompt(promptText, topic);
    const narratives = radarData?.narratives ?? [];
    return (
      narratives.find(
        (item) => item.key.toLowerCase() === effectiveTopic.toLowerCase()
      ) || narratives[0]
    );
  }, [radarData, topic, promptText]);

  function saveTopicContext(nextTopic: string) {
    try {
      localStorage.setItem(
        SHARED_CONTEXT_KEY,
        JSON.stringify({
          topic: nextTopic,
          narrative: nextTopic,
        })
      );
    } catch {}
  }

  async function runStudio(prompt: string, version: number) {
    setRunning(true);

    const effectiveTopic = inferTopicFromPrompt(prompt, topic);

    try {
      const res = await fetch("/api/openclaw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            mode === "post"
              ? `/studio post about ${effectiveTopic}`
              : `/studio thread about ${effectiveTopic}`,
          sessionId: STUDIO_SESSION_ID,
          studioPrompt: prompt,
          studioMode: mode,
          regenerateVersion: version,
          studioTopic: effectiveTopic,
        }),
      });

      const data: OpenClawApiResponse = await res.json();

      if (!data.ok || !data.result) {
        throw new Error(data.error || "Studio generation failed.");
      }

      setTopic(effectiveTopic);
      setDraft(draftFromResult(data.result));
      setLastResolvedCommand(data.effectiveCommand || "studio");
      saveTopicContext(effectiveTopic);
    } catch {
      setDraft({
        headline: "Studio could not generate the draft.",
        paragraph1: "The request reached the app, but the output did not complete correctly.",
        paragraph2: "Check the OpenClaw API response and make sure the studio executor is returning valid output.",
        paragraph3: "",
      });
    } finally {
      setRunning(false);
    }
  }

  function handleGenerate() {
    setRegenerateVersion(0);
    runStudio(promptText, 0);
  }

  function handleRegenerate() {
    const nextVersion = regenerateVersion + 1;
    setRegenerateVersion(nextVersion);
    runStudio(promptText, nextVersion);
  }

  async function handleCopy() {
    const text = [
      draft.headline,
      "",
      draft.paragraph1,
      "",
      draft.paragraph2,
      "",
      draft.paragraph3,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function openBinanceSquare() {
    window.open("https://square.binance.com/", "_blank", "noopener,noreferrer");
  }

  function openXComposer() {
    const text = [
      draft.headline,
      "",
      draft.paragraph1,
      "",
      draft.paragraph2,
      "",
      draft.paragraph3,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[120px] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
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

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Studio
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            Turn market context into publish-ready content
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            Write the prompt the way you want the output to sound, then press Generate.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] border border-border bg-card/90 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Setup
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  One prompt, one clean workflow
                </h2>
              </div>

              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                OpenClaw
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ControlCard
                label="Topic"
                value={topic}
                active
                onClick={() => {
                  const next = window.prompt("Set topic", topic);
                  if (next) {
                    const normalized = normalizeTopic(next);
                    setTopic(normalized);
                    setPromptText(buildDefaultPrompt(mode, normalized, audience));
                    saveTopicContext(normalized);
                  }
                }}
              />
              <ControlCard
                label="Audience"
                value={audience}
                onClick={() => {
                  const next = window.prompt("Set audience", audience);
                  if (next) {
                    setAudience(next.trim());
                  }
                }}
              />
              <ControlCard
                label="Tone"
                value={tone}
                onClick={() => {
                  const next = window.prompt("Set tone", tone);
                  if (next) setTone(next.trim());
                }}
              />
              <ControlCard
                label="Format"
                value={mode === "post" ? "Binance Square" : "X Thread"}
                onClick={() => {
                  const next = window.prompt("Set format: post | thread", mode) as
                    | StudioMode
                    | null;

                  if (next === "post" || next === "thread") {
                    setMode(next);
                  }
                }}
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Prompt
              </div>

              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[220px] w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-4 text-sm leading-7 text-muted-foreground outline-none transition focus:border-primary/30"
                placeholder="Example: Write a post about why meme coins are gaining attention again and what is driving the move."
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["post", "thread"] as StudioMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    mode === item
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background/60 text-muted-foreground hover:border-primary/25 hover:text-foreground"
                  }`}
                >
                  {modeLabel(item)}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {running ? "Generating..." : `Generate ${modeLabel(mode)}`}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" />
                Regenerate
              </button>
            </div>

            {activeNarrative ? (
              <div className="mt-5 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                Live context: {activeNarrative.key} · {formatMomentum(activeNarrative.avg_change_24h)} · confidence {activeNarrative.confidence}
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-border bg-card/90 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Output
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Draft preview
                </h2>
              </div>

              <div className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                {lastResolvedCommand || "Not generated yet"}
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-background/60 p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-primary">
                {mode === "post" ? "BINANCE SQUARE DRAFT" : "X THREAD DRAFT"}
              </div>

              <div className="mt-4 space-y-5 text-sm leading-7 text-muted-foreground">
                <p className="text-xl font-semibold leading-9 text-foreground">
                  {draft.headline}
                </p>
                {draft.paragraph1 ? <p>{draft.paragraph1}</p> : null}
                {draft.paragraph2 ? <p>{draft.paragraph2}</p> : null}
                {draft.paragraph3 ? <p>{draft.paragraph3}</p> : null}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy Draft"}
              </button>

              <button
                type="button"
                onClick={openBinanceSquare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Open Binance Square
              </button>

              <button
                type="button"
                onClick={openXComposer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Open X Composer
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/console?q=${encodeURIComponent(`/learn ${topic}`)}`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Open in Console
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StudioPageFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pt-32">
        <div className="rounded-[28px] border border-border bg-card/90 p-6 text-sm text-muted-foreground">
          Loading studio...
        </div>
      </section>
    </main>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioPageFallback />}>
      <StudioPageContent />
    </Suspense>
  );
}