"use client";

import { CalendarClock, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  type ActivityKind,
  CATEGORIES,
  CATEGORY_LIST,
  type CategoryId,
  type NewActivity,
} from "@/lib/capacity";
import { cn } from "@/lib/utils";

interface AddActivityProps {
  onAdd: (activity: NewActivity) => void;
}

const INTENSITY_LABELS = [
  "Very light",
  "Light",
  "Moderate",
  "Heavy",
  "Draining",
];

export function AddActivity({ onAdd }: AddActivityProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ActivityKind>("planned");
  const [category, setCategory] = useState<CategoryId>("focus");
  const [intensity, setIntensity] = useState(3);
  const [restorative, setRestorative] = useState(false);
  const [time, setTime] = useState("");

  function pickCategory(id: CategoryId) {
    setCategory(id);
    // Nudge the recharge toggle to a sensible default for the category.
    setRestorative(CATEGORIES[id].restorativeByDefault);
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      kind,
      category,
      intensity,
      restorative,
      time: time || undefined,
    });
    // Reset the parts that vary per-entry; keep kind/category for fast repeat entry.
    setName("");
    setIntensity(3);
    setTime("");
  }

  const restoreVerb = restorative ? "restores" : "spends";

  return (
    <div className="flex flex-col gap-5">
      {/* Planned vs unplanned */}
      <div className="flex gap-2">
        <SegButton
          active={kind === "planned"}
          onClick={() => setKind("planned")}
        >
          <CalendarClock className="size-3.5" />
          Planned
        </SegButton>
        <SegButton
          active={kind === "unplanned"}
          onClick={() => setKind("unplanned")}
        >
          <Zap className="size-3.5" />
          Unplanned
        </SegButton>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="What is it? e.g. team meeting, groceries, a nap"
        aria-label="Activity name"
        className="text-base"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={category}
            onValueChange={(v) => pickCategory(v as CategoryId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_LIST.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden
                  />
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Time (optional)">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
        </Field>
      </div>

      <Field
        label={`Energy — ${INTENSITY_LABELS[intensity - 1]} (${restoreVerb} ${intensity})`}
      >
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIntensity(n)}
              aria-label={`Energy level ${n}`}
              aria-pressed={intensity === n}
              className={cn(
                "h-9 flex-1 rounded-none border text-sm font-semibold tabular-nums transition-colors",
                intensity >= n
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex items-center justify-between gap-4">
        <span className="flex flex-col">
          <span className="text-sm font-medium" id="recharge-label">
            This recharges me
          </span>
          <span className="text-xs text-muted-foreground">
            Restorative things give energy back instead of using it.
          </span>
        </span>
        <Switch
          aria-labelledby="recharge-label"
          checked={restorative}
          onCheckedChange={(v) => setRestorative(Boolean(v))}
        />
      </div>

      <Button onClick={submit} disabled={!name.trim()} className="w-full">
        <Plus />
        Add to today
      </Button>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border py-2 text-xs font-semibold tracking-widest uppercase transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
