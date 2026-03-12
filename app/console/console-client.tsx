"use client";

import Navbar from "../../components/navbar";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  Compass,
  Loader2,
  Send,
  TerminalSquare,
  Wand2,
  Route,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  assets?: RadarAsset[];
  narratives?: NarrativeItem[];
  error?: string;
};

type OpenClawApiResponse = {
  ok: boolean;
  routed?: {
    intent: string;
    agent: string;
    args?: {
      narrative?: string;
      left?: string;
      right?: string;
      topic?: string;
      sourceTopic?: string;
      followupType?:
        | "post"
        | "thread"
        | "simplify"
        | "shorten"
        | "professional"
        | "risk"
        | "invalidation"
        | "summary";
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
  context?: {
    sessionId: string;
    conversationCount: number;
    updatedAt: string;
    lastIntent?: string;
    lastAgent?: string;
    lastTopic?: string;
    lastNarrative?: string;
    lastUserMessage?: string;
    lastAssistantSummary?: string;
    lastCompareLeft?: string;
    lastCompareRight?: string;
    lastResolvedCommand?: string;
  };
  followUpResolved?: boolean;
  assistantMode?: boolean;
  effectiveCommand?: string;
  error?: string;
};

type ConsoleState = {
  intent: string;
  narrative: string;
  mode: string;
  state: string;
  summary: string;
  reasoning1: string;
  reasoning2: string;
  reasoning3: string;
  stream: string[];
};

type ChatEntry =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      content: ConsoleState;
      meta?: {
        followUpResolved?: boolean;
        effectiveCommand?: string;
      };
    };

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function buildThinkingState(command: string): ConsoleState {
  const lower = command.toLowerCase();

  return {
    intent: "Routing",
    narrative: "Processing",
    mode: "OpenClaw",
    state: "Thinking",
    summary: "OpenClaw is thinking through your request.",
    reasoning1: "Understanding your message and checking recent session context.",
    reasoning2:
      "Selecting the best mode across Radar, Learning, Strategy, Studio, or comparison.",
    reasoning3:
      "Preparing a response that stays connected to the topic you were discussing before.",
    stream: [
      "> initialize openclaw...",
      "Reading user message...",
      "Checking recent context...",
      lower.startsWith("/radar")
        ? "Opening radar mode..."
        : lower.startsWith("/strategy")
        ? "Opening strategy mode..."
        : lower.startsWith("/learn")
        ? "Opening learning mode..."
        : lower.startsWith("/studio")
        ? "Opening studio mode..."
        : lower.includes("compare")
        ? "Opening comparison mode..."
        : "Inferring best assistant mode...",
      "Composing answer...",
    ],
  };
}

function buildErrorState(message: string): ConsoleState {
  return {
    intent: "unknown",
    narrative: "OpenClaw",
    mode: "Assistant",
    state: "Execution Error",
    summary: message,
    reasoning1: "The request reached the assistant layer but did not complete.",
    reasoning2: "Check API response format and backend connectivity.",
    reasoning3: "The console UI is ready, but the response failed.",
    stream: [
      "> openclaw route ready",
      "Assistant runtime reached",
      "Unhandled execution error",
      "> execution failed",
    ],
  };
}

function getNarrativeLabel(data: OpenClawApiResponse): string {
  return (
    data.routed?.args?.sourceTopic ||
    data.routed?.args?.narrative ||
    data.routed?.args?.topic ||
    (data.routed?.args?.left && data.routed?.args?.right
      ? `${data.routed.args.left} vs ${data.routed.args.right}`
      : undefined) ||
    data.context?.lastTopic ||
    data.context?.lastNarrative ||
    "OpenClaw"
  );
}

function softModeLabel(mode: string) {
  if (mode === "RadarAgent") return "Radar";
  if (mode === "LearningAgent") return "Learning";
  if (mode === "StrategyAgent") return "Strategy";
  if (mode === "StudioAgent") return "Studio";
  if (mode === "CompareAgent") return "Compare";
  return "Assistant";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isNearDuplicate(a: string, b: string) {
  const x = normalizeText(a);
  const y = normalizeText(b);

  if (!x || !y) return false;
  if (x === y) return true;
  if (x.includes(y) || y.includes(x)) return true;

  const xWords = new Set(x.split(" "));
  const yWords = new Set(y.split(" "));
  const overlap = [...xWords].filter((word) => yWords.has(word)).length;
  const ratio = overlap / Math.max(xWords.size, yWords.size);

  return ratio >= 0.72;
}

function getDistinctSupportLines(state: ConsoleState) {
  const base = [
    state.summary,
    state.reasoning1,
    state.reasoning2,
    state.reasoning3,
  ]
    .map((item) => item?.trim())
    .filter(Boolean) as string[];

  const result: string[] = [];

  for (const line of base) {
    if (!result.some((existing) => isNearDuplicate(existing, line))) {
      result.push(line);
    }
  }

  return result.slice(1);
}

function ContextStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-medium ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-auto max-w-[82%] rounded-[22px] border border-primary/20 bg-primary/10 px-4 py-3.5 shadow-[0_10px_30px_rgba(252,213,53,0.06)]"
    >
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-primary">
        You
      </div>
      <p className="text-[15px] leading-7 text-foreground">{text}</p>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[78%] rounded-[24px] border border-border bg-card px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary">
            OpenClaw
          </div>
          <div className="mt-1 text-sm text-foreground">
            Thinking through your request...
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AssistantBubble({
  state,
  meta,
}: {
  state: ConsoleState;
  meta?: {
    followUpResolved?: boolean;
    effectiveCommand?: string;
  };
}) {
  const supportLines = getDistinctSupportLines(state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[90%] rounded-[24px] border border-border bg-card px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-primary">
              OpenClaw
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-primary">
              {softModeLabel(state.mode)}
            </span>
            {meta?.followUpResolved ? (
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Follow-up
              </span>
            ) : null}
          </div>

          <div className="mt-2 text-[17px] font-semibold leading-8 text-foreground">
            {state.summary}
          </div>
        </div>
      </div>

      {supportLines.length > 0 ? (
        <div className="space-y-3 text-sm leading-7 text-muted-foreground">
          {supportLines.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      ) : null}

      {meta?.effectiveCommand ? (
        <div className="mt-4 rounded-2xl border border-border bg-background/45 px-3 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Resolved command:</span>{" "}
          {meta.effectiveCommand}
        </div>
      ) : null}
    </motion.div>
  );
}

function WorkspaceCard({
  state,
  runningCommand,
}: {
  state: ConsoleState;
  runningCommand: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-card/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Assistant workspace
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
            Active state
          </h2>
        </div>

        <div className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
          {runningCommand ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking
            </span>
          ) : (
            softModeLabel(state.mode)
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary/80">
            <Route className="h-3.5 w-3.5" />
            Route
          </div>
          <div className="text-sm leading-7 text-foreground">
            {state.intent} · {softModeLabel(state.mode)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/45 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Focus
          </div>
          <div className="text-sm leading-7 text-foreground">
            {state.narrative || "OpenClaw"}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/45 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Status
          </div>
          <div className="text-sm leading-7 text-foreground">{state.state}</div>
        </div>
      </div>
    </div>
  );
}

export default function ConsoleClient() {
  const searchParams = useSearchParams();
  const initialCommand = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(initialCommand);
  const [activeCommand, setActiveCommand] = useState("");
  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [runningCommand, setRunningCommand] = useState(false);
  const [activeState, setActiveState] = useState<ConsoleState | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [sessionInfo, setSessionInfo] =
    useState<OpenClawApiResponse["context"] | null>(null);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastExecutedCommandRef = useRef("");
  const sessionIdRef = useRef("console-session-1");

  useEffect(() => {
    async function loadRadarData() {
      try {
        const res = await fetch("/api/radar", {
          cache: "no-store",
        });

        const rawText = await res.text();

        let json: RadarResponse;

        try {
          json = JSON.parse(rawText);
        } catch {
          throw new Error(
            `Radar API did not return JSON. Response starts with: ${rawText.slice(
              0,
              120
            )}`
          );
        }

        setRadarData(json);
      } catch (error) {
        console.error("CONSOLE_RADAR_FETCH_ERROR", error);
        setRadarData({
          updatedAt: new Date().toISOString(),
          assets: [],
          narratives: [],
          error: "Failed to load radar data.",
        });
      } finally {
        setLoadingRadar(false);
      }
    }

    loadRadarData();
    const interval = setInterval(loadRadarData, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory, runningCommand]);

  useEffect(() => {
    let cancelled = false;

    async function runOpenClaw() {
      const clean = activeCommand.trim();

      if (!clean) return;
      if (clean === lastExecutedCommandRef.current) return;

      lastExecutedCommandRef.current = clean;

      const thinkingState = buildThinkingState(clean);

      setRunningCommand(true);
      setActiveState(thinkingState);

      setChatHistory((prev) => {
        const next = [...prev];
        next.push({
          id: makeId("user"),
          role: "user",
          content: clean,
        });
        next.push({
          id: makeId("assistant-thinking"),
          role: "assistant",
          content: thinkingState,
        });
        return next;
      });

      try {
        const res = await fetch("/api/openclaw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: clean,
            sessionId: sessionIdRef.current,
          }),
        });

        const rawText = await res.text();

        let data: OpenClawApiResponse;

        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `OpenClaw API did not return JSON. Response starts with: ${rawText.slice(
              0,
              120
            )}`
          );
        }

        if (cancelled) return;

        setSessionInfo(data.context || null);

        const nextState: ConsoleState =
          !data.ok || !data.result
            ? buildErrorState(
                data.error || "OpenClaw could not complete the request."
              )
            : {
                intent: data.result.route.intent,
                narrative: getNarrativeLabel(data),
                mode: data.result.route.agent,
                state: data.result.state,
                summary: data.result.summary,
                reasoning1: data.result.reasoning1,
                reasoning2: data.result.reasoning2,
                reasoning3: data.result.reasoning3,
                stream: data.result.stream,
              };

        setActiveState(nextState);

        setChatHistory((prev) => {
          const next = [...prev];
          const lastAssistantIndex = [...next]
            .map((entry, index) => ({ entry, index }))
            .reverse()
            .find(
              (item) =>
                item.entry.role === "assistant" &&
                item.entry.content.state === "Thinking"
            )?.index;

          const assistantEntry: ChatEntry = {
            id: makeId("assistant"),
            role: "assistant",
            content: nextState,
            meta: {
              followUpResolved: data.followUpResolved,
              effectiveCommand: data.effectiveCommand,
            },
          };

          if (lastAssistantIndex !== undefined) {
            next[lastAssistantIndex] = assistantEntry;
          } else {
            next.push(assistantEntry);
          }

          return next;
        });
      } catch (error) {
        if (cancelled) return;

        console.error("OPENCLAW_CONSOLE_ERROR", error);

        const errorState = buildErrorState(
          "OpenClaw execution failed inside Console."
        );

        setActiveState(errorState);

        setChatHistory((prev) => {
          const next = [...prev];
          const lastAssistantIndex = [...next]
            .map((entry, index) => ({ entry, index }))
            .reverse()
            .find(
              (item) =>
                item.entry.role === "assistant" &&
                item.entry.content.state === "Thinking"
            )?.index;

          const assistantEntry: ChatEntry = {
            id: makeId("assistant"),
            role: "assistant",
            content: errorState,
          };

          if (lastAssistantIndex !== undefined) {
            next[lastAssistantIndex] = assistantEntry;
          } else {
            next.push(assistantEntry);
          }

          return next;
        });
      } finally {
        if (!cancelled) {
          setRunningCommand(false);
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }
      }
    }

    runOpenClaw();

    return () => {
      cancelled = true;
    };
  }, [activeCommand]);

  const narratives = radarData?.narratives ?? [];
  const assets = radarData?.assets ?? [];

  const fallbackState = useMemo<ConsoleState>(() => {
    if (loadingRadar) {
      return {
        intent: "loading",
        narrative: "Loading",
        mode: "Live Data",
        state: "Fetching Radar Data",
        summary: "Console is loading live radar data.",
        reasoning1: "NarrAI is connecting to the radar backend.",
        reasoning2: "Grouped narrative data is being prepared.",
        reasoning3:
          "Once ready, OpenClaw can execute requests using live context.",
        stream: [
          "> initialize console...",
          "Connecting to /api/radar ...",
          "Loading narrative feed...",
          "> waiting for live radar data",
        ],
      };
    }

    if (radarData?.error) {
      return {
        intent: "error",
        narrative: "Unavailable",
        mode: "Fallback",
        state: "Radar Backend Error",
        summary: "Console could not read radar data from the backend.",
        reasoning1: "The radar API returned an error.",
        reasoning2:
          "OpenClaw needs radar context for live narrative reasoning.",
        reasoning3: "Fix /api/radar to restore full assistant output.",
        stream: [
          "> initialize console...",
          "Connecting to /api/radar ...",
          "Backend response: error",
          "> unable to continue with live market data",
        ],
      };
    }

    return {
      intent: "idle",
      narrative: narratives[0]?.key || "N/A",
      mode: "Assistant",
      state: "Ready",
      summary: "OpenClaw is ready.",
      reasoning1:
        "You can ask about radar, strategy, learning, content, or continue the previous topic naturally.",
      reasoning2:
        "The assistant will keep session context so follow-up questions stay connected.",
      reasoning3:
        "You do not need to repeat the topic every time if the next message is clearly related to the last one.",
      stream: [
        "> initialize console...",
        "Radar backend connected",
        `Top narrative: ${narratives[0]?.key || "N/A"}`,
        "> assistant ready",
      ],
    };
  }, [loadingRadar, radarData?.error, narratives]);

  const displayedState = activeState ?? fallbackState;

  function updateUrlWithoutJump(clean: string) {
    const url = `/console?q=${encodeURIComponent(clean)}`;
    window.history.replaceState({}, "", url);
  }

  function submitCommand() {
    const clean = inputValue.trim();
    if (!clean || runningCommand) return;

    setInputValue("");
    lastExecutedCommandRef.current = "";
    setActiveCommand(clean);
    updateUrlWithoutJump(clean);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <style jsx global>{`
        .narr-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(252, 213, 53, 0.26) rgba(255, 255, 255, 0.03);
        }

        .narr-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .narr-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 999px;
        }

        .narr-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(252, 213, 53, 0.22);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .narr-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(252, 213, 53, 0.34);
          background-clip: padding-box;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute right-[-120px] top-[120px] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5], y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(234,236,239,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(234,236,239,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-6 pt-24 md:px-6 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[30px] border border-border bg-card/85 p-4 backdrop-blur-xl md:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <TerminalSquare className="h-4 w-4" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary">
                NarrAI Console
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                OpenClaw Assistant
              </h1>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_0.78fr]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-background/45 shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
                <div
                  ref={chatRef}
                  className="narr-scrollbar h-[760px] overflow-y-auto px-4 pb-24 pt-4 md:px-5"
                >
                  {chatHistory.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-xl rounded-[24px] border border-dashed border-border bg-background/40 px-6 py-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="mt-4 text-xl font-semibold text-foreground">
                          Ask anything naturally
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          Tanya apapun. OpenClaw akan menjaga konteks percakapan
                          supaya follow-up seperti “turn this into a post” atau
                          “simplify this” tetap nyambung ke topik sebelumnya.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((entry) =>
                        entry.role === "user" ? (
                          <UserBubble key={entry.id} text={entry.content} />
                        ) : entry.content.state === "Thinking" ? (
                          <ThinkingBubble key={entry.id} />
                        ) : (
                          <AssistantBubble
                            key={entry.id}
                            state={entry.content}
                            meta={entry.meta}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 pb-4 pt-4 backdrop-blur-xl md:px-5">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Ask anything
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <span className="text-sm font-semibold text-primary">
                        {">"}
                      </span>

                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            inputValue.trim() &&
                            !runningCommand
                          ) {
                            e.preventDefault();
                            submitCommand();
                          }
                        }}
                        className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                        placeholder="Ask NarrAI anything..."
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: runningCommand ? 1 : 1.02 }}
                      whileTap={{ scale: runningCommand ? 1 : 0.98 }}
                      disabled={runningCommand || !inputValue.trim()}
                      onClick={submitCommand}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {runningCommand ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {runningCommand ? "Thinking..." : "Send"}
                    </motion.button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "what narrative is leading right now?",
                      "compare ai vs rwa",
                      "make a strategy for depin",
                      "what is ai in simple terms?",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setInputValue(item)}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <WorkspaceCard
                state={displayedState}
                runningCommand={runningCommand}
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-border bg-background/45 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Live context
                    </div>
                    <div className="mt-1 text-xl font-semibold text-foreground">
                      What matters now
                    </div>
                  </div>

                  <Compass className="h-4 w-4 text-primary" />
                </div>

                <div className="space-y-3">
                  <ContextStat
                    label="Current focus"
                    value={displayedState.narrative || "OpenClaw"}
                    accent
                  />
                  <ContextStat
                    label="Assistant mode"
                    value={softModeLabel(displayedState.mode)}
                  />
                  <ContextStat
                    label="Top narrative"
                    value={narratives[0]?.key || "N/A"}
                  />
                  <ContextStat
                    label="Radar"
                    value={
                      loadingRadar
                        ? "Loading"
                        : radarData?.error
                        ? "Error"
                        : "Connected"
                    }
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-border bg-background/45 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Session memory
                    </div>
                    <div className="mt-1 text-xl font-semibold text-foreground">
                      Current context
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>

                <div className="space-y-3">
                  <ContextStat
                    label="Last agent"
                    value={sessionInfo?.lastAgent || "N/A"}
                  />
                  <ContextStat
                    label="Last topic"
                    value={
                      sessionInfo?.lastTopic ||
                      sessionInfo?.lastNarrative ||
                      "N/A"
                    }
                  />
                  <ContextStat
                    label="Turns"
                    value={String(sessionInfo?.conversationCount || 0)}
                  />
                  <ContextStat
                    label="Updated"
                    value={
                      sessionInfo?.updatedAt
                        ? new Date(sessionInfo.updatedAt).toLocaleTimeString()
                        : radarData?.updatedAt
                        ? new Date(radarData.updatedAt).toLocaleTimeString()
                        : "N/A"
                    }
                  />
                  <ContextStat label="Assets" value={String(assets.length)} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}