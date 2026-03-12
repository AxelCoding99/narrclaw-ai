"use client";

import Navbar from "../../components/navbar";
import Link from "next/link";
import {
  Blocks,
  BookOpen,
  Brain,
  ChevronRight,
  Cpu,
  Gamepad2,
  GraduationCap,
  Landmark,
  Layers3,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

function normalizeTopic(input: string) {
  const value = input.toLowerCase().trim();

  if (value === "ai") return "AI";
  if (value === "rwa") return "RWA";
  if (value === "depin") return "DePIN";
  if (value === "defi") return "DeFi";
  if (value === "layer2" || value === "layer 2" || value === "l2") return "Layer 2";
  if (value === "layer1" || value === "layer 1" || value === "l1") return "Layer 1";
  if (value === "gaming" || value === "gamefi") return "Gaming";
  if (value === "memes" || value === "meme" || value === "memecoin" || value === "memecoins") {
    return "Memes";
  }
  if (value === "stablecoins" || value === "stablecoin") {
    return "Stablecoin Infrastructure";
  }
  if (value === "infrastructure" || value === "infra") {
    return "Infrastructure";
  }

  return input.trim() || "AI";
}

function parseTopicFromSearch(search: string | null) {
  if (!search) return "AI";
  const trimmed = search.trim();

  if (!trimmed) return "AI";

  if (trimmed.startsWith("/learn")) {
    return normalizeTopic(trimmed.replace("/learn", "").trim() || "AI");
  }

  return normalizeTopic(trimmed);
}

function buildPromptFromTopic(topic: string) {
  const lower = topic.toLowerCase();

  if (topic === "Stablecoin Infrastructure") {
    return "what is stablecoin infrastructure and why does it matter right now";
  }

  return `what is ${lower} and why does it matter right now`;
}

function getNarrativeMap(topic: string) {
  if (topic === "AI") {
    return {
      relatedThemes: "Infrastructure · DePIN · Layer 1",
      comparedWith: "RWA · Memes",
      misconception: "Not every AI token represents the same kind of exposure.",
      confirmation: "broad participation, credible leaders, and ongoing attention",
    };
  }

  if (topic === "RWA") {
    return {
      relatedThemes: "Stablecoin Infrastructure · DeFi",
      comparedWith: "AI · Layer 1",
      misconception: "RWA is not automatically safer just because it sounds institutional.",
      confirmation: "credible asset structure, trust, and sustained capital interest",
    };
  }

  if (topic === "DePIN") {
    return {
      relatedThemes: "AI · Infrastructure",
      comparedWith: "Layer 1 · Gaming",
      misconception: "Real-world utility does not automatically mean strong narrative quality.",
      confirmation: "credible infrastructure story and broader market participation",
    };
  }

  if (topic === "Gaming") {
    return {
      relatedThemes: "Memes · Layer 2",
      comparedWith: "AI · DeFi",
      misconception: "Gaming narratives are not always backed by durable product activity.",
      confirmation: "ecosystem energy, user attention, and believable continuation",
    };
  }

  if (topic === "Layer 2") {
    return {
      relatedThemes: "Layer 1 · Infrastructure",
      comparedWith: "DeFi · Gaming",
      misconception: "Not every Layer 2 has the same ecosystem strength or user gravity.",
      confirmation: "developer activity, ecosystem usage, and liquidity retention",
    };
  }

  if (topic === "Layer 1") {
    return {
      relatedThemes: "Infrastructure · Layer 2",
      comparedWith: "AI · RWA",
      misconception: "A Layer 1 move does not always mean the whole sector is strong.",
      confirmation: "developer pull, user gravity, liquidity, and ecosystem breadth",
    };
  }

  if (topic === "Memes") {
    return {
      relatedThemes: "Gaming · Community narratives",
      comparedWith: "AI · RWA",
      misconception: "Meme strength is not random; attention flow still has structure.",
      confirmation: "broad social attention and continued momentum quality",
    };
  }

  if (topic === "Infrastructure") {
    return {
      relatedThemes: "AI · DePIN · Layer 1",
      comparedWith: "Memes · Gaming",
      misconception: "Infrastructure is not always boring or slow-moving in market terms.",
      confirmation: "clear utility, ecosystem relevance, and stronger market prioritization",
    };
  }

  return {
    relatedThemes: "AI · RWA · DePIN",
    comparedWith: "Layer 1 · Gaming",
    misconception: "Narratives often group very different assets under one label.",
    confirmation: "clear leadership, follow-through, and market attention",
  };
}

function getCommonMisconceptions(topic: string) {
  if (topic === "AI") {
    return [
      "AI does not mean every token in the category has the same role or quality.",
      "A strong AI narrative can still be narrow if only a few names are actually leading.",
    ];
  }

  if (topic === "RWA") {
    return [
      "Institutional language does not automatically make an RWA project safer or stronger.",
      "Tokenization alone is not enough; the underlying structure still matters.",
    ];
  }

  if (topic === "DePIN") {
    return [
      "Real-world infrastructure sounds strong, but the market still needs believable execution.",
      "Utility and narrative strength are related, but they are not the same thing.",
    ];
  }

  if (topic === "Layer 1") {
    return [
      "A move in one chain does not always mean the full Layer 1 sector is breaking out.",
      "Ecosystem quality matters more than the label itself.",
    ];
  }

  if (topic === "Layer 2") {
    return [
      "Not all scaling solutions carry the same user activity or ecosystem importance.",
      "A Layer 2 story can weaken quickly if adoption does not support the narrative.",
    ];
  }

  if (topic === "Gaming") {
    return [
      "Gaming narratives often return before sustainable user traction actually appears.",
      "Excitement around a category is not the same as durable ecosystem strength.",
    ];
  }

  if (topic === "Memes") {
    return [
      "Meme narratives are not pure randomness; they still follow attention and participation dynamics.",
      "High velocity does not guarantee durable upside.",
    ];
  }

  return [
    `Not every asset labeled ${topic} represents the same type of opportunity.`,
    "Strong narratives usually emerge when multiple signals align, not from price alone.",
  ];
}

function TopicCard({
  title,
  description,
  icon,
  active = false,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-[28px] border p-6 text-left transition-all duration-300 ${
        active
          ? "border-primary/35 bg-primary/7 shadow-[0_0_36px_rgba(252,213,53,0.10)]"
          : "border-border bg-card/85 hover:border-primary/20 hover:shadow-[0_0_24px_rgba(252,213,53,0.05)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div
        className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl border text-primary ${
          active
            ? "border-primary/30 bg-primary/15"
            : "border-primary/20 bg-primary/10"
        }`}
      >
        {icon}
      </div>

      <div className="relative z-10 mt-5 text-2xl font-semibold text-foreground">
        {title}
      </div>

      <p className="relative z-10 mt-4 text-sm leading-8 text-muted-foreground">
        {description}
      </p>
    </motion.button>
  );
}

function ModuleCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-border bg-background/60 p-6 transition hover:border-primary/25">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="relative z-10 mt-4 text-lg font-semibold text-foreground">
        {title}
      </div>

      <p className="relative z-10 mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PathRow({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <span>{text}</span>
      <ChevronRight className="h-4 w-4" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-4 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
      >
        {content}
      </Link>
    );
  }

  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-4 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
      {content}
    </button>
  );
}

function InsightCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-background/60 p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export default function LearningPage() {
  const [topic, setTopic] = useState("AI");
  const [inputValue, setInputValue] = useState("what is ai and why does it matter right now");
  const [running, setRunning] = useState(false);
  const [learningSummary, setLearningSummary] =
    useState<OpenClawApiResponse["result"] | null>(null);

  const explanationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const nextTopic = parseTopicFromSearch(q);
    setTopic(nextTopic);
    setInputValue(buildPromptFromTopic(nextTopic));
  }, []);

  function scrollToExplanation() {
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function selectTopic(nextTopic: string) {
    const normalized = normalizeTopic(nextTopic);
    setTopic(normalized);
    setInputValue(buildPromptFromTopic(normalized));
    scrollToExplanation();
  }

  async function generateLearning() {
    const lower = inputValue.toLowerCase().trim();
    const nextTopic =
      lower.includes("ai")
        ? "AI"
        : lower.includes("rwa")
        ? "RWA"
        : lower.includes("depin")
        ? "DePIN"
        : lower.includes("defi")
        ? "DeFi"
        : lower.includes("layer 2") || lower.includes("layer2") || lower.includes("l2")
        ? "Layer 2"
        : lower.includes("layer 1") || lower.includes("layer1") || lower.includes("l1")
        ? "Layer 1"
        : lower.includes("gaming") || lower.includes("gamefi")
        ? "Gaming"
        : lower.includes("meme") || lower.includes("memecoin")
        ? "Memes"
        : lower.includes("stablecoin")
        ? "Stablecoin Infrastructure"
        : lower.includes("infra") || lower.includes("infrastructure")
        ? "Infrastructure"
        : topic;

    setTopic(nextTopic);
    setRunning(true);

    try {
      const res = await fetch("/api/openclaw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: "learning-page-session",
        }),
      });

      const data: OpenClawApiResponse = await res.json();

      if (data.ok && data.result) {
        setLearningSummary(data.result);
      } else {
        setLearningSummary({
          ok: false,
          route: {
            intent: "learning",
            agent: "LearningAgent",
          },
          state: "Execution Error",
          summary: data.error || "Learning explanation could not be generated.",
          reasoning1:
            "The learning route was triggered but no valid result was returned.",
          reasoning2: "Check the API response and OpenClaw execution flow.",
          reasoning3: "UI is ready, but backend execution did not complete.",
          stream: [],
        });
      }
    } catch (error) {
      console.error("LEARNING_PAGE_OPENCLAW_ERROR", error);
      setLearningSummary({
        ok: false,
        route: {
          intent: "learning",
          agent: "LearningAgent",
        },
        state: "Execution Error",
        summary: "Learning explanation failed unexpectedly.",
        reasoning1: "The page reached OpenClaw but execution failed.",
        reasoning2: "Check browser console and API route.",
        reasoning3: "The learning workspace is ready, but the response failed.",
        stream: [],
      });
    } finally {
      setRunning(false);
      scrollToExplanation();
    }
  }

  const exampleExplanation = useMemo(() => {
    if (!learningSummary) return null;

    return {
      summary: learningSummary.summary,
      reasoning1: learningSummary.reasoning1,
      reasoning2: learningSummary.reasoning2,
      reasoning3: learningSummary.reasoning3,
    };
  }, [learningSummary]);

  const narrativeMap = useMemo(() => getNarrativeMap(topic), [topic]);
  const misconceptions = useMemo(() => getCommonMisconceptions(topic), [topic]);

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

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Learning Atlas
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
              Understand why crypto narratives move the market
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Learning Atlas helps you understand why narratives like AI, RWA,
              DePIN, or Gaming gain attention in crypto markets. Instead of
              static definitions, NarrAI explains how narratives form, how
              capital flows through them, and what signals make them stronger or
              weaker.
            </p>
          </div>

          <div className="rounded-[28px] border border-border bg-card/80 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Learning mode
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Contextual narrative learning
                </h2>
              </div>

              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Active
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Level</div>
                <div className="mt-2 text-lg font-semibold text-foreground">
                  Beginner+
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Focus</div>
                <div className="mt-2 text-lg font-semibold text-foreground">
                  Narratives
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Selected</div>
                <div className="mt-2 text-lg font-semibold text-primary">
                  {topic}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Topic explorer
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Learn by sector and narrative theme
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <TopicCard
              title="AI Narrative"
              description="Understand why AI narratives attract capital, what makes the category different from generic hype, and how to interpret leadership inside the theme."
              icon={<Cpu className="h-5 w-5" />}
              active={topic === "AI"}
              onClick={() => selectTopic("AI")}
            />
            <TopicCard
              title="Real World Assets"
              description="Explore tokenization narratives, institutional relevance, and why RWA often returns when markets look for more structured stories."
              icon={<Landmark className="h-5 w-5" />}
              active={topic === "RWA"}
              onClick={() => selectTopic("RWA")}
            />
            <TopicCard
              title="DePIN"
              description="Learn how decentralized physical infrastructure narratives connect crypto incentives with real-world networks and why that matters."
              icon={<Blocks className="h-5 w-5" />}
              active={topic === "DePIN"}
              onClick={() => selectTopic("DePIN")}
            />
            <TopicCard
              title="Gaming"
              description="Why gaming narratives periodically reappear, what makes them believable, and how to separate ecosystem strength from temporary attention."
              icon={<Gamepad2 className="h-5 w-5" />}
              active={topic === "Gaming"}
              onClick={() => selectTopic("Gaming")}
            />
            <TopicCard
              title="Layer 2"
              description="See how scalability narratives shape ecosystem growth, developer migration, and the market's view of Ethereum-adjacent infrastructure."
              icon={<Layers3 className="h-5 w-5" />}
              active={topic === "Layer 2"}
              onClick={() => selectTopic("Layer 2")}
            />
            <TopicCard
              title="Stablecoin Infrastructure"
              description="Understand why stablecoins are one of the most important structural layers in crypto and why they matter beyond simple payments."
              icon={<BookOpen className="h-5 w-5" />}
              active={topic === "Stablecoin Infrastructure"}
              onClick={() => selectTopic("Stablecoin Infrastructure")}
            />
          </div>
        </div>

        <div
          ref={explanationRef}
          className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]"
        >
          <div className="rounded-[32px] border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl md:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Narrative explainer
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Ask NarrAI to explain anything
                </h2>
              </div>

              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                OpenClaw
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-background/60 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Wand2 className="h-4 w-4 text-primary" />
                Prompt
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 rounded-2xl border border-border bg-card/70 px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="why is ai gaining attention right now"
                />

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateLearning}
                  disabled={running}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Explaining
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Explain
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setInputValue(`why is ${topic.toLowerCase()} gaining attention right now`)
                  }
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
                  Why is it moving?
                </button>
                <button
                  onClick={() =>
                    setInputValue(`why is ${topic.toLowerCase()} weakening right now`)
                  }
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  <TrendingDown className="mr-1 inline h-3.5 w-3.5" />
                  Why is it weakening?
                </button>
                <button
                  onClick={() =>
                    setInputValue(`what drives the ${topic.toLowerCase()} narrative`)
                  }
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  What drives this narrative?
                </button>
                <button
                  onClick={() =>
                    setInputValue(`explain ${topic.toLowerCase()} for beginners`)
                  }
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Beginner mode
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-border bg-background/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Brain className="h-4 w-4 text-primary" />
                Main explanation
              </div>

              {!exampleExplanation ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 p-5 text-sm text-muted-foreground">
                  Pick a topic above, then press{" "}
                  <span className="text-foreground">Explain</span>. This area
                  becomes your main learning view and updates based on the exact
                  question you ask.
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={exampleExplanation.summary}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-3 text-sm leading-7 text-muted-foreground"
                  >
                    <p>{exampleExplanation.summary}</p>
                    <p>{exampleExplanation.reasoning1}</p>
                    <p>{exampleExplanation.reasoning2}</p>
                    <p>{exampleExplanation.reasoning3}</p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/console?q=${encodeURIComponent(topic)}`}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                Analyze deeper
              </Link>

              <Link
                href={`/strategy?q=${encodeURIComponent(topic)}`}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                Strategy view
              </Link>

              <Link
                href={`/studio?q=${encodeURIComponent(topic)}`}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                Turn into content
              </Link>

              <Link
                href={`/radar`}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                Open radar
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Market context
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Why it matters now
                </h2>
              </div>

              <InsightCard title="Current importance">
                <p>
                  Narratives like <span className="text-foreground">{topic}</span>{" "}
                  tend to gain attention when capital, attention, and developer
                  activity begin aligning around a specific theme.
                </p>
                <p className="mt-3">
                  In crypto markets, narratives often move before fundamentals
                  are fully visible. Understanding the structure behind a
                  narrative helps users interpret whether the move reflects real
                  momentum or short-term speculation.
                </p>
              </InsightCard>
            </div>

            <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Narrative map
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  How this theme connects
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-xs text-muted-foreground">Related themes</div>
                  <div className="mt-2 text-sm leading-7 text-foreground">
                    {narrativeMap.relatedThemes}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-xs text-muted-foreground">Often compared with</div>
                  <div className="mt-2 text-sm leading-7 text-foreground">
                    {narrativeMap.comparedWith}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-xs text-muted-foreground">Common mistake</div>
                  <div className="mt-2 text-sm leading-7 text-foreground">
                    {narrativeMap.misconception}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-xs text-muted-foreground">What confirms it</div>
                  <div className="mt-2 text-sm leading-7 text-foreground">
                    {narrativeMap.confirmation}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Common misconceptions
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  What users often get wrong
                </h2>
              </div>

              <div className="space-y-3">
                {misconceptions.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-background/60 p-4 text-sm leading-7 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Deep dive
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Why narratives drive crypto markets
              </h2>
            </div>

            <div className="rounded-[28px] border border-border bg-background/60 p-5">
              <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>
                  Crypto markets are not driven purely by fundamentals or price
                  charts. Narratives play a major role in shaping where capital
                  flows, how attention moves, and which sectors become dominant
                  in a given period.
                </p>
                <p>
                  NarrAI helps users understand these structures so they can read
                  rotations earlier, interpret context more clearly, and avoid
                  reacting only to noise.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Suggested paths
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                What to learn next
              </h2>
            </div>

            <div className="space-y-3">
              <PathRow
                text="Beginner → Understanding narratives"
                href={`/console?q=${encodeURIComponent(
                  "/learn narratives for beginners"
                )}`}
              />
              <PathRow
                text="Intermediate → Sector rotation analysis"
                href={`/console?q=${encodeURIComponent("/learn sector rotation")}`}
              />
              <PathRow
                text="Advanced → Narrative-driven strategies"
                href={`/console?q=${encodeURIComponent(
                  "/learn narrative driven strategies"
                )}`}
              />
              <PathRow
                text="Creator → Explaining narratives clearly"
                href={`/studio?q=${encodeURIComponent(topic)}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-border bg-card/85 p-6 backdrop-blur-xl md:p-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Learning modules
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Structured paths
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ModuleCard
              title="Crypto Fundamentals"
              description="Understand the basic building blocks of blockchain networks, tokens, and incentives."
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <ModuleCard
              title="Narrative Cycles"
              description="Learn how narratives emerge, accelerate, peak, and fade across market cycles."
              icon={<Lightbulb className="h-5 w-5" />}
            />
            <ModuleCard
              title="Strategy Thinking"
              description="See how traders translate narrative context into structured risk-aware decisions."
              icon={<Target className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>
    </main>
  );
}