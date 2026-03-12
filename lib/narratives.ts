export type NarrativeKey =
  | "AI"
  | "RWA"
  | "DePIN"
  | "DeFi"
  | "Layer1"
  | "Layer2"
  | "Gaming"
  | "Memes"
  | "Infrastructure";

export const NARRATIVE_MAP: Record<string, NarrativeKey> = {
  btc: "Layer1",
  eth: "Layer1",
  sol: "Layer1",
  sui: "Layer1",
  apt: "Layer1",

  arb: "Layer2",
  op: "Layer2",
  manta: "Layer2",

  tao: "AI",
  fet: "AI",
  rndr: "AI",
  agix: "AI",
  near: "AI",

  ondo: "RWA",
  cfg: "RWA",
  polyx: "RWA",

  hnt: "DePIN",
  akt: "DePIN",
  iotx: "DePIN",

  aave: "DeFi",
  uni: "DeFi",
  dydx: "DeFi",
  pendle: "DeFi",
  hype: "DeFi",

  imx: "Gaming",
  gala: "Gaming",
  beam: "Gaming",

  pepe: "Memes",
  bonk: "Memes",
  doge: "Memes",
  wif: "Memes",
  pengu: "Memes",

  ar: "Infrastructure",
  fil: "Infrastructure",
  pi: "Infrastructure",
};

export function getNarrative(symbol: string): NarrativeKey | null {
  return NARRATIVE_MAP[symbol.toLowerCase()] || null;
}