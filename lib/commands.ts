export type NarrAICommand = {
  id: string;
  label: string;
  prompt: string;
  href: string;
  category: "radar" | "strategy" | "studio" | "learning" | "console";
};

export const COMMANDS: NarrAICommand[] = [
  {
    id: "radar-ai",
    label: "/radar ai",
    prompt: "/radar ai",
    href: "/console?q=%2Fradar%20ai",
    category: "radar",
  },
  {
    id: "radar-rwa",
    label: "/radar rwa",
    prompt: "/radar rwa",
    href: "/console?q=%2Fradar%20rwa",
    category: "radar",
  },
  {
    id: "radar-top",
    label: "show top narrative",
    prompt: "show top narrative",
    href: "/console?q=show%20top%20narrative",
    category: "radar",
  },
  {
    id: "compare-ai-rwa",
    label: "compare ai vs rwa",
    prompt: "compare ai vs rwa",
    href: "/console?q=compare%20ai%20vs%20rwa",
    category: "console",
  },
  {
    id: "compare-defi-l1",
    label: "compare defi vs layer 1",
    prompt: "compare defi vs layer 1",
    href: "/console?q=compare%20defi%20vs%20layer%201",
    category: "console",
  },
  {
    id: "strategy-ai",
    label: "/strategy ai",
    prompt: "/strategy ai",
    href: "/console?q=%2Fstrategy%20ai",
    category: "strategy",
  },
  {
    id: "strategy-btc",
    label: "/strategy btc",
    prompt: "/strategy btc",
    href: "/console?q=%2Fstrategy%20btc",
    category: "strategy",
  },
  {
    id: "learn-depin",
    label: "/learn depin",
    prompt: "/learn depin",
    href: "/console?q=%2Flearn%20depin",
    category: "learning",
  },
  {
    id: "learn-ai",
    label: "/learn ai",
    prompt: "/learn ai",
    href: "/console?q=%2Flearn%20ai",
    category: "learning",
  },
  {
    id: "studio-thread",
    label: "/studio create thread",
    prompt: "/studio create thread",
    href: "/console?q=%2Fstudio%20create%20thread",
    category: "studio",
  },
];