"use client";

import { Minus, Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dayKey,
  suggestBreaks,
  summarize,
  useCapacityStore,
} from "@/lib/capacity";
import { ActivityTimeline } from "./activity-timeline";
import { AddActivity } from "./add-activity";
import { BreakSuggestions } from "./break-suggestions";
import { CapacityGauge } from "./capacity-gauge";

function prettyDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function Dashboard() {
  const store = useCapacityStore();

  const summary = useMemo(
    () => summarize(store.today, store.dailyCapacity),
    [store.today, store.dailyCapacity],
  );
  const breaks = useMemo(
    () => suggestBreaks(store.today, store.dailyCapacity),
    [store.today, store.dailyCapacity],
  );

  // Avoid a hydration flash: render a calm placeholder until storage is read.
  if (!store.ready) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center justify-center px-5">
        <Sparkles className="size-5 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-10 sm:py-14">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-wide">
            Capacity
          </h1>
          <p className="text-sm text-muted-foreground">{prettyDate()}</p>
        </div>
        <CapacityStepper
          value={store.dailyCapacity}
          onChange={store.setDailyCapacity}
        />
      </header>

      <Card>
        <CardContent>
          <CapacityGauge summary={summary} />
          {summary.unplannedSpent > 0 && (
            <p className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              {summary.unplannedSpent} of {summary.spent} units spent went to
              unplanned things. Unexpected demands are genuinely more tiring —
              be kind to yourself about it.
            </p>
          )}
        </CardContent>
      </Card>

      <BreakSuggestions suggestions={breaks} onTakeBreak={store.addActivity} />

      <Card>
        <CardHeader>
          <CardTitle>Add an activity</CardTitle>
        </CardHeader>
        <CardContent>
          <AddActivity onAdd={store.addActivity} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Today</CardTitle>
          {store.today.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear all of today's activities? This can't be undone.",
                  )
                ) {
                  store.clearToday();
                }
              }}
            >
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ActivityTimeline
            activities={store.today}
            onToggleDone={(id, done) => store.updateActivity(id, { done })}
            onRemove={store.removeActivity}
          />
        </CardContent>
      </Card>

      <footer className="pb-6 text-center text-xs text-muted-foreground">
        Everything stays on this device. A fresh day starts automatically —
        today is {dayKey()}.
      </footer>
    </div>
  );
}

function CapacityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
        Daily capacity
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Lower daily capacity"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus />
        </Button>
        <span className="w-8 text-center text-lg font-semibold tabular-nums">
          {value}
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Raise daily capacity"
          onClick={() => onChange(Math.min(60, value + 1))}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
