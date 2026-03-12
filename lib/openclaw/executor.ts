import { route, type OpenClawRoute } from "./router";

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
  assets?: unknown[];
  narratives?: NarrativeItem[];
  error?: string;
  warning?: string | null;
  source?: "live" | "fallback";
};

export type OpenClawExecutionResult = {
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

function formatMomentum(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getMomentumScore(value: number | null) {
  if (value === null || Number.isNaN(value)) return -999;
  return value;
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
  if (lower === "stablecoin" || lower === "stablecoins") return "Stablecoin Infrastructure";

  return value;
}

function buildResult(
  ok: boolean,
  intent: string,
  agent: string,
  state: string,
  summary: string,
  reasoning1: string,
  reasoning2: string,
  reasoning3: string,
  stream: string[]
): OpenClawExecutionResult {
  return {
    ok,
    route: {
      intent,
      agent,
    },
    state,
    summary,
    reasoning1,
    reasoning2,
    reasoning3,
    stream,
  };
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function getRadarData() {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/api/radar`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`RADAR_HTTP_${res.status}`);
    }

    const radarData: RadarResponse = await res.json();

    if (radarData.error) {
      throw new Error("RADAR_JSON_ERROR");
    }

    return radarData;
  } catch {
    return {
      updatedAt: new Date().toISOString(),
      source: "fallback" as const,
      warning: "Radar live data unavailable, using local fallback.",
      narratives: [
        {
          key: "AI",
          coins: ["TAO", "FET", "NEAR"],
          asset_count: 3,
          avg_change_24h: 6.76,
          confidence: 65,
          status: "Building",
          lead_asset: "TAO",
        },
        {
          key: "RWA",
          coins: ["ONDO", "CFG"],
          asset_count: 2,
          avg_change_24h: 3.42,
          confidence: 59,
          status: "Stable",
          lead_asset: "ONDO",
        },
        {
          key: "DePIN",
          coins: ["HNT", "AKT"],
          asset_count: 2,
          avg_change_24h: 2.14,
          confidence: 57,
          status: "Stable",
          lead_asset: "AKT",
        },
        {
          key: "DeFi",
          coins: ["UNI", "AAVE"],
          asset_count: 2,
          avg_change_24h: 0.33,
          confidence: 58,
          status: "Stable",
          lead_asset: "UNI",
        },
        {
          key: "Layer 1",
          coins: ["BTC", "ETH", "SOL"],
          asset_count: 3,
          avg_change_24h: 0.76,
          confidence: 71,
          status: "Stable",
          lead_asset: "BTC",
        },
      ],
    };
  }
}

function findNarrativeByTopic(
  narratives: NarrativeItem[],
  topic?: string
): NarrativeItem | null {
  const normalized = normalizeTopic(topic);

  if (!normalized) {
    return narratives[0] || null;
  }

  return (
    narratives.find(
      (item) => item.key.toLowerCase() === normalized.toLowerCase()
    ) || null
  );
}

function buildRadarResult(
  intent: string,
  agent: string,
  narrative: NarrativeItem
): OpenClawExecutionResult {
  return buildResult(
    true,
    intent,
    agent,
    "Narrative Ready",
    `${narrative.key} is active with ${formatMomentum(
      narrative.avg_change_24h
    )} momentum.`,
    `${narrative.key} currently carries confidence ${narrative.confidence} / 100, which means the theme is visible enough to matter in the radar feed and deserves attention as an active market narrative rather than background noise.`,
    `${narrative.lead_asset} is the current lead asset, with ${narrative.asset_count} tracked asset(s) contributing to the theme. Supporting coins include ${narrative.coins.join(
      ", "
    )}, which helps show whether the move is broad or too dependent on one name.`,
    `The current status is ${narrative.status}. The practical reading is simple: use this as narrative context first, then decide whether you want a strategy view, a risk view, or content built from this theme.`,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      `Narrative: ${narrative.key}`,
      `Lead asset: ${narrative.lead_asset}`,
      `Momentum: ${formatMomentum(narrative.avg_change_24h)}`,
      "> execution complete",
    ]
  );
}

function buildTopNarrativeResult(
  intent: string,
  agent: string,
  narratives: NarrativeItem[]
): OpenClawExecutionResult {
  const top = narratives[0];

  if (!top) {
    return buildResult(
      false,
      intent,
      agent,
      "No Narrative Data",
      "No ranked narrative data is available right now.",
      "The radar layer did not return any grouped narrative output, so OpenClaw cannot identify which theme is currently leading market attention.",
      "This usually means the feed is temporarily unavailable, the grouping layer returned empty output, or the backend is not producing a stable ranked set.",
      "The issue is not the question itself. The system simply does not have enough structured radar context at this moment to produce a grounded top narrative answer.",
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        "No top narrative available",
        "> execution failed",
      ]
    );
  }

  return buildResult(
    true,
    intent,
    agent,
    "Top Narrative Ready",
    `${top.key} is the top narrative right now.`,
    `${top.key} currently shows ${formatMomentum(
      top.avg_change_24h
    )} grouped momentum with confidence ${top.confidence} / 100, which makes it the strongest theme in the current ranked radar structure.`,
    `${top.lead_asset} is leading the move, while ${top.coins.join(
      ", "
    )} provide broader support inside the narrative. That matters because a stronger narrative usually has both leadership and participation, not just one coin moving alone.`,
    `Its current status is ${top.status}. The practical interpretation is that this is a discovery signal: it tells you where attention is strongest now, and you can use that as the base for deeper strategy, comparison, or content generation.`,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      "Mode: top narrative",
      `Top narrative found: ${top.key}`,
      "> execution complete",
    ]
  );
}

function buildCompareResult(
  intent: string,
  agent: string,
  leftNarrative: NarrativeItem,
  rightNarrative: NarrativeItem
): OpenClawExecutionResult {
  const stronger =
    getMomentumScore(leftNarrative.avg_change_24h) >=
    getMomentumScore(rightNarrative.avg_change_24h)
      ? leftNarrative
      : rightNarrative;

  return buildResult(
    true,
    intent,
    agent,
    "Comparison Ready",
    `${stronger.key} is stronger than the other side right now.`,
    `${leftNarrative.key} is showing ${formatMomentum(
      leftNarrative.avg_change_24h
    )} momentum, while ${rightNarrative.key} is showing ${formatMomentum(
      rightNarrative.avg_change_24h
    )}. On a relative grouped basis, ${stronger.key} has the stronger narrative structure at the moment.`,
    `${leftNarrative.key} is led by ${leftNarrative.lead_asset}, while ${rightNarrative.key} is led by ${rightNarrative.lead_asset}. Leadership matters because the cleanest narrative usually begins with a strong lead asset and then pulls related names into the move.`,
    `${leftNarrative.key} includes ${leftNarrative.coins.join(
      ", "
    )}, while ${rightNarrative.key} includes ${rightNarrative.coins.join(
      ", "
    )}. The best practical read is not only which side is stronger now, but which side looks cleaner, broader, and more durable if rotation continues.`,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      `Left narrative: ${leftNarrative.key}`,
      `Right narrative: ${rightNarrative.key}`,
      `Stronger side: ${stronger.key}`,
      "> execution complete",
    ]
  );
}

function buildLearningResult(
  intent: string,
  agent: string,
  rawPrompt?: string,
  explicitTopic?: string,
  narratives: NarrativeItem[] = []
): OpenClawExecutionResult {
  const prompt = (rawPrompt || explicitTopic || "this concept").trim();
  const lowerPrompt = prompt.toLowerCase();

  function detectTopicFromPrompt(input: string) {
    const lower = ` ${input.toLowerCase()} `;

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
    if (lower.includes(" gaming ") || lower.includes(" gamefi ")) return "Gaming";
    if (
      lower.includes(" meme ") ||
      lower.includes(" memes ") ||
      lower.includes(" memecoin ") ||
      lower.includes(" memecoins ")
    ) {
      return "Memes";
    }
    if (lower.includes(" stablecoin ")) return "Stablecoin Infrastructure";
    if (lower.includes(" infrastructure ") || lower.includes(" infra ")) {
      return "Infrastructure";
    }

    return normalizeTopic(explicitTopic) || "this concept";
  }

  const cleanTopic = detectTopicFromPrompt(prompt);

  function topicKnowledge(topic: string) {
    const t = normalizeTopic(topic);
    const l = t.toLowerCase();

    if (l === "ai") {
      return {
        what:
          "AI in crypto usually refers to tokens and projects connected to infrastructure, data, agents, coordination layers, and application-facing products linked to the artificial intelligence narrative.",
        whyCare:
          "The market cares about AI because it combines a big technological story with speculative capital, which makes it one of the easiest narratives for attention to scale quickly.",
        whyNow:
          "AI tends to matter more when the market rotates back into ambitious growth narratives and starts rewarding infrastructure, compute, agents, or data-related stories again.",
        rise:
          "AI usually rises when attention returns to compute, infrastructure, agents, or product-facing stories and the market starts treating the category as one of the main themes of the cycle.",
        decline:
          "AI usually weakens when participation narrows, leaders lose momentum, or capital rotates into a cleaner or more structured narrative elsewhere.",
        structure:
          "The most important thing to understand is that infrastructure, data, agents, and application tokens are not the same kind of exposure even if the market groups them under one AI label.",
        misconception:
          "A common mistake is assuming every AI-labeled token has equal quality or equal relevance to the narrative.",
        confirms:
          "AI is better confirmed when leadership stays strong, participation broadens across multiple names, and the move is not dependent on one isolated coin.",
        weakens:
          "The narrative weakens when breadth shrinks, leaders roll over, or the category becomes visible without enough follow-through.",
        representedBy: "TAO, FET, RNDR, NEAR, and other AI-linked infrastructure or application names depending on cycle context.",
        watchNext:
          "Watch whether leadership stays broad, whether infrastructure names keep confirming the move, and whether the category still absorbs capital instead of losing it to competing narratives.",
      };
    }

    if (l === "rwa") {
      return {
        what:
          "RWA stands for Real World Assets. In crypto, it usually means bringing off-chain assets such as treasury exposure, credit, or other financial claims onto blockchain rails.",
        whyCare:
          "The market cares about RWA because it gives crypto one of its clearest bridges to traditional finance and often sounds more structured and institutional than purely speculative themes.",
        whyNow:
          "RWA matters more when the market starts preferring themes that feel credible, institution-friendly, and easier to connect with real financial activity.",
        rise:
          "RWA tends to rise when tokenization, treasury exposure, institutional relevance, or real-yield style narratives become more attractive to the market.",
        decline:
          "RWA weakens when the market stops rewarding institutional framing, when other narratives look cleaner, or when the underlying structure fails to feel compelling enough.",
        structure:
          "The key point is that tokenization alone is not the full story. What matters is whether the underlying asset, trust structure, and demand are strong enough to support the narrative.",
        misconception:
          "A common mistake is assuming RWA is automatically safer or stronger simply because it sounds more institutional.",
        confirms:
          "RWA is better confirmed when the market keeps rewarding the category broadly and the story continues to feel structurally credible rather than promotional.",
        weakens:
          "The narrative weakens when the market stops treating the category as a real bridge to traditional finance and starts seeing it as branding without strong follow-through.",
        representedBy: "ONDO and other tokenization-linked or institution-facing crypto names depending on the current cycle.",
        watchNext:
          "Watch whether the market still values institutional framing, whether participation broadens, and whether the narrative keeps enough credibility to matter.",
      };
    }

    if (l === "depin") {
      return {
        what:
          "DePIN stands for Decentralized Physical Infrastructure Networks. It refers to crypto systems that use token incentives to help coordinate real-world infrastructure like compute, storage, sensors, or wireless services.",
        whyCare:
          "The market cares about DePIN because it gives crypto a narrative that feels more tangible than purely abstract on-chain stories.",
        whyNow:
          "DePIN matters more when users and capital start looking for narratives that connect crypto with real-world infrastructure and utility.",
        rise:
          "DePIN usually rises when the market believes the infrastructure angle is credible and starts rewarding projects tied to compute, connectivity, or other physical-service layers.",
        decline:
          "DePIN weakens when the utility story no longer feels strong enough, when participation becomes too narrow, or when the market rotates toward a faster narrative.",
        structure:
          "What matters most is whether the token incentive model is helping support believable infrastructure coordination rather than only producing short-term excitement.",
        misconception:
          "A common mistake is thinking real-world utility automatically guarantees a strong narrative or a good trade.",
        confirms:
          "DePIN is better confirmed when the infrastructure angle remains believable and more than one name begins participating in the move.",
        weakens:
          "The narrative weakens when users stop believing the infrastructure story is scaling or when market conviction fades too quickly.",
        representedBy: "AKT, HNT, and other infrastructure-linked names depending on the cycle.",
        watchNext:
          "Watch whether the infrastructure angle stays credible, whether participation broadens, and whether the narrative remains strong enough to avoid fading into the background.",
      };
    }

    if (l === "defi") {
      return {
        what:
          "DeFi stands for Decentralized Finance. It refers to on-chain financial activity such as lending, trading, liquidity provision, derivatives, and other protocol-based financial services.",
        whyCare:
          "The market cares about DeFi because it sits close to actual on-chain capital flow, liquidity, and speculative activity.",
        whyNow:
          "DeFi matters more when market participants return to yield, protocol activity, or liquidity-based narratives.",
        rise:
          "DeFi usually rises when on-chain activity improves, capital rotates back into protocol exposure, or liquidity-focused narratives become attractive again.",
        decline:
          "DeFi weakens when participation stays too thin, speculative flow fades, or capital rotates into simpler or faster-moving narratives.",
        structure:
          "The quality of a DeFi narrative depends on whether activity is broad across the category and not limited to isolated price bursts in a few names.",
        misconception:
          "A common mistake is assuming any protocol pump means the full DeFi category is becoming strong again.",
        confirms:
          "DeFi is better confirmed when multiple protocols participate and the market keeps rewarding the category beyond one leader.",
        weakens:
          "The narrative weakens when breadth is poor and the move starts looking more isolated than structural.",
        representedBy: "UNI, AAVE, and other protocol or liquidity-linked names depending on market context.",
        watchNext:
          "Watch protocol breadth, capital flow, and whether the market continues treating DeFi as a sector-wide story instead of a few isolated moves.",
      };
    }

    if (l === "layer 1") {
      return {
        what:
          "Layer 1 refers to base blockchain networks such as Ethereum, Solana, or other foundational chains that host ecosystems, users, and applications.",
        whyCare:
          "The market cares about Layer 1 because it sits at the center of how crypto thinks about infrastructure, ecosystem depth, and long-term network relevance.",
        whyNow:
          "Layer 1 matters more when the market starts reassessing which base networks still have enough developer pull, liquidity, and user gravity to deserve renewed attention.",
        rise:
          "Layer 1 usually rises when capital rotates back into core infrastructure stories and the market starts rewarding ecosystem strength again.",
        decline:
          "Layer 1 weakens when ecosystem conviction fades, leadership narrows too much, or the market no longer sees enough broad support across the category.",
        structure:
          "The important question is not whether one chain is moving, but whether the market is treating the broader category as stronger or simply rewarding a few leaders.",
        misconception:
          "A common mistake is assuming one strong Layer 1 automatically means the full Layer 1 sector is breaking out.",
        confirms:
          "Layer 1 is better confirmed when leadership stays credible and multiple ecosystems or related assets begin participating in the move.",
        weakens:
          "The narrative weakens when the move becomes too narrow and the market stops rewarding the category as a broader sector story.",
        representedBy: "BTC, ETH, SOL, and other base-chain leaders depending on the cycle.",
        watchNext:
          "Watch developer pull, ecosystem breadth, and whether capital continues rewarding core infrastructure rather than rotating away.",
      };
    }

    if (l === "layer 2") {
      return {
        what:
          "Layer 2 refers to scaling layers built on top of larger base chains, especially Ethereum, to improve throughput, cost, and user experience.",
        whyCare:
          "The market cares about Layer 2 because it is directly tied to the scaling story of major ecosystems and often reflects where developer and user activity may migrate.",
        whyNow:
          "Layer 2 matters more when users care about scalability, ecosystem expansion, or new opportunities built around larger chain infrastructure.",
        rise:
          "Layer 2 usually rises when scalability, ecosystem growth, and migration narratives become more relevant to market participants.",
        decline:
          "Layer 2 weakens when adoption does not confirm the story, when the category becomes too crowded, or when capital rotates back into Layer 1 or another faster theme.",
        structure:
          "The key point is that not every Layer 2 has the same ecosystem quality, user traction, or strategic importance.",
        misconception:
          "A common mistake is assuming all Layer 2 narratives are equally strong just because they belong to the same scaling category.",
        confirms:
          "Layer 2 is better confirmed when ecosystem activity, user adoption, and liquidity support the story beyond branding alone.",
        weakens:
          "The narrative weakens when adoption fails to support the market story and the category loses credibility.",
        representedBy: "Major Ethereum scaling ecosystems and other L2-linked assets depending on context.",
        watchNext:
          "Watch ecosystem usage, liquidity, and whether the market continues rewarding scalability narratives in a broad way.",
      };
    }

    if (l === "gaming") {
      return {
        what:
          "Gaming in crypto refers to projects and narratives connected to blockchain games, gaming infrastructure, in-game economies, or game-linked ecosystems.",
        whyCare:
          "The market cares about gaming because it combines product imagination, consumer-facing storytelling, and speculative upside.",
        whyNow:
          "Gaming matters more when the market starts rewarding consumer narratives again or when the category regains enough attention to feel relevant.",
        rise:
          "Gaming usually rises when ecosystem updates, user excitement, or narrative rotation push the market back toward consumer-facing sectors.",
        decline:
          "Gaming weakens when product credibility fades, user traction disappoints, or the market rotates toward narratives with clearer structure.",
        structure:
          "Gaming becomes more believable when the market sees more than pure nostalgia or speculation and starts treating the category as a credible ecosystem story.",
        misconception:
          "A common mistake is assuming gaming attention automatically means sustainable user or product strength.",
        confirms:
          "Gaming is better confirmed when the category shows believable ecosystem activity and not just brief excitement.",
        weakens:
          "The narrative weakens when it becomes too dependent on imagination without enough follow-through.",
        representedBy: "Game-linked ecosystems and gaming-associated tokens depending on cycle context.",
        watchNext:
          "Watch whether user attention turns into believable ecosystem traction and whether the category remains relevant beyond a short thematic bounce.",
      };
    }

    if (l === "memes") {
      return {
        what:
          "Memes refers to meme coin and attention-driven narratives where community participation, visibility, and fast capital flow matter more than traditional fundamental analysis.",
        whyCare:
          "The market cares about memes because they can absorb attention and speculative capital faster than many more structured narratives.",
        whyNow:
          "Memes matter more when the market starts rewarding high-velocity attention trades and broad social participation again.",
        rise:
          "Memes usually rise when social attention accelerates, community participation expands, and capital rotates into fast-moving speculative themes.",
        decline:
          "Memes weaken when attention cools, crowd energy fades, or the market starts preferring narratives with cleaner structure.",
        structure:
          "Even though memes look chaotic, the category still has structure through attention flow, velocity, and breadth of participation.",
        misconception:
          "A common mistake is assuming meme moves are pure randomness and cannot be read through narrative structure.",
        confirms:
          "Memes are better confirmed when the move is broad enough to represent a real attention wave instead of one isolated pump.",
        weakens:
          "The narrative weakens when momentum fades quickly and attention stops spreading across the category.",
        representedBy: "DOGE and other meme-linked leaders depending on the cycle.",
        watchNext:
          "Watch whether the move remains broad, whether attention is still accelerating, and whether the category is getting crowded too fast.",
      };
    }

    if (l === "stablecoin infrastructure") {
      return {
        what:
          "Stablecoin infrastructure refers to the rails, systems, and network layers that support stable-value assets inside crypto markets.",
        whyCare:
          "The market cares because stablecoins are one of the most important structural layers in crypto liquidity, settlement, and capital movement.",
        whyNow:
          "Stablecoin infrastructure matters more when users begin paying closer attention to the plumbing that supports liquidity and on-chain economic activity.",
        rise:
          "This theme rises when the market starts valuing liquidity rails, settlement, and structural ecosystem importance more highly.",
        decline:
          "This theme weakens when the market stops prioritizing infrastructure and shifts attention toward more visible or speculative sectors.",
        structure:
          "The key point is that stablecoin infrastructure matters even when it is not the loudest narrative, because it supports how capital actually moves through crypto.",
        misconception:
          "A common mistake is thinking stablecoins matter only for payments and not for broader ecosystem structure.",
        confirms:
          "The theme is better confirmed when users recognize its structural importance and the market rewards related infrastructure more clearly.",
        weakens:
          "The theme weakens when the market values visibility over plumbing and rotates away from foundational narratives.",
        representedBy: "Liquidity rails, settlement layers, and ecosystem infrastructure tied to stable-value capital movement.",
        watchNext:
          "Watch whether the market starts prioritizing structural utility again and whether stablecoin-linked rails gain more strategic attention.",
      };
    }

    if (l === "infrastructure") {
      return {
        what:
          "Infrastructure in crypto refers to the foundational systems that support broader ecosystem activity, such as networks, tooling, compute, coordination layers, and backend rails.",
        whyCare:
          "The market cares about infrastructure because it often becomes more important when users start valuing utility, scalability, and ecosystem support over pure attention plays.",
        whyNow:
          "Infrastructure matters more when the market rotates toward foundational narratives and starts rewarding what supports broader crypto activity.",
        rise:
          "Infrastructure rises when utility, ecosystem relevance, and foundational support become more attractive to capital.",
        decline:
          "Infrastructure weakens when the market rotates into faster or more visible narratives and stops rewarding foundational exposure as strongly.",
        structure:
          "The main point is that infrastructure can be one of the most important themes in crypto even when it is not the loudest one.",
        misconception:
          "A common mistake is assuming infrastructure is always slow or unimportant just because it is less flashy.",
        confirms:
          "Infrastructure is better confirmed when ecosystem importance, usage, and capital relevance align in a believable way.",
        weakens:
          "The narrative weakens when the market stops prioritizing foundational utility and rotates toward simpler attention trades.",
        representedBy: "Networks, tooling, coordination layers, and backend crypto rails depending on current market context.",
        watchNext:
          "Watch whether the market continues valuing foundational exposure and whether infrastructure names regain broader strategic relevance.",
      };
    }

    return {
      what: `${t} is a crypto market concept that should be understood as both an idea and a narrative.`,
      whyCare: `The market cares about ${t} when users begin treating it as a theme that can attract attention, capital, and broader relevance.`,
      whyNow: `${t} matters more when the market starts rewarding the narrative in a visible way.`,
      rise: `${t} usually rises when capital, attention, and narrative clarity begin aligning around it.`,
      decline: `${t} usually weakens when attention fades, breadth shrinks, or capital rotates elsewhere.`,
      structure: `${t} should be read through structure, leadership, and follow-through rather than label alone.`,
      misconception: `A common mistake is assuming the label ${t} tells you everything you need to know about the opportunity.`,
      confirms: `${t} is better confirmed when leadership and participation support the move broadly enough to matter.`,
      weakens: `${t} weakens when the category loses breadth, leadership, or narrative quality.`,
      representedBy: `${t} is represented by the assets and projects the market currently treats as the main leaders of that theme.`,
      watchNext: `Watch whether ${t} continues to attract capital and whether the move remains broad enough to stay relevant.`,
    };
  }

  function classifyQuestion(p: string) {
    if (
      p.includes("top narrative") ||
      p.includes("leading right now") ||
      p.includes("strongest narrative") ||
      p.includes("best breadth") ||
      p.includes("overheated") ||
      p.includes("building quietly") ||
      p.includes("losing attention")
    ) {
      return "radar";
    }

    if (
      p.includes("compare ") ||
      p.includes(" vs ") ||
      p.includes(" versus ") ||
      p.includes("difference between")
    ) {
      return "compare";
    }

    if (
      p.includes("what do people misunderstand") ||
      p.includes("common misconception") ||
      p.includes("misconception") ||
      p.includes("what do beginners get wrong")
    ) {
      return "misconception";
    }

    if (
      p.includes("which assets represent") ||
      p.includes("what coins represent") ||
      p.includes("represent this narrative")
    ) {
      return "representatives";
    }

    if (
      p.includes("what confirms") ||
      p.includes("what weakens") ||
      p.includes("what invalidates") ||
      p.includes("how do i know")
    ) {
      return "confirmation";
    }

    if (
      p.includes("what should i watch") ||
      p.includes("what to watch next") ||
      p.includes("what matters next")
    ) {
      return "watch-next";
    }

    if (
      p.includes("sector rotation") ||
      p.includes("why does capital rotate") ||
      p.includes("narrative rotation")
    ) {
      return "rotation";
    }

    if (
      p.includes("how do narratives start") ||
      p.includes("how do narratives fade") ||
      p.includes("how do narratives become strong") ||
      p.includes("when does a narrative become crowded")
    ) {
      return "lifecycle";
    }

    if (
      p.includes("how do i explain") ||
      p.includes("explain to retail") ||
      p.includes("cleanest way to explain") ||
      p.includes("turn this into beginner explanation")
    ) {
      return "creator";
    }

    if (
      p.includes("how should i think about") ||
      p.includes("how do i think about") ||
      p.includes("how do i evaluate") ||
      p.includes("how do i separate hype")
    ) {
      return "framework";
    }

    if (
      p.includes("why is ") ||
      p.includes("why are ") ||
      p.includes("what is driving") ||
      p.includes("what drives ") ||
      p.includes("what changed in ")
    ) {
      if (
        p.includes("weak") ||
        p.includes("fall") ||
        p.includes("drop") ||
        p.includes("decline") ||
        p.includes("underperform") ||
        p.includes("selling") ||
        p.includes("weakening")
      ) {
        return "decline";
      }
      return "rise";
    }

    if (
      p.includes("for beginners") ||
      p.includes("simple terms") ||
      p.includes("plain english") ||
      p.includes("simple language") ||
      p.includes("beginner")
    ) {
      return "beginner";
    }

    if (p.includes("why does it matter now") || p.includes("matter now") || p.includes("relevant now")) {
      return "why-now";
    }

    return "definition";
  }

  const knowledge = topicKnowledge(cleanTopic);
  const questionType = classifyQuestion(lowerPrompt);

  if (questionType === "radar") {
    const sorted = [...narratives].sort(
      (a, b) => getMomentumScore(b.avg_change_24h) - getMomentumScore(a.avg_change_24h)
    );
    const top = sorted[0];
    const second = sorted[1];

    if (!top) {
      return buildResult(
        false,
        intent,
        agent,
        "Learning Ready",
        "Radar context is not available right now.",
        "The system cannot answer radar-connected learning questions without current narrative ranking data.",
        "Once radar data is available, Learning can explain which narrative is leading, what changed, and what that means.",
        "Try again when radar data is connected.",
        [
          "> openclaw route ready",
          `Agent selected: ${agent}`,
          "Radar-connected learning unavailable",
          "> execution failed",
        ]
      );
    }

    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${top.key} is currently the strongest narrative in radar context with momentum ${formatMomentum(
        top.avg_change_24h
      )} and confidence ${top.confidence} / 100.`,
      `${top.lead_asset} is leading the theme, and the category currently shows ${top.asset_count} tracked asset(s), which suggests the move has enough structure to stand out in the current ranking.`,
      second
        ? `${second.key} is the next strongest narrative. The most useful learning point here is that leading narratives usually combine leadership, participation, and stronger capital attention instead of relying on one isolated mover.`
        : `The key learning point is that stronger narratives usually lead because they combine leadership, participation, and market attention more cleanly than weaker ones.`,
      `The practical takeaway is not only which narrative is on top, but why it is on top: radar helps show whether the move is broad enough, strong enough, and credible enough to matter now.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Radar-connected learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "compare") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `A useful comparison starts by understanding how ${cleanTopic} behaves as a narrative rather than treating it as just a label.`,
      `${knowledge.what}`,
      `${knowledge.structure} This matters because comparing narratives is really about comparing why capital cares, how broad the move is, and whether the story still has enough internal quality to matter.`,
      `The practical way to compare narratives is to ask three things: which one has cleaner leadership, which one has broader participation, and which one the market is rewarding more credibly right now.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Comparison-style learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "misconception") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${knowledge.misconception}`,
      `${knowledge.what}`,
      `The deeper issue is that users often confuse visibility with strength. A narrative can be popular and still structurally weak if breadth, leadership, or follow-through are missing.`,
      `A better way to think about ${cleanTopic} is to look beyond the label and ask whether the story is actually being confirmed by market behavior.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Misconception learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "representatives") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${cleanTopic} is usually represented by the assets the market currently treats as leaders of that narrative.`,
      `${knowledge.representedBy}`,
      `The important learning point is that representative assets matter because they help users understand how the market is expressing the narrative in practice, not just in theory.`,
      `The safest way to use representative assets is as context for leadership and participation, not as a shortcut for assuming every asset in the category behaves the same way.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Representative assets learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "confirmation") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${knowledge.confirms}`,
      `${knowledge.weakens}`,
      `The most useful learning habit is to separate visibility from confirmation. A theme becomes more credible when multiple signs align, not just because one chart looks strong.`,
      `For ${cleanTopic}, the practical goal is to learn what strengthens the narrative and what causes the thesis to fade before the move becomes obvious to everyone else.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Confirmation learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "watch-next") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${knowledge.watchNext}`,
      `The reason this matters is that good narrative learning is not only about understanding what happened, but understanding what should be monitored next if the story is going to strengthen or weaken.`,
      `For ${cleanTopic}, users should keep watching whether leadership remains credible, whether participation broadens, and whether capital continues rewarding the theme instead of rotating away.`,
      `That is how learning becomes practical: you move from definition, to context, to signals worth monitoring in real time.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Watch-next learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "rotation") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `Sector rotation means capital is shifting from one narrative into another because the market believes the new theme offers cleaner structure, better upside, or stronger relevance.`,
      `Rotation happens when the old leader becomes crowded, weakens, or loses enough quality that capital starts searching for a stronger story elsewhere.`,
      `In practical terms, users should look for fading breadth in the old narrative and improving leadership in the new one. That transition is often how a market starts signaling a real change in attention.`,
      `The reason this matters for ${cleanTopic} is that no narrative lives in isolation. Its strength often depends on what the market is rotating away from and what it is rotating toward.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Rotation learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "lifecycle") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `Narratives usually move through stages: early formation, stronger attention, broader participation, crowding, and eventual fading.`,
      `A narrative often starts with a believable story and a small number of leaders. It becomes stronger when participation broadens and the market starts rewarding the theme more consistently.`,
      `Later in the cycle, the same narrative can become crowded if everyone starts seeing the same obvious move. That is often the point where users should become more careful rather than more emotional.`,
      `The most useful lesson is that narrative timing matters. A good story is not always a good opportunity if the market is already too far into the cycle.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Lifecycle learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "creator") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `The cleanest way to explain ${cleanTopic} is to start with what it is, then explain why the market cares, and only then explain why it matters now.`,
      `A creator-friendly explanation should avoid jargon overload and focus on one strong mental model. For ${cleanTopic}, that usually means explaining the category in plain language before adding market interpretation.`,
      `The best educational structure is simple: define the topic, explain the reason attention is returning, then close with what users should watch next.`,
      `That approach makes the content more useful because it helps audiences understand the topic instead of only reacting to the headline.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Creator-mode learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "framework") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `A good way to think about ${cleanTopic} is to separate four things: what it is, why the market cares, what confirms the story, and what weakens it.`,
      `That framework helps users avoid confusing hype with strength. A narrative can be loud without being durable, and it can be interesting without being actionable.`,
      `The safest evaluation method is to look at leadership, breadth, participation, and whether the narrative still has believable follow-through.`,
      `This is what makes narrative learning practical: instead of memorizing labels, you learn how to judge whether a theme is actually gaining real relevance.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Framework learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "rise") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${cleanTopic} is likely gaining attention because ${knowledge.rise}`,
      `${knowledge.structure}`,
      `What matters next is whether the move remains broad enough and credible enough to keep attracting attention instead of fading after the initial burst.`,
      `${knowledge.watchNext}`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Rise-cause learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "decline") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${cleanTopic} is likely weakening because ${knowledge.decline}`,
      `${knowledge.structure}`,
      `The useful interpretation is not automatically that the narrative is dead, but whether the category is losing enough breadth, leadership, or attention to damage the story structurally.`,
      `${knowledge.watchNext}`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Decline-cause learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "why-now") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${knowledge.whyNow}`,
      `${knowledge.whyCare}`,
      `The reason this matters now is that narratives become more important when the market starts rewarding them visibly rather than treating them as background themes.`,
      `${knowledge.watchNext}`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Why-now learning prepared",
        "> execution complete",
      ]
    );
  }

  if (questionType === "beginner") {
    return buildResult(
      true,
      intent,
      agent,
      "Learning Ready",
      `${knowledge.what}`,
      `In simple terms, people care because ${knowledge.whyCare.toLowerCase()}`,
      `The easiest way to understand ${cleanTopic} is to remember that a narrative matters when the market begins paying attention to it and rewarding it more clearly.`,
      `What you should remember most is this: ${knowledge.structure}`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Topic: ${cleanTopic}`,
        "Beginner learning prepared",
        "> execution complete",
      ]
    );
  }

  return buildResult(
    true,
    intent,
    agent,
    "Learning Ready",
    `${knowledge.what}`,
    `${knowledge.whyCare}`,
    `${knowledge.structure}`,
    `The practical takeaway is this: ${knowledge.watchNext}`,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      `Topic: ${cleanTopic}`,
      "Definition-style learning prepared",
      "> execution complete",
    ]
  );
}

