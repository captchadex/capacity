import type {
  Activity,
  BreakSuggestion,
  CapacitySummary,
  StatusLevel,
} from "./types";

/** Local "YYYY-MM-DD" for a given date (defaults to now). */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Minutes since midnight for an "HH:MM" string, or null if absent/invalid. */
export function minutesOf(time?: string): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** "HH:MM" from minutes since midnight, clamped to a single day. */
export function timeOf(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const LEVEL_BOUNDS: [StatusLevel, number][] = [
  ["fresh", 50],
  ["comfortable", 75],
  ["filling", 90],
  ["near", 100],
];

function levelFor(percent: number): StatusLevel {
  for (const [level, bound] of LEVEL_BOUNDS) {
    if (percent < bound) return level;
  }
  return "over";
}

export function summarize(
  activities: Activity[],
  dailyCapacity: number,
): CapacitySummary {
  let spent = 0;
  let restored = 0;
  let plannedSpent = 0;
  let unplannedSpent = 0;

  for (const a of activities) {
    if (a.restorative) {
      restored += a.intensity;
    } else {
      spent += a.intensity;
      if (a.kind === "unplanned") unplannedSpent += a.intensity;
      else plannedSpent += a.intensity;
    }
  }

  const net = Math.max(0, spent - restored);
  const capacity = Math.max(1, dailyCapacity);
  const remaining = capacity - net;
  const percent = (net / capacity) * 100;

  return {
    spent,
    restored,
    net,
    capacity,
    remaining,
    percent,
    level: levelFor(percent),
    plannedSpent,
    unplannedSpent,
  };
}

/**
 * Rotating, low-demand decompression ideas. Kept sensory-aware and concrete so
 * there's no extra decision-making required to act on them.
 */
export const DECOMPRESSION_IDEAS = [
  "Step outside for some fresh air",
  "Put on noise-cancelling headphones and sit quietly",
  "Dim the lights and rest your eyes",
  "Do a slow stim you enjoy",
  "Drink some water and stretch",
  "Lie down under a weighted blanket",
  "Take ten slow breaths",
  "Listen to one favourite song with your eyes closed",
  "Splash cool water on your face",
  "Wrap up in something soft and cosy",
];

/** Break gets longer the deeper into depletion you are. */
function breakDuration(step: number): number {
  return Math.min(30, 10 + step * 5);
}

/**
 * Suggest decompression breaks. Two strategies combine:
 *  - Timeline-aware: walk timed activities in order and drop a break each time
 *    cumulative drain crosses a fatigue step, placed right after the activity
 *    that pushed you over.
 *  - Fallback: if you're at/over the fatigue point but have little timing info,
 *    suggest a break "as soon as you can".
 */
export function suggestBreaks(
  activities: Activity[],
  dailyCapacity: number,
): BreakSuggestion[] {
  const summary = summarize(activities, dailyCapacity);
  const capacity = summary.capacity;

  // Start suggesting once ~75% of the day's capacity is spent.
  const fatiguePoint = capacity * 0.75;
  if (summary.net < fatiguePoint) return [];

  // One break per third of a full day's capacity (min 3 units between breaks).
  const step = Math.max(3, capacity / 3);

  const suggestions: BreakSuggestion[] = [];
  let ideaIdx = 0;
  const nextIdea = () => {
    const idea = DECOMPRESSION_IDEAS[ideaIdx % DECOMPRESSION_IDEAS.length];
    ideaIdx += 1;
    return idea;
  };

  const timed = activities
    .flatMap((a) => {
      const start = minutesOf(a.time);
      return !a.restorative && start !== null ? [{ activity: a, start }] : [];
    })
    .sort((x, y) => x.start - y.start);

  let running = 0;
  let threshold = fatiguePoint;
  let stepIndex = 0;

  for (const { activity: a, start } of timed) {
    running += a.intensity;
    while (running >= threshold) {
      const endMin = start + (a.durationMin ?? 0);
      suggestions.push({
        id: `brk-${threshold}`,
        time: timeOf(endMin + 2),
        durationMin: breakDuration(stepIndex),
        idea: nextIdea(),
        reason: `You'll have spent about ${Math.round(threshold)} units by after "${a.name}".`,
      });
      threshold += step;
      stepIndex += 1;
    }
  }

  // If drain lives mostly in untimed activities (or you're already over),
  // make sure there's at least one actionable "now" break.
  if (suggestions.length === 0) {
    suggestions.push({
      id: "brk-now",
      time: undefined,
      durationMin: breakDuration(0),
      idea: nextIdea(),
      reason:
        summary.level === "over"
          ? "You're over your capacity for today."
          : "You're getting close to your limit.",
    });
  }

  // If over capacity, ensure a longer recovery break is offered at the end.
  if (summary.level === "over") {
    suggestions.push({
      id: "brk-recover",
      time: undefined,
      durationMin: 30,
      idea: "Protect a longer block to fully decompress before anything else",
      reason: `You're about ${Math.round(summary.net - capacity)} unit(s) past your limit.`,
    });
  }

  return suggestions;
}
