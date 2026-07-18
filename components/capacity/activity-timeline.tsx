"use client";

import { Check, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Activity, CATEGORIES, minutesOf } from "@/lib/capacity";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities: Activity[];
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}

/** Timed activities first (in clock order), then untimed by creation order. */
function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const ma = minutesOf(a.time);
    const mb = minutesOf(b.time);
    if (ma !== null && mb !== null) return ma - mb;
    if (ma !== null) return -1;
    if (mb !== null) return 1;
    return a.createdAt - b.createdAt;
  });
}

export function ActivityTimeline({
  activities,
  onToggleDone,
  onRemove,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nothing logged yet. Add the things you've done and plan to do — big and
        small both count.
      </p>
    );
  }

  const sorted = sortActivities(activities);

  return (
    <ul className="flex flex-col">
      {sorted.map((a) => (
        <ActivityRow
          key={a.id}
          activity={a}
          onToggleDone={onToggleDone}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

function ActivityRow({
  activity: a,
  onToggleDone,
  onRemove,
}: {
  activity: Activity;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const cat = CATEGORIES[a.category];
  const Icon = cat.icon;

  return (
    <li className="group flex items-center gap-3 border-t border-border/60 py-3 first:border-t-0">
      <button
        type="button"
        onClick={() => onToggleDone(a.id, !a.done)}
        aria-label={a.done ? "Mark as not done" : "Mark as done"}
        aria-pressed={a.done}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          a.done
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-border text-transparent hover:border-primary",
        )}
      >
        <Check className="size-3.5" />
      </button>

      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in oklch, ${cat.color} 18%, transparent)`,
        }}
        aria-hidden
      >
        <Icon className="size-4" style={{ color: cat.color }} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium",
            a.done && "text-muted-foreground line-through",
          )}
        >
          {a.name}
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {a.time && <span className="tabular-nums">{a.time}</span>}
          {a.time && <span aria-hidden>·</span>}
          <span>{cat.label}</span>
          {a.kind === "unplanned" && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="size-3" />
              Unplanned
            </Badge>
          )}
        </span>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          a.restorative
            ? "text-[color:oklch(0.66_0.11_170)]"
            : "text-foreground",
        )}
        title={a.restorative ? "Restores energy" : "Spends energy"}
      >
        {a.restorative ? "+" : "−"}
        {a.intensity}
      </span>

      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove ${a.name}`}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={() => onRemove(a.id)}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