function buildStrategyResult(
  intent: string,
  agent: string,
  narrative: NarrativeItem | null,
  requestedTopic?: string,
  followupType?: string
): OpenClawExecutionResult {
  const topicLabel = normalizeTopic(requestedTopic) || narrative?.key || "Market";
  const confidence = narrative?.confidence ?? 58;
  const momentum = narrative?.avg_change_24h ?? 0;
  const status = narrative?.status || "Stable";
  const leadAsset = narrative?.lead_asset || "N/A";
  const breadth = narrative?.asset_count ?? 0;
  const coins = narrative?.coins?.length ? narrative.coins.join(", ") : "N/A";

  let headline = `${topicLabel} has a constructive setup right now.`;
  let trigger =
    "The cleanest trigger is confirmation that the theme keeps leadership and that stronger names continue to hold relative strength.";
  let invalidation =
    "The thesis weakens if leadership fades, participation narrows, or capital rotates into a cleaner narrative.";
  let risk =
    "The main risk is that the idea remains valid, but loses relative attention before the move fully develops.";
  let horizon =
    "This should be treated as a tactical setup rather than an open-ended long-term call.";

  if (momentum >= 6) {
    headline = `${topicLabel} has a strong bullish structure right now.`;
    trigger =
      "The cleanest trigger is continuation with confirmation: the theme should remain a relative leader, the main names should keep outperforming, and breadth should stay healthy instead of collapsing into one isolated mover.";
    invalidation =
      "The thesis weakens if the lead asset starts rolling over, breadth shrinks quickly, or a stronger narrative begins absorbing attention from this theme.";
    risk =
      "The main risk is overextension. Strong narratives can still punish late entries if the trade becomes crowded and momentum gets too obvious.";
    horizon =
      "This is best treated as a short-to-medium term continuation setup as long as leadership stays intact.";
  } else if (momentum >= 2) {
    headline = `${topicLabel} has constructive momentum but still needs confirmation.`;
    trigger =
      "The cleanest trigger is selective confirmation: the narrative should keep leadership, stronger names should continue outperforming, and the move should stay organized rather than random.";
    invalidation =
      "The thesis weakens if leadership fades, the move loses internal participation, or a different narrative starts offering a cleaner structure.";
    risk =
      "The main risk is inconsistent follow-through. The theme can still be valid, but capital may rotate elsewhere before this one fully develops.";
    horizon =
      "This is best treated as a tactical swing setup that still needs proof before it deserves higher conviction.";
  } else if (momentum < 0) {
    headline = `${topicLabel} is not showing a strong setup yet.`;
    trigger =
      "The cleanest trigger is improvement first. It needs stronger participation, better leadership, and clearer relative strength before it becomes attractive.";
    invalidation =
      "The thesis remains weak if the theme continues losing attention and fails to rebuild internal structure.";
    risk =
      "The main risk is low-quality exposure: a weak narrative can appear interesting in theory while still trading poorly in practice.";
    horizon =
      "This should be treated cautiously until the structure improves in a visible way.";
  }

  if (followupType === "risk") {
    return buildResult(
      true,
      intent,
      agent,
      "Strategy Ready",
      `The biggest risk for ${topicLabel} is loss of attention.`,
      `${topicLabel} currently shows ${formatMomentum(
        momentum
      )} momentum with confidence ${confidence} / 100, but that does not guarantee continuation. The first real risk is that capital simply rotates into a cleaner or newer narrative before this setup fully develops.`,
      `${leadAsset} is the lead asset and the theme currently has ${breadth} tracked asset(s). If leadership weakens there, or if breadth narrows too fast, the narrative can look intact on the surface while actually becoming much weaker underneath.`,
      `The broader risk is positioning quality. When traders arrive late to a narrative that already feels obvious, upside can shrink while downside becomes sharper. Supporting coins currently include ${coins}, and the current status is ${status}.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Strategy topic: ${topicLabel}`,
        "Risk view prepared",
        "> execution complete",
      ]
    );
  }

  if (followupType === "invalidation") {
    return buildResult(
      true,
      intent,
      agent,
      "Strategy Ready",
      `${topicLabel} is invalidated if leadership starts fading.`,
      `The strategy thesis for ${topicLabel} weakens if the narrative stops acting like a leader on a relative basis. That usually shows up when the lead asset stops outperforming, the move loses internal participation, or a different theme starts absorbing more attention from the market.`,
      `A clean narrative setup usually needs both leadership and breadth. If ${leadAsset} loses strength and the rest of the theme fails to hold structure, the thesis becomes much less reliable even if the story itself still sounds attractive.`,
      `Right now ${topicLabel} shows ${formatMomentum(
        momentum
      )} momentum with confidence ${confidence} / 100. The invalidation is not about the concept disappearing. It is about the market no longer rewarding it strongly enough to justify the same positioning logic.`,
      [
        "> openclaw route ready",
        `Agent selected: ${agent}`,
        `Strategy topic: ${topicLabel}`,
        "Invalidation view prepared",
        "> execution complete",
      ]
    );
  }

  return buildResult(
    true,
    intent,
    agent,
    "Strategy Ready",
    headline,
    `${topicLabel} currently shows ${formatMomentum(
      momentum
    )} grouped momentum with confidence ${confidence} / 100. The lead asset is ${leadAsset}, and the narrative is being represented by ${breadth} tracked asset(s), which gives a basic view of both leadership and breadth.`,
    `${trigger} ${invalidation} ${risk}`,
    `${horizon} Supporting coins currently include ${coins}, and the narrative status is ${status}. The practical goal is to judge whether this move is early enough, broad enough, and durable enough to justify positioning.`,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      `Strategy topic: ${topicLabel}`,
      `Lead asset: ${leadAsset}`,
      `Momentum: ${formatMomentum(momentum)}`,
      "> execution complete",
    ]
  );
}

