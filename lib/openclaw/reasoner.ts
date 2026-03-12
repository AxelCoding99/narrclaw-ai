export type OpenClawReasonerResult = {
  intent:
    | "radar_query"
    | "narrative_compare"
    | "learning"
    | "strategy"
    | "studio"
    | "unknown";
  action?:
    | "explain"
    | "simplify"
    | "expand"
    | "compare"
    | "refine"
    | "transform";
  confidence: number;
};

export function reason(command: string): OpenClawReasonerResult {
  const raw = command.trim();
  const lower = raw.toLowerCase();

  if (!lower) {
    return {
      intent: "unknown",
      confidence: 0.1,
    };
  }

  if (
    lower.startsWith("compare ") ||
    lower.includes(" vs ") ||
    lower.includes(" versus ") ||
    lower.includes("which is stronger") ||
    lower.includes("which is better")
  ) {
    return {
      intent: "narrative_compare",
      action: "compare",
      confidence: 0.95,
    };
  }

  if (
    lower.startsWith("/radar") ||
    lower === "show top narrative" ||
    lower === "top narrative" ||
    lower.includes("top narrative") ||
    lower.includes("what narrative is leading") ||
    lower.includes("what is leading") ||
    lower.includes("sector strength") ||
    lower.includes("momentum")
  ) {
    return {
      intent: "radar_query",
      action: "explain",
      confidence: 0.9,
    };
  }

  if (
    lower.startsWith("/learn") ||
    lower.includes("what is") ||
    lower.includes("explain") ||
    lower.includes("help me understand") ||
    lower.includes("for beginners") ||
    lower.includes("simple terms")
  ) {
    return {
      intent: "learning",
      action: lower.includes("simple") ? "simplify" : "explain",
      confidence: 0.88,
    };
  }

  if (
    lower.startsWith("/strategy") ||
    lower.includes("strategy") ||
    lower.includes("setup") ||
    lower.includes("entry") ||
    lower.includes("target") ||
    lower.includes("risk") ||
    lower.includes("invalidation") ||
    lower.includes("more conservative") ||
    lower.includes("more aggressive") ||
    lower.includes("refine")
  ) {
    return {
      intent: "strategy",
      action: lower.includes("refine") || lower.includes("more conservative")
        ? "refine"
        : "explain",
      confidence: 0.9,
    };
  }

  if (
    lower.startsWith("/studio") ||
    lower.includes("thread") ||
    lower.includes("post") ||
    lower.includes("tweet") ||
    lower.includes("content") ||
    lower.includes("brief") ||
    lower.includes("turn this into")
  ) {
    return {
      intent: "studio",
      action: "transform",
      confidence: 0.9,
    };
  }

  return {
    intent: "unknown",
    confidence: 0.5,
  };
}