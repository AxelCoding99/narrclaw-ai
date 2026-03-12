import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <Link href="/" className="text-3xl font-semibold tracking-tight">
            Binance <span className="text-primary">NarrAI</span>
          </Link>

          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            AI-powered crypto intelligence terminal for narratives, strategy,
            learning, and content workflows. Built as a research-first
            workspace powered by OpenClaw.
          </p>

          <Link
            href="/console"
            className="mt-6 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:brightness-110"
          >
            Watermark: @AXLC_TRADES
          </Link>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Modules
          </div>

          <div className="mt-5 space-y-3 text-base text-muted-foreground">
            <div>
              <Link href="/radar" className="transition hover:text-foreground">
                Narrative Radar
              </Link>
            </div>
            <div>
              <Link href="/strategy" className="transition hover:text-foreground">
                Strategy Lab
              </Link>
            </div>
            <div>
              <Link href="/console" className="transition hover:text-foreground">
                Agent Console
              </Link>
            </div>
            <div>
              <Link href="/studio" className="transition hover:text-foreground">
                Content Studio
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Positioning
          </div>

          <div className="mt-5 space-y-3 text-base text-muted-foreground">
            <div>
              <Link href="/radar" className="transition hover:text-foreground">
                Crypto Intelligence
              </Link>
            </div>
            <div>
              <Link href="/console" className="transition hover:text-foreground">
                AI Research Workspace
              </Link>
            </div>
            <div>
              <Link href="/console" className="transition hover:text-foreground">
                OpenClaw-Powered
              </Link>
            </div>
            <div>
              <Link href="/" className="transition hover:text-foreground">
                Binance-style UX
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© 2026 NarrAI Terminal. Designed for AI-native crypto workflows.</div>

          <Link
            href="/console"
            className="font-medium text-primary transition hover:brightness-110"
          >
            @axlc_trades
          </Link>
        </div>
      </div>
    </footer>
  );
}