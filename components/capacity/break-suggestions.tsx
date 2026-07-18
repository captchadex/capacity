"use client";

import { Coffee, Plus, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BreakSuggestion, NewActivity } from "@/lib/capacity";

interface BreakSuggestionsProps {
  suggestions: BreakSuggestion[];
  onTakeBreak: (activity: NewActivity) => void;
}

export function BreakSuggestions({
  suggestions,
  onTakeBreak,
}: BreakSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <section
      aria-label="Suggested breaks"
      className="flex flex-col gap-4 border border-[color:var(--break-accent)]/30 bg-[color:var(--break-accent)]/5 p-6"
      style={
        { "--break-accent": "oklch(0.70 0.10 175)" } as React.CSSProperties
      }
    >
      <header className="flex items-center gap-2">
        <Wind className="size-4 text-[color:var(--break-accent)]" />
        <h3 className="font-heading text-sm font-semibold tracking-widest uppercase">
          Time to decompress
        </h3>
      </header>
      <p className="-mt-2 text-sm leading-relaxed text-muted-foreground">
        You're near or over your capacity. Here are some gentle breaks — add one
        to today when you're ready.
      </p>

      <ul className="flex flex-col gap-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 border-t border-border/60 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <Coffee className="mt-0.5 size-4 shrink-0 text-[color:var(--break-accent)]" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{s.idea}</span>
                <span className="text-xs text-muted-foreground">
                  {s.time ? `Around ${s.time}` : "As soon as you can"} ·{" "}
                  {s.durationMin} min · {s.reason}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              className="self-start sm:self-center"
              onClick={() =>
                onTakeBreak({
                  name: s.idea,
                  category: "rest",
                  intensity: Math.max(1, Math.round(s.durationMin / 10)),
                  restorative: true,
                  kind: "planned",
                  time: s.time,
                })
              }
            >
              <Plus />
              Add break
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
