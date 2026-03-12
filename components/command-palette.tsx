"use client";

import { useEffect } from "react";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export default function CommandPalette({
  open,
  onClose,
}: CommandPaletteProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[120px] backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          NarrAI Command
        </div>

        <div className="p-4">
          <input
            autoFocus
            type="text"
            placeholder="Ask NarrAI anything..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div>/radar ai — show strongest narrative</div>
            <div>/strategy btc — generate trade setup</div>
            <div>/signals rwa — show sector momentum</div>
          </div>
        </div>
      </div>
    </div>
  );
}