function buildStudioResult(
  intent: string,
  agent: string,
  topic?: string,
  followupType?: string,
  studioPrompt?: string,
  studioMode?: "post" | "thread",
  regenerateVersion: number = 0
): OpenClawExecutionResult {
  function sanitizeTopic(input?: string) {
    const raw = normalizeTopic(input) || "market insight";
    return raw
      .replace(/^thread about\s+/i, "")
      .replace(/^post about\s+/i, "")
      .replace(/^professional post about\s+/i, "")
      .replace(/^short post about\s+/i, "")
      .trim();
  }

  const cleanTopic = sanitizeTopic(topic);
  const prompt = (studioPrompt || `Write about ${cleanTopic}`).trim().toLowerCase();

  function coreFor(inputTopic: string) {
    const t = sanitizeTopic(inputTopic);
    const l = t.toLowerCase();

    if (l === "ai") {
      return {
        subject: "AI",
        whyUp:
          "renewed attention to AI infrastructure, agents, and application-layer stories, combined with the market's tendency to rotate capital back into narratives that feel technologically ambitious and scalable",
        whyDown:
          "the market appears to be reducing enthusiasm for AI-linked names because participation is narrowing, conviction is weakening, or capital is rotating into cleaner narratives with stronger follow-through",
        quality:
          "the most important distinction inside AI is that infrastructure, data, agents, and application tokens are not the same kind of exposure even if the market groups them together",
        implication:
          "the smarter read is not simply that AI is active, but whether the move is broad enough and strong enough to keep attracting capital beyond the first burst of attention",
      };
    }

    if (l === "rwa") {
      return {
        subject: "RWA",
        whyUp:
          "growing interest in tokenized assets, institution-friendly narratives, and themes that feel more structurally connected to traditional finance",
        whyDown:
          "the market may be cooling on RWA because the narrative is losing urgency, capital is rotating elsewhere, or the structure behind the story is not convincing enough to sustain momentum",
        quality:
          "RWA becomes more compelling when the underlying asset structure, trust assumptions, and real demand look credible enough to support more than just narrative branding",
        implication:
          "the better interpretation is not merely that RWA sounds serious, but whether the market continues rewarding it as a durable bridge between crypto and traditional finance",
      };
    }

    if (l === "depin") {
      return {
        subject: "DePIN",
        whyUp:
          "attention returning to crypto narratives tied to real-world infrastructure such as compute, storage, wireless coordination, and other physical-service layers",
        whyDown:
          "the market may be treating DePIN more cautiously because the infrastructure story is not being rewarded as strongly, participation is too narrow, or the utility angle is not convincing enough right now",
        quality:
          "DePIN becomes more credible when users believe token incentives are supporting real infrastructure coordination rather than only creating speculative excitement",
        implication:
          "the key question is whether the infrastructure angle remains credible enough for DePIN to keep being treated as a serious narrative rather than a temporary thematic spike",
      };
    }

    if (l === "layer 1") {
      return {
        subject: "Layer 1",
        whyUp:
          "renewed focus on base-layer ecosystems, stronger competition for developer attention, and rotation into narratives tied to core infrastructure relevance",
        whyDown:
          "the market may be stepping back from Layer 1 because leadership is narrowing, ecosystem conviction is fading, or capital is no longer rewarding the category as broadly as before",
        quality:
          "Layer 1 strength matters when the market believes certain base chains still have enough developer pull, liquidity, ecosystem depth, and user gravity to justify renewed attention",
        implication:
          "the better interpretation is not that every Layer 1 move signals a broad sector breakout, but whether leadership is concentrating into a few credible ecosystems with real internal strength",
      };
    }

    if (l === "defi") {
      return {
        subject: "DeFi",
        whyUp:
          "rotation back into on-chain capital themes, improved interest in liquidity-driven activity, and stronger market attention toward protocols that benefit when speculative participation expands",
        whyDown:
          "DeFi may be weakening because participation is not broad enough, the market is not rewarding protocol exposure as strongly, or capital is moving into faster narratives",
        quality:
          "DeFi becomes more interesting when activity starts building across the category instead of staying limited to isolated tokens or short-lived price bursts",
        implication:
          "the practical question is whether DeFi is attracting real sector-wide interest or simply catching temporary flows before capital rotates again",
      };
    }

    if (l === "memes") {
      return {
        subject: "Memes",
        whyUp:
          "high-speed attention flow, community-driven speculation, and the market's tendency to reward narratives that move quickly and attract broad social participation",
        whyDown:
          "meme coins may be weakening because attention is cooling, momentum quality is fading, or the market has started rotating away from high-velocity speculative trades",
        quality:
          "the meme category behaves differently because it depends far more on velocity, visibility, and crowd participation than on traditional analytical depth",
        implication:
          "the important read is whether meme strength is broad enough to represent a real attention wave or whether the category is already becoming too crowded to maintain clean upside",
      };
    }

    if (l === "gaming") {
      return {
        subject: "Gaming",
        whyUp:
          "renewed attention to game-linked crypto narratives, ecosystem updates, and market appetite for narratives that combine product imagination with speculative upside",
        whyDown:
          "gaming-linked tokens may be weakening because the market is no longer prioritizing the category, participation is fading, or the narrative lacks a strong enough catalyst",
        quality:
          "gaming becomes more credible when the market sees real ecosystem energy, product relevance, and sustained attention rather than only nostalgic speculation",
        implication:
          "the better question is whether gaming is rebuilding meaningful narrative relevance or simply attracting temporary interest without deeper follow-through",
      };
    }

    if (l === "infrastructure") {
      return {
        subject: "Infrastructure",
        whyUp:
          "the market is rotating toward foundational themes that support broader crypto activity, especially when users start valuing utility, scalability, and backend relevance more highly",
        whyDown:
          "infrastructure names may be weakening because the market is not prioritizing foundational exposure right now or because capital is rotating into more visible consumer-facing narratives",
        quality:
          "infrastructure becomes more compelling when the market believes the category is essential enough to support broader ecosystem activity, not just a technical afterthought",
        implication:
          "the useful interpretation is whether infrastructure is being treated as core positioning again or whether it remains overshadowed by more attention-grabbing sectors",
      };
    }

    return {
      subject: t,
      whyUp:
        `${t} is gaining attention because the market is starting to treat the theme as more than a passing idea and is giving it more narrative relevance right now.`,
      whyDown:
        `${t} appears to be weakening because the market is no longer rewarding the theme as cleanly, and attention may be fading or rotating elsewhere.`,
      quality:
        `${t} matters when capital, narrative clarity, and believable follow-through begin aligning around it in a way users can actually interpret.`,
      implication:
        `the real question is not only whether ${t} is active, but whether the narrative is strong enough to matter beyond a short burst of attention.`,
    };
  }

  function isDownPrompt(p: string) {
    return (
      p.includes("weak") ||
      p.includes("decline") ||
      p.includes("drop") ||
      p.includes("fall") ||
      p.includes("down") ||
      p.includes("selling") ||
      p.includes("under pressure")
    );
  }

  function isSimplePrompt(p: string) {
    return (
      p.includes("simple") ||
      p.includes("beginner") ||
      p.includes("easy to understand") ||
      p.includes("easy language")
    );
  }

  function buildVariant(inputTopic: string, p: string, version: number) {
    const core = coreFor(inputTopic);
    const down = isDownPrompt(p);
    const simple = isSimplePrompt(p);
    const variant = version % 4;

    if (simple) {
      if (variant === 0) {
        return {
          headline: `Headline: ${core.subject} explained simply.`,
          p1: `Paragraph 1: ${core.subject} is a crypto market theme that people are paying attention to right now.`,
          p2: `Paragraph 2: The simple reason it matters is that ${down ? core.whyDown : core.whyUp}.`,
          p3: `Paragraph 3: What matters most is whether the story keeps making sense as more people watch it.`,
        };
      }

      if (variant === 1) {
        return {
          headline: `Headline: What ${core.subject} means in simple language.`,
          p1: `Paragraph 1: ${core.subject} is important when the market starts caring about that theme more than before.`,
          p2: `Paragraph 2: Right now the main reason is that ${down ? core.whyDown : core.whyUp}.`,
          p3: `Paragraph 3: The easiest thing to watch is whether the move stays broad and believable instead of fading quickly.`,
        };
      }

      if (variant === 2) {
        return {
          headline: `Headline: A beginner explanation of ${core.subject}.`,
          p1: `Paragraph 1: ${core.subject} is not just a label. It is a market story that people are reacting to right now.`,
          p2: `Paragraph 2: The reason for that is ${down ? core.whyDown : core.whyUp}.`,
          p3: `Paragraph 3: A strong narrative usually keeps attention for longer, while a weak one fades fast.`,
        };
      }

      return {
        headline: `Headline: Why people are talking about ${core.subject}.`,
        p1: `Paragraph 1: ${core.subject} is in focus because the market sees it as important right now.`,
        p2: `Paragraph 2: The reason is ${down ? core.whyDown : core.whyUp}.`,
        p3: `Paragraph 3: The real question is whether that attention lasts or disappears quickly.`,
      };
    }

    if (variant === 0) {
      return {
        headline: `Headline: Why ${core.subject} is moving right now.`,
        p1: `Paragraph 1: ${down ? `${core.subject} is under pressure right now because ${core.whyDown}.` : `${core.subject} is gaining traction right now because ${core.whyUp}.`}`,
        p2: `Paragraph 2: What makes the narrative more important than a simple price move is that ${core.quality}.`,
        p3: `Paragraph 3: ${core.implication}`,
      };
    }

    if (variant === 1) {
      return {
        headline: `Headline: What is likely driving the current ${core.subject} move.`,
        p1: `Paragraph 1: ${down ? `The current weakness in ${core.subject} looks tied to the fact that ${core.whyDown}.` : `The current strength in ${core.subject} looks tied to the fact that ${core.whyUp}.`}`,
        p2: `Paragraph 2: That matters because ${core.quality}.`,
        p3: `Paragraph 3: The next important question is whether the narrative keeps enough quality and breadth to remain relevant from here.`,
      };
    }

    if (variant === 2) {
      return {
        headline: `Headline: ${core.subject} is active again, but the quality of the move matters more than the label.`,
        p1: `Paragraph 1: ${down ? `${core.subject} may be weakening now, but the more useful question is what has changed inside the narrative structure.` : `${core.subject} may be strengthening now, but the more useful question is what is actually supporting the move beneath the surface.`}`,
        p2: `Paragraph 2: ${down ? core.whyDown : core.whyUp}. At the same time, ${core.quality}.`,
        p3: `Paragraph 3: ${core.implication}`,
      };
    }

    return {
      headline: `Headline: The market is treating ${core.subject} as more than background noise right now.`,
      p1: `Paragraph 1: ${down ? `${core.subject} is slipping because ${core.whyDown}.` : `${core.subject} is attracting stronger attention because ${core.whyUp}.`}`,
      p2: `Paragraph 2: ${core.quality}. That is why the move should be judged through narrative strength, not just price alone.`,
      p3: `Paragraph 3: ${core.implication}`,
    };
  }

  const output = buildVariant(cleanTopic, prompt, regenerateVersion);

  return buildResult(
    true,
    intent,
    agent,
    "Studio Ready",
    output.headline,
    output.p1,
    output.p2,
    output.p3,
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      `Studio topic: ${cleanTopic}`,
      `Variation: ${regenerateVersion}`,
      studioMode === "thread" ? "Thread generated" : "Post generated",
      "> execution complete",
    ]
  );
}

