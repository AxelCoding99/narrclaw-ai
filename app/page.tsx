"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import { COMMANDS } from "../lib/commands";
import {
  ArrowRight,
  Brain,
  CandlestickChart,
  CheckCircle2,
  FileText,
  GraduationCap,
  Radar,
  Sparkles,
  TerminalSquare,
  Waves,
  Zap,
  Orbit,
  Activity,
  BarChart3,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { motion } from "framer-motion";

function AnimatedGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(234,236,239,0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(234,236,239,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }}
    />
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-140px] top-[-140px] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.75, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-120px] top-[120px] h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -18, 0], opacity: [0.25, 0.65, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-140px] left-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
      />
    </div>
  );
}

function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Powered by OpenClaw
    </motion.div>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border bg-background/60 px-4 py-4 backdrop-blur-sm"
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
    </motion.div>
  );
}

function QuickCommand({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
    >
      {label}
    </Link>
  );
}

function BenefitChip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 text-primary" />
      {children}
    </div>
  );
}

function FloatingNode({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    />
  );
}

function TerminalPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <FloatingNode className="absolute -left-6 top-16 h-16 w-16 rounded-2xl border border-primary/20 bg-primary/10 blur-[1px]" />
      <FloatingNode className="absolute -right-4 top-10 h-12 w-12 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-[1px]" delay={1} />
      <FloatingNode className="absolute bottom-8 -left-4 h-10 w-10 rounded-full border border-blue-400/20 bg-blue-400/10 blur-[1px]" delay={2} />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[34px] border border-border bg-card/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-white/5" />
        <div className="pointer-events-none absolute -right-12 top-8 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                OpenClaw Session
              </p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">
                NarrAI Intelligence Terminal
              </h3>
            </div>
          </div>

          <motion.div
            animate={{
              boxShadow: [
                "0 0 0px rgba(252,213,53,0)",
                "0 0 18px rgba(252,213,53,0.18)",
                "0 0 0px rgba(252,213,53,0)",
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            LIVE
          </motion.div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 text-xs text-muted-foreground">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
              Radar Active
            </span>
            <span className="rounded-full border border-border px-2.5 py-1">
              Strategy Ready
            </span>
            <span className="rounded-full border border-border px-2.5 py-1">
              Studio Ready
            </span>
            <span className="rounded-full border border-border px-2.5 py-1">
              Learning On
            </span>
          </div>

          <motion.div
            animate={{ borderColor: ["rgba(255,255,255,0.08)", "rgba(252,213,53,0.20)", "rgba(255,255,255,0.08)"] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="rounded-2xl border bg-card p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Radar className="h-4 w-4" />
              Active Narrative
            </div>
            <div className="text-lg font-semibold text-foreground">
              AI Infrastructure
            </div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Capital rotation and developer attention are clustering around AI,
              while breadth remains healthier than weaker single-coin moves.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label="Momentum" value="+38%" />
            <StatPill label="Confidence" value="82 / 100" />
            <StatPill label="Risk" value="Medium" />
          </div>

          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                AI Output
              </div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Structured response
              </div>
            </div>

            <div className="space-y-2 text-sm leading-7 text-muted-foreground">
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.2 }}
              >
                Watch continuation only if sector strength stays broad.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.32 }}
              >
                Prefer stronger leaders over late entries in weaker names.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.44 }}
              >
                Best workflow: Radar → Strategy → Console → Studio.
              </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <QuickCommand
              href={`/console?q=${encodeURIComponent(
                "generate strategy for AI infrastructure with conservative risk mode"
              )}`}
              label="Generate Strategy"
            />
            <QuickCommand
              href={`/console?q=${encodeURIComponent(
                "turn AI infrastructure narrative into a Binance Square post"
              )}`}
              label="Create Post"
            />
            <QuickCommand
              href={`/console?q=${encodeURIComponent(
                "explain AI infrastructure narrative in simple language"
              )}`}
              label="Explain Simpler"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  benefit,
  href,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[28px] border border-border bg-card/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_40px_rgba(252,213,53,0.08)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="relative z-10 text-xl font-semibold text-foreground">
        {title}
      </h3>

      <p className="relative z-10 mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>

      <div className="relative z-10 mt-4 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground">
        {benefit}
      </div>

      <div className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
        Open module
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function WorkflowCard({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[26px] border border-border bg-card/80 p-5 transition hover:-translate-y-1 hover:border-primary/30"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {number}
      </div>
      <div className="mt-3 text-xl font-semibold text-foreground">{title}</div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}

function BenefitPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card/80 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <AmbientBackground />
      <AnimatedGrid />
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center xl:gap-14">
          <div className="relative z-10">
            <HeroBadge />

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.06 }}
              className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl"
            >
              Read the market narrative
              <br />
              before it becomes obvious.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.14 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
            >
              NarrAI helps Binance users understand where attention is rotating,
              build clearer trade setups, ask deeper AI follow-ups, and turn
              market context into content with OpenClaw.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/radar"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[0_0_24px_rgba(252,213,53,0.18)] transition hover:scale-[1.02] hover:opacity-90"
              >
                Open Radar
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/strategy"
                className="rounded-2xl border border-border bg-card/60 px-5 py-3 font-semibold text-foreground backdrop-blur-sm transition hover:border-primary hover:text-primary"
              >
                Explore Strategy Lab
              </Link>

              <Link
                href="/console"
                className="rounded-2xl border border-border bg-card/60 px-5 py-3 font-semibold text-foreground backdrop-blur-sm transition hover:border-primary hover:text-primary"
              >
                Open Console
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <BenefitChip>Find narrative rotation faster</BenefitChip>
              <BenefitChip>Reduce Binance tab switching</BenefitChip>
              <BenefitChip>Move from signal to strategy</BenefitChip>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34 }}
              className="mt-8 max-w-2xl rounded-2xl border border-border bg-card/70 p-3 backdrop-blur-sm shadow-[0_0_20px_rgba(252,213,53,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  Suggested prompt
                </div>
                <div className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Terminal Mode
                </div>
              </div>

              <Link
                href={COMMANDS[0].href}
                className="mt-3 block rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                {COMMANDS[0].prompt}
              </Link>

              <div className="mt-3 flex flex-wrap gap-2">
                {COMMANDS.slice(1, 5).map((command) => (
                  <QuickCommand
                    key={command.id}
                    href={command.href}
                    label={command.label}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 lg:-translate-y-1">
            <TerminalPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BenefitPanel
            icon={<Radar className="h-4 w-4" />}
            title="Narrative rotation"
            description="See sector-level attention shifts like AI, RWA, and DePIN instead of only watching single Binance pairs."
          />
          <BenefitPanel
            icon={<CandlestickChart className="h-4 w-4" />}
            title="Structured strategy"
            description="Turn narrative momentum into thesis, bias, trigger, invalidation, and risk without building it manually."
          />
          <BenefitPanel
            icon={<Brain className="h-4 w-4" />}
            title="Follow-up reasoning"
            description="Ask AI deeper questions after a signal instead of restarting research from zero every time."
          />
          <BenefitPanel
            icon={<FileText className="h-4 w-4" />}
            title="Content workflow"
            description="Convert insight into Binance Square posts, briefs, and threads without switching between separate tools."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            One terminal. Five modules. One AI engine.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Built for traders, researchers, creators, and Binance-native users
            who need more than charts and isolated prompts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            icon={<Radar className="h-5 w-5" />}
            title="Narrative Radar"
            description="Track rising sectors like AI, RWA, DePIN, DeFi, memes, and more with live grouped market intelligence."
            benefit="Best for seeing what is moving before it becomes obvious on Binance."
            href="/radar"
          />

          <FeatureCard
            icon={<CandlestickChart className="h-5 w-5" />}
            title="Strategy Lab"
            description="Generate cleaner, risk-aware trade thinking from live narrative context."
            benefit="Best for deciding how to think about a setup, not just what is pumping."
            href="/strategy"
          />

          <FeatureCard
            icon={<TerminalSquare className="h-5 w-5" />}
            title="Agent Console"
            description="Interact with OpenClaw through a terminal-style interface and ask deeper follow-up questions."
            benefit="Best for deeper reasoning when Radar alone is not enough."
            href="/console"
          />

          <FeatureCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Learning Atlas"
            description="Explain crypto narratives in simpler language for beginners or faster team understanding."
            benefit="Best for users who understand the move but still need clearer context."
            href="/learning"
          />

          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Content Studio"
            description="Turn strategies and market narratives into Binance Square posts, briefs, and threads."
            benefit="Best for creators, researchers, and market communicators."
            href="/studio"
          />

          <FeatureCard
            icon={<Orbit className="h-5 w-5" />}
            title="OpenClaw Engine"
            description="The orchestration layer that routes commands, context, and reasoning across every module."
            benefit="This is what makes NarrAI feel like one connected intelligence product."
            href="/console"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card/90 p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="mb-8 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Workflow
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                From market signal to action
              </h3>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                NarrAI is designed to reduce scattered crypto workflow and make
                the path from discovery to decision feel natural.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              <WorkflowCard
                number="01"
                title="Scan Radar"
                description="See which narrative is leading and where market attention is rotating."
                href="/radar"
              />
              <WorkflowCard
                number="02"
                title="Build Strategy"
                description="Turn the narrative into a clearer thesis and risk-aware setup."
                href="/strategy"
              />
              <WorkflowCard
                number="03"
                title="Ask in Console"
                description="Go deeper with follow-up questions while keeping context."
                href="/console"
              />
              <WorkflowCard
                number="04"
                title="Publish with Studio"
                description="Convert the setup into a post, brief, or thread."
                href="/studio"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-border bg-card/85 p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Workflow className="h-4 w-4" />
              Why OpenClaw matters
            </div>

            <h3 className="mt-4 text-3xl font-semibold tracking-tight">
              Binance shows the market.
              <br />
              OpenClaw helps interpret it.
            </h3>

            <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              Binance gives access, charts, and pairs. NarrAI adds the missing
              intelligence layer: narrative understanding, strategy framing,
              context-aware follow-ups, and faster content workflows.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">See the narrative,</span>{" "}
                not just the candle.
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Keep context,</span>{" "}
                not just isolated prompts.
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Move from signal to content,</span>{" "}
                in one connected flow.
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Use AI as a market layer,</span>{" "}
                not just a chatbot.
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-card/85 p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Activity className="h-4 w-4" />
              What users can do
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Detect narrative leaders faster
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Compare sectors before entering trades
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Generate risk-aware strategy drafts
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Explain concepts for beginners or communities
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Turn analysis into Binance Square content
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Stay inside one AI-native workspace
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <QuickCommand href="/radar" label="Radar" />
              <QuickCommand href="/strategy" label="Strategy" />
              <QuickCommand href="/console" label="Console" />
              <QuickCommand href="/learning" label="Learning" />
              <QuickCommand href="/studio" label="Studio" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}