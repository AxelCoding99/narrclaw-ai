export type OpenClawIntent =
  | "radar_query"
  | "narrative_compare"
  | "learning"
  | "strategy"
  | "studio"
  | "followup"
  | "unknown";

export type OpenClawContext = {
  lastIntent?: string;
  lastAgent?: string;
  lastTopic?: string;
  lastNarrative?: string;
  lastUserMessage?: string;
  lastAssistantSummary?: string;
};

export type OpenClawRequest = {
  command: string;
  context?: OpenClawContext;
};

export type OpenClawRoute = {
  intent: OpenClawIntent;
  agent:
    | "RadarAgent"
    | "CompareAgent"
    | "LearningAgent"
    | "StrategyAgent"
    | "StudioAgent"
    | "ReasoningAgent";
  args?: {
    narrative?: string;
    left?: string;
    right?: string;
    topic?: string;
    followupType?:
      | "post"
      | "thread"
      | "simplify"
      | "shorten"
      | "professional"
      | "risk"
      | "invalidation"
      | "summary";
    sourceTopic?: string;
    sourceIntent?: string;
  };
};

const NARRATIVE_ALIASES: Array<{ patterns: string[]; value: string }> = [
  { patterns: ["ai"], value: "AI" },
  { patterns: ["rwa"], value: "RWA" },
  { patterns: ["depin"], value: "DePIN" },
  { patterns: ["defi"], value: "DeFi" },
  { patterns: ["layer 1", "layer1", "l1"], value: "Layer 1" },
  { patterns: ["layer 2", "layer2", "l2"], value: "Layer 2" },
  { patterns: ["gaming", "gamefi"], value: "Gaming" },
  { patterns: ["meme", "memes", "memecoin", "memecoins"], value: "Memes" },
  { patterns: ["infrastructure", "infra"], value: "Infrastructure" },
  { patterns: ["stablecoin", "stablecoins"], value: "Stablecoin Infrastructure" },
];

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeNarrativeName(input: string): string {
  const value = normalizeWhitespace(input).toLowerCase();

  for (const alias of NARRATIVE_ALIASES) {
    if (alias.patterns.includes(value)) {
      return alias.value;
    }
  }

  return normalizeWhitespace(input);
}

function normalizeTopic(input: string) {
  return normalizeWhitespace(input);
}

function extractNarrativesFromText(raw: string): string[] {
  const lower = ` ${raw.toLowerCase()} `;
  const found = new Set<string>();

  for (const alias of NARRATIVE_ALIASES) {
    for (const pattern of alias.patterns) {
      if (lower.includes(` ${pattern} `)) {
        found.add(alias.value);
      }
    }
  }

  return Array.from(found);
}