function buildReasoningFallbackResult(
  intent: string,
  agent: string,
  topic?: string
): OpenClawExecutionResult {
  const cleanTopic = topic?.trim() || "your question";

  return buildResult(
    true,
    intent,
    agent,
    "Assistant Ready",
    `OpenClaw understands the topic as "${cleanTopic}".`,
    `The goal here is not only to detect an intent, but to give a useful answer even when the request is broad. That means clarifying the topic, giving context, and making the output feel informative instead of shallow.`,
    "Good intelligence UX should not force users to guess the exact command structure every time. When the request is broad, the answer should still help move the user from confusion into a clearer understanding of the subject.",
    "In practice, this means OpenClaw should behave like an intelligence layer rather than a rigid parser. Even when the question is open-ended, the response should still provide explanation, framing, and practical interpretation in plain language.",
    [
      "> openclaw route ready",
      `Agent selected: ${agent}`,
      "Fallback assistant engaged",
      "> execution complete",
    ]
  );
}

export async function execute(
  command: string,
  preRouted?: OpenClawRoute,
  options?: {
    studioPrompt?: string;
    studioMode?: "post" | "thread";
    regenerateVersion?: number;
    studioTopic?: string;
  }
): Promise<OpenClawExecutionResult> {
  const routed = preRouted ?? route({ command });

  try {
    const radarData = await getRadarData();
    const narratives = radarData.narratives ?? [];

    if (routed.agent === "RadarAgent") {
      const targetNarrative = routed.args?.narrative;

      if (!targetNarrative) {
        return buildTopNarrativeResult(
          routed.intent,
          routed.agent,
          narratives
        );
      }

      const found = narratives.find(
        (item) => item.key.toLowerCase() === targetNarrative.toLowerCase()
      );

      if (!found) {
        return buildResult(
          false,
          routed.intent,
          routed.agent,
          "Narrative Not Found",
          `I could not find "${targetNarrative}" in the current radar feed.`,
          "That means the theme is not appearing in the grouped narrative output right now, so OpenClaw cannot responsibly describe it as an active radar result.",
          "The most likely reason is that the narrative is either not mapped in the current backend set or it does not have enough representation in the live grouped feed.",
          "The safest approach is to work with the narratives that are currently visible in the feed, because those are the ones the system can evaluate with actual structured context.",
          [
            "> openclaw route ready",
            `Agent selected: ${routed.agent}`,
            `Requested narrative: ${targetNarrative}`,
            "No matching narrative found",
            "> execution failed",
          ]
        );
      }

      return buildRadarResult(routed.intent, routed.agent, found);
    }

    if (routed.agent === "CompareAgent") {
      const left = routed.args?.left;
      const right = routed.args?.right;

      if (!left || !right) {
        return buildResult(
          false,
          routed.intent,
          routed.agent,
          "Comparison Incomplete",
          "I could not fully parse the comparison request.",
          "A good comparison needs two specific narratives or sectors that the system can evaluate against the same radar context.",
          'The safest comparison format is a direct structure such as "compare AI vs RWA" because it gives OpenClaw two clean sides to map and analyze.',
          "Without two clear sides, any answer would risk sounding helpful while actually being too vague to trust.",
          [
            "> openclaw route ready",
            `Agent selected: ${routed.agent}`,
            "Comparison parse failed",
            "> execution failed",
          ]
        );
      }

      const leftNarrative = narratives.find(
        (item) => item.key.toLowerCase() === left.toLowerCase()
      );
      const rightNarrative = narratives.find(
        (item) => item.key.toLowerCase() === right.toLowerCase()
      );

      if (!leftNarrative || !rightNarrative) {
        return buildResult(
          false,
          routed.intent,
          routed.agent,
          "Comparison Not Available",
          "One or both sides were not found in the current radar feed.",
          `The left side requested was ${left}, and the right side requested was ${right}. At least one of them does not exist in the current structured radar output.`,
          "This matters because a comparison should be based on actual live narrative grouping, not on guessed assumptions outside the feed.",
          "The cleanest way forward is to compare narratives that are currently visible in the radar layer, because that keeps the result tied to real market structure.",
          [
            "> openclaw route ready",
            `Agent selected: ${routed.agent}`,
            `Left: ${left}`,
            `Right: ${right}`,
            "> execution failed",
          ]
        );
      }

      return buildCompareResult(
        routed.intent,
        routed.agent,
        leftNarrative,
        rightNarrative
      );
    }

    if (routed.agent === "StrategyAgent") {
      const selectedNarrative = findNarrativeByTopic(
        narratives,
        routed.args?.topic
      );

      return buildStrategyResult(
        routed.intent,
        routed.agent,
        selectedNarrative,
        routed.args?.topic,
        routed.args?.followupType
      );
    }

    if (routed.agent === "LearningAgent") {
      return buildLearningResult(
        routed.intent,
        routed.agent,
        command,
        routed.args?.topic,
        narratives
      );
    }

    if (routed.agent === "StudioAgent") {
      return buildStudioResult(
        routed.intent,
        routed.agent,
        options?.studioTopic || routed.args?.topic,
        routed.args?.followupType,
        options?.studioPrompt,
        options?.studioMode,
        options?.regenerateVersion || 0
      );
    }

    return buildReasoningFallbackResult(
      routed.intent,
      routed.agent,
      routed.args?.topic
    );
  } catch (error) {
    console.error("OPENCLAW_EXECUTOR_ERROR", error);

    return buildResult(
      false,
      routed.intent,
      routed.agent,
      "Execution Error",
      "OpenClaw execution failed unexpectedly.",
      "An exception occurred during local execution, which means the request reached the correct path but something inside the processing flow broke before completion.",
      "When this happens, the issue is usually inside executor logic, radar fetching, or local backend connectivity rather than in the user request itself.",
      "The important part is that the route is already wired correctly. What needs attention now is execution stability, not the overall OpenClaw architecture.",
      [
        "> openclaw route ready",
        `Agent selected: ${routed.agent}`,
        "Unhandled execution error",
        "> execution failed",
      ]
    );
  }
}