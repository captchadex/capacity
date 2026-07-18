// Core domain types for the capacity tracker.
// The mental model borrows from "spoon theory": you start the day with a finite
// amount of energy, and every activity spends or restores some of it.

export type CategoryId =
  | "focus"
  | "social"
  | "sensory"
  | "physical"
  | "admin"
  | "transition"
  | "rest";

/** Whether an activity was scheduled ahead of time or came up unexpectedly. */
export type ActivityKind = "planned" | "unplanned";

export interface Activity {
  id: string;
  name: string;
  category: CategoryId;
  /** 1–5. For draining activities this is energy spent; for restorative, energy given back. */
  intensity: number;
  /** Restorative activities recharge capacity instead of spending it. */
  restorative: boolean;
  kind: ActivityKind;
  /** Local day this belongs to, "YYYY-MM-DD". Used to scope the view to today. */
  date: string;
  /** Optional clock time, "HH:MM" (24h). */
  time?: string;
  /** Optional duration in minutes, used to place breaks after an activity ends. */
  durationMin?: number;
  note?: string;
  /** Marked done by the user. Purely informational — cost still counts. */
  done: boolean;
  createdAt: number;
}

export interface CapacityState {
  /** Total energy units available for a day. */
  dailyCapacity: number;
  activities: Activity[];
}

export type StatusLevel = "fresh" | "comfortable" | "filling" | "near" | "over";

export interface CapacitySummary {
  spent: number;
  restored: number;
  /** Net energy used, never below 0 (restorative can't make you "more than rested"). */
  net: number;
  capacity: number;
  remaining: number;
  /** 0–100+, net as a percentage of capacity. Can exceed 100 when over. */
  percent: number;
  level: StatusLevel;
  plannedSpent: number;
  unplannedSpent: number;
}

export interface BreakSuggestion {
  id: string;
  /** "HH:MM" when the break is suggested, or undefined for "as soon as you can". */
  time?: string;
  durationMin: number;
  idea: string;
  /** Short reason this break is being suggested here. */
  reason: string;
}
