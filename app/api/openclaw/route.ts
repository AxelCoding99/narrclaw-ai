import { NextResponse } from "next/server";
import {
  route,
  type OpenClawContext,
  type OpenClawRoute,
} from "@/lib/openclaw/router";
import { execute } from "@/lib/openclaw/executor";

type SessionContext = OpenClawContext & {
  sessionId: string;
  conversationCount: number;
  updatedAt: string;
  lastCompareLeft?: string;
  lastCompareRight?: string;
  lastResolvedCommand?: string;
};

const SESSION_STORE = new Map<string, SessionContext>();

function getSessionId(body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "sessionId" in body &&
    typeof (body as { sessionId?: unknown }).sessionId === "string" &&
    (body as { sessionId: string }).sessionId.trim()
  ) {
    return (body as { sessionId: string }).sessionId.trim();
  }

  return "default-console-session";
}

function normalizeTopic(input?: string) {
  const value = input?.trim() || "";
  if (!value) return "";

  const lower = value.toLowerCase();

  if (lower === "ai") return "AI";
  if (lower === "rwa") return "RWA";
  if (lower === "depin") return "DePIN";
  if (lower === "defi") return "DeFi";
  if (lower === "layer1" || lower === "layer 1" || lower === "l1") return "Layer 1";
  if (lower === "layer2" || lower === "layer 2" || lower === "l2") return "Layer 2";
  if (lower === "infra" || lower === "infrastructure") return "Infrastructure";
  if (lower === "meme" || lower === "memes") return "Memes";
  if (lower === "gaming") return "Gaming";

  return value;
}

function getPreviousContext(sessionId: string): SessionContext | undefined {
  return SESSION_STORE.get(sessionId);
}

function buildEffectiveCommand(message: string, routed: OpenClawRoute) {
  const followupType = routed.args?.followupType;
  const sourceTopic =
    routed.args?.sourceTopic || routed.args?.topic || routed.args?.narrative;

  if (routed.agent === "RadarAgent") {
    if (routed.args?.narrative) {
      return `/radar ${routed.args.narrative}`;
    }
    return "/radar";
  }

  if (
    routed.agent === "CompareAgent" &&
    routed.args?.left &&
    routed.args?.right
  ) {
    return `compare ${routed.args.left} vs ${routed.args.right}`;
  }

  if (routed.agent === "LearningAgent") {
    if (followupType === "simplify") {
      return `/learn ${sourceTopic}`;
    }

    if (followupType === "summary") {
      return `/learn ${sourceTopic}`;
    }

    if (routed.args?.topic) {
      return `/learn ${routed.args.topic}`;
    }
  }

  if (routed.agent === "StrategyAgent") {
    if (followupType === "risk") {
      return `/strategy ${sourceTopic}`;
    }

    if (followupType === "invalidation") {
      return `/strategy ${sourceTopic}`;
    }

    if (routed.args?.topic) {
      return `/strategy ${routed.args.topic}`;
    }
  }

  if (routed.agent === "StudioAgent") {
    if (followupType === "post") {
      return `/studio post about ${sourceTopic}`;
    }

    if (followupType === "thread") {
      return `/studio thread about ${sourceTopic}`;
    }

    if (followupType === "professional") {
      return `/studio professional post about ${sourceTopic}`;
    }

    if (followupType === "shorten") {
      return `/studio short post about ${sourceTopic}`;
    }

    if (routed.args?.topic) {
      return `/studio ${routed.args.topic}`;
    }
  }

  return message;
}

function buildUpdatedContext(
  sessionId: string,
  message: string,
  routed: OpenClawRoute,
  effectiveCommand: string,
  previous?: SessionContext
): SessionContext {
  const nextTopic =
    normalizeTopic(routed.args?.sourceTopic) ||
    normalizeTopic(routed.args?.topic) ||
    normalizeTopic(routed.args?.narrative) ||
    previous?.lastTopic ||
    previous?.lastNarrative;

  const nextNarrative =
    normalizeTopic(routed.args?.narrative) ||
    normalizeTopic(routed.args?.sourceTopic) ||
    previous?.lastNarrative;

  return {
    sessionId,
    conversationCount: (previous?.conversationCount || 0) + 1,
    updatedAt: new Date().toISOString(),
    lastIntent: routed.intent,
    lastAgent: routed.agent,
    lastTopic: nextTopic,
    lastNarrative: nextNarrative,
    lastUserMessage: message,
    lastCompareLeft:
      normalizeTopic(routed.args?.left) || previous?.lastCompareLeft,
    lastCompareRight:
      normalizeTopic(routed.args?.right) || previous?.lastCompareRight,
    lastResolvedCommand: effectiveCommand,
    lastAssistantSummary: previous?.lastAssistantSummary,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const sessionId = getSessionId(body);

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    const previousContext = getPreviousContext(sessionId);

    const routed = route({
      command: message,
      context: previousContext,
    });

    const effectiveCommand = buildEffectiveCommand(message, routed);
    const result = await execute(effectiveCommand);

    const updatedContext = buildUpdatedContext(
      sessionId,
      message,
      routed,
      effectiveCommand,
      previousContext
    );

    updatedContext.lastAssistantSummary = result.summary;
    SESSION_STORE.set(sessionId, updatedContext);

    return NextResponse.json({
      ok: true,
      sessionId,
      routed,
      effectiveCommand,
      result,
      context: updatedContext,
      followUpResolved: routed.intent === "followup",
      assistantMode: true,
    });
  } catch (error) {
    console.error("OPENCLAW_API_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}