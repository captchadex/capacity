"use client";

import { type CapacitySummary, STATUS_COPY, TONE_COLOR } from "@/lib/capacity";
import { cn } from "@/lib/utils";

interface CapacityGaugeProps {
  summary: CapacitySummary;
}

export function CapacityGauge({ summary }: CapacityGaugeProps) {
  const copy = STATUS_COPY[summary.level];
  const color = TONE_COLOR[copy.tone];

  const size = 200;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ring fills to net/capacity, capped visually at 100%.
  const filled = Math.min(1, summary.percent / 100);
  const offset = circumference * (1 - filled);

  const remainingLabel = Math.max(0, summary.remaining);
  const over = summary.level === "over";

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${Math.round(summary.percent)} percent of your capacity used. ${copy.headline}.`}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <title>Capacity ring</title>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset,stroke] duration-700 ease-out motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-semibold tabular-nums tracking-tight"
            style={{ color }}
          >
            {over ? "0" : remainingLabel}
          </span>
          <span className="mt-1 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            {over ? "Over limit" : "Units left"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-wide">
            {copy.headline}
          </h2>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {copy.body}
          </p>
        </div>
        <dl className="flex gap-6 tabular-nums">
          <Stat label="Spent" value={summary.spent} />
          <Stat label="Restored" value={summary.restored} tone="calm" />
          <Stat label="Capacity" value={summary.capacity} muted />
        </dl>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: number;
  tone?: "calm";
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <dd
        className={cn(
          "text-2xl font-semibold",
          muted && "text-muted-foreground",
        )}
        style={tone === "calm" ? { color: TONE_COLOR.calm } : undefined}
      >
        {value}
      </dd>
      <dt className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
    </div>
  );
}