function containsAny(raw: string, keywords: string[]) {
  const lower = raw.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function startsWithAny(raw: string, prefixes: string[]) {
  const lower = raw.toLowerCase().trim();
  return prefixes.some((prefix) => lower.startsWith(prefix));
}

function looksLikeComparison(raw: string) {
  return containsAny(raw, [
    "compare ",
    " vs ",
    " versus ",
    "which is stronger",
    "which is better",
    "who wins",
    "difference between",
    "compare them",
    "compare it with",
    "compare this with",
    "how does ",
  ]);
}

function extractComparisonSides(
  raw: string
): { left?: string; right?: string } {
  const directVs = raw.match(/compare\s+(.+?)\s+vs\s+(.+)/i);
  if (directVs) {
    return {
      left: normalizeNarrativeName(directVs[1].trim()),
      right: normalizeNarrativeName(directVs[2].trim()),
    };
  }

  const directVersus = raw.match(/compare\s+(.+?)\s+versus\s+(.+)/i);
  if (directVersus) {
    return {
      left: normalizeNarrativeName(directVersus[1].trim()),
      right: normalizeNarrativeName(directVersus[2].trim()),
    };
  }

  const diffBetween = raw.match(/difference between\s+(.+?)\s+and\s+(.+)/i);
  if (diffBetween) {
    return {
      left: normalizeNarrativeName(diffBetween[1].trim()),
      right: normalizeNarrativeName(diffBetween[2].trim()),
    };
  }

  const compareWith = raw.match(/compare\s+(.+?)\s+with\s+(.+)/i);
  if (compareWith) {
    return {
      left: normalizeNarrativeName(compareWith[1].trim()),
      right: normalizeNarrativeName(compareWith[2].trim()),
    };
  }

  const found = extractNarrativesFromText(raw);
  if (found.length >= 2) {
    return {
      left: found[0],
      right: found[1],
    };
  }

  return {};
}

function looksLikeRadarQuestion(raw: string) {
  return containsAny(raw, [
    "top narrative",
    "show top narrative",
    "what narrative is leading",
    "what is leading right now",
    "which narrative is strongest",
    "which sector is strongest",
    "strongest narrative",
    "second strongest",
    "second narrative",
    "radar",
    "momentum",
    "rotation",
    "leading narrative",
    "top sector",
    "narrative ranking",
    "best breadth",
    "overheated",
    "building quietly",
    "losing attention",
    "top theme",
    "leading sector",
  ]);
}

function looksLikeLearningQuestion(raw: string) {
  return containsAny(raw, [
    "what is ",
    "what does ",
    "explain ",
    "help me understand",
    "in simple terms",
    "simple version",
    "for beginners",
    "beginner version",
    "explain this",
    "i don't understand",
    "still don't understand",
    "give me an example",
    "why does this matter",
    "summarize",
    "summary",
    "tldr",
    "briefly explain",
    "why is ",
    "why are ",
    "why did ",
    "why does ",
    "what is driving",
    "what drives ",
    "what changed in ",
    "what changed with ",
    "why is it moving",
    "why is it weakening",
    "why is it strong",
    "why is it weak",
    "why is this narrative",
    "what makes ",
    "what weakens ",
    "what confirms ",
    "what invalidates ",
    "what should i watch",
    "what to watch next",
    "what matters next",
    "what do people misunderstand",
    "common misconception",
    "misconception",
    "what do beginners get wrong",
    "which assets represent",
    "what coins represent",
    "represent this narrative",
    "how do i think about",
    "how should i think about",
    "how do i evaluate",
    "how do i separate hype",
    "what is sector rotation",
    "why does capital rotate",
    "narrative rotation",
    "how do narratives start",
    "how do narratives fade",
    "how do narratives become strong",
    "when does a narrative become crowded",
    "explain like i'm a beginner",
    "explain like i’m a beginner",
    "plain english",
    "relevant now",
    "matter now",
    "gaining attention",
    "weakening",
    "under pressure",
    "underperforming",
  ]);
}

function looksLikeStrategyQuestion(raw: string) {
  return containsAny(raw, [
    "strategy",
    "setup",
    "entry",
    "entries",
    "target",
    "targets",
    "risk",
    "invalidation",
    "trigger",
    "time horizon",
    "plan",
    "trading plan",
    "execution plan",
    "what should i do",
    "next move",
    "more conservative",
    "more aggressive",
    "safer",
    "bias",
  ]);
}

function looksLikeStudioQuestion(raw: string) {
  return containsAny(raw, [
    "thread",
    "tweet",
    "post",
    "content",
    "brief",
    "rewrite",
    "write this",
    "turn this into",
    "make it more professional",
    "make it shorter",
    "make it punchier",
    "x thread",
    "research brief",
    "single tweet",
    "binance square",
  ]);
}

function detectFollowupType(raw: string):
  | "post"
  | "thread"
  | "simplify"
  | "shorten"
  | "professional"
  | "risk"
  | "invalidation"
  | "summary"
  | undefined {
  const lower = raw.toLowerCase();

  if (
    lower.includes("turn this into a post") ||
    lower.includes("turn it into a post") ||
    lower.includes("make a post") ||
    lower.includes("write a post")
  ) {
    return "post";
  }

  if (
    lower.includes("turn this into a thread") ||
    lower.includes("turn it into a thread") ||
    lower.includes("make a thread") ||
    lower.includes("write a thread")
  ) {
    return "thread";
  }

  if (
    lower.includes("simplify this") ||
    lower.includes("make it simpler") ||
    lower.includes("make this simpler") ||
    lower.includes("explain this simply") ||
    lower.includes("simple version") ||
    lower.includes("for beginners")
  ) {
    return "simplify";
  }

  if (
    lower.includes("make it shorter") ||
    lower.includes("make this shorter") ||
    lower.includes("shorter version")
  ) {
    return "shorten";
  }

  if (
    lower.includes("make it more professional") ||
    lower.includes("professional version") ||
    lower.includes("rewrite this professionally")
  ) {
    return "professional";
  }

  if (
    lower.includes("what is the biggest risk") ||
    lower.includes("what is the risk") ||
    lower.includes("biggest risk")
  ) {
    return "risk";
  }

  if (
    lower.includes("what could invalidate this") ||
    lower.includes("what could invalidate it") ||
    lower.includes("invalidate this")
  ) {
    return "invalidation";
  }

  if (
    lower.includes("summarize this") ||
    lower.includes("summary") ||
    lower.includes("tldr")
  ) {
    return "summary";
  }

  return undefined;
}

function extractTopicAfterPrefix(raw: string, prefix: string) {
  return normalizeTopic(raw.slice(prefix.length).trim());
}

function deriveTopicFromNaturalLanguage(raw: string) {
  const narratives = extractNarrativesFromText(raw);
  if (narratives.length > 0) {
    return narratives[0];
  }

  const cleaned = normalizeWhitespace(
    raw
      .replace(/^what is\s+/i, "")
      .replace(/^what does\s+/i, "")
      .replace(/^explain\s+/i, "")
      .replace(/^summarize\s+/i, "")
      .replace(/^rewrite\s+/i, "")
      .replace(/^why is\s+/i, "")
      .replace(/^why are\s+/i, "")
      .replace(/^why does\s+/i, "")
      .replace(/^why did\s+/i, "")
      .replace(/^what is driving\s+/i, "")
      .replace(/^what drives\s+/i, "")
      .replace(/^what changed in\s+/i, "")
      .replace(/^what changed with\s+/i, "")
      .replace(/^what makes\s+/i, "")
      .replace(/^what weakens\s+/i, "")
      .replace(/^what confirms\s+/i, "")
      .replace(/^what invalidates\s+/i, "")
      .replace(/^what should i watch next in\s+/i, "")
      .replace(/^what should i watch in\s+/i, "")
      .replace(/^what should i watch\s+/i, "")
      .replace(/^what to watch next in\s+/i, "")
      .replace(/^which assets represent\s+/i, "")
      .replace(/^what coins represent\s+/i, "")
      .replace(/^how do i think about\s+/i, "")
      .replace(/^how should i think about\s+/i, "")
      .replace(/^how do i evaluate\s+/i, "")
      .replace(/^how do i separate hype from\s+/i, "")
      .replace(/^make a strategy for\s+/i, "")
      .replace(/^make strategy for\s+/i, "")
      .replace(/^strategy for\s+/i, "")
      .replace(/^turn this into\s+/i, "")
      .replace(/^turn it into\s+/i, "")
      .replace(/^write this as\s+/i, "")
      .replace(/^make a post about\s+/i, "")
      .replace(/^make a thread about\s+/i, "")
      .replace(/^make a brief about\s+/i, "")
      .replace(/^make it more professional\s*/i, "")
      .replace(/^make it shorter\s*/i, "")
      .replace(/^simplify this\s*/i, "")
      .replace(/^explain this simply\s*/i, "")
      .replace(/\bweakening\b/gi, "")
      .replace(/\bgaining attention\b/gi, "")
      .replace(/\brelevant now\b/gi, "")
      .replace(/\bmatter now\b/gi, "")
      .replace(/\bunder pressure\b/gi, "")
      .replace(/\bunderperforming\b/gi, "")
  );

  return cleaned || raw.trim();
}

function buildFollowupRoute(
  raw: string,
  context?: OpenClawContext
): OpenClawRoute | null {
  const followupType = detectFollowupType(raw);

  if (!followupType) return null;

  const sourceTopic =
    context?.lastTopic || context?.lastNarrative || context?.lastAssistantSummary;

  const sourceIntent = context?.lastIntent || "unknown";

  if (!sourceTopic) {
    return {
      intent: "unknown",
      agent: "ReasoningAgent",
      args: {
        topic: raw,
      },
    };
  }

  if (
    followupType === "post" ||
    followupType === "thread" ||
    followupType === "professional" ||
    followupType === "shorten"
  ) {
    return {
      intent: "followup",
      agent: "StudioAgent",
      args: {
        topic: sourceTopic,
        followupType,
        sourceTopic,
        sourceIntent,
      },
    };
  }

  if (followupType === "simplify" || followupType === "summary") {
    return {
      intent: "followup",
      agent: "LearningAgent",
      args: {
        topic: sourceTopic,
        followupType,
        sourceTopic,
        sourceIntent,
      },
    };
  }

  if (followupType === "risk" || followupType === "invalidation") {
    return {
      intent: "followup",
      agent: "StrategyAgent",
      args: {
        topic: sourceTopic,
        followupType,
        sourceTopic,
        sourceIntent,
      },
    };
  }

  return null;
}

export function route(request: OpenClawRequest): OpenClawRoute {
  const raw = request.command.trim();
  const cmd = raw.toLowerCase();
  const context = request.context;

  if (!cmd) {
    return {
      intent: "unknown",
      agent: "ReasoningAgent",
    };
  }

  const followupRoute = buildFollowupRoute(raw, context);
  if (followupRoute) {
    return followupRoute;
  }

  if (
    cmd === "show top narrative" ||
    cmd === "top narrative" ||
    cmd === "/radar" ||
    cmd === "/radar top"
  ) {
    return {
      intent: "radar_query",
      agent: "RadarAgent",
      args: {},
    };
  }

  if (cmd.startsWith("/radar ")) {
    const rawNarrative = raw.slice("/radar".length).trim();

    return {
      intent: "radar_query",
      agent: "RadarAgent",
      args: {
        narrative: rawNarrative
          ? normalizeNarrativeName(rawNarrative)
          : undefined,
      },
    };
  }

  if (cmd.startsWith("/learn")) {
    const topic = extractTopicAfterPrefix(raw, "/learn");

    return {
      intent: "learning",
      agent: "LearningAgent",
      args: {
        topic: topic || undefined,
      },
    };
  }

  if (cmd.startsWith("/strategy")) {
    const topic = extractTopicAfterPrefix(raw, "/strategy");

    return {
      intent: "strategy",
      agent: "StrategyAgent",
      args: {
        topic: topic || undefined,
      },
    };
  }

  if (cmd.startsWith("/studio")) {
    const topic = extractTopicAfterPrefix(raw, "/studio");

    return {
      intent: "studio",
      agent: "StudioAgent",
      args: {
        topic: topic || undefined,
      },
    };
  }

  if (looksLikeComparison(raw)) {
    const { left, right } = extractComparisonSides(raw);

    if (left && right && left !== right) {
      return {
        intent: "narrative_compare",
        agent: "CompareAgent",
        args: {
          left,
          right,
        },
      };
    }
  }

  if (
    startsWithAny(raw, [
      "make a strategy for",
      "make strategy for",
      "strategy for",
    ])
  ) {
    return {
      intent: "strategy",
      agent: "StrategyAgent",
      args: {
        topic: deriveTopicFromNaturalLanguage(raw),
      },
    };
  }

  if (
    startsWithAny(raw, [
      "turn this into",
      "turn it into",
      "rewrite this as",
      "write this as",
      "make a thread about",
      "make a post about",
      "make a brief about",
    ]) ||
    looksLikeStudioQuestion(raw)
  ) {
    return {
      intent: "studio",
      agent: "StudioAgent",
      args: {
        topic: deriveTopicFromNaturalLanguage(raw),
      },
    };
  }

  if (looksLikeStrategyQuestion(raw)) {
    return {
      intent: "strategy",
      agent: "StrategyAgent",
      args: {
        topic: deriveTopicFromNaturalLanguage(raw),
      },
    };
  }

  if (looksLikeRadarQuestion(raw)) {
    const narratives = extractNarrativesFromText(raw);

    return {
      intent: "radar_query",
      agent: "RadarAgent",
      args: {
        narrative: narratives[0],
      },
    };
  }

  if (looksLikeLearningQuestion(raw)) {
    return {
      intent: "learning",
      agent: "LearningAgent",
      args: {
        topic: deriveTopicFromNaturalLanguage(raw),
      },
    };
  }

  return {
    intent: "unknown",
    agent: "ReasoningAgent",
    args: {
      topic: raw,
    },
  };
}