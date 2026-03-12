import { Suspense } from "react";
import ConsoleClient from "./console-client";

function ConsolePageFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl border border-border bg-card/80 p-6 text-sm text-muted-foreground">
          Loading console...
        </div>
      </div>
    </main>
  );
}

export default function ConsolePage() {
  return (
    <Suspense fallback={<ConsolePageFallback />}>
      <ConsoleClient />
    </Suspense>
  );
}