import type { StatusLevel } from "./types";

interface StatusCopy {
  /** Short headline shown by the gauge. Gentle, non-judgmental. */
  headline: string;
  /** One supportive sentence. */
  body: string;
  /** Semantic color token for the gauge ring. */
  tone: "calm" | "steady" | "warm" | "amber" | "alert";
}

export const STATUS_COPY: Record<StatusLevel, StatusCopy> = {
  fresh: {
    headline: "Plenty in the tank",
    body: "You've got lots of room today. No need to rush.",
    tone: "calm",
  },
  comfortable: {
    headline: "Comfortable",
    body: "A good, sustainable pace. Keep checking in with yourself.",
    tone: "steady",
  },
  filling: {
    headline: "Filling up",
    body: "You're using a fair bit of energy. Worth pacing what's next.",
    tone: "warm",
  },
  near: {
    headline: "Near your limit",
    body: "You're close to full. A break soon will help you land gently.",
    tone: "amber",
  },
  over: {
    headline: "Over capacity",
    body: "You've gone past your limit. That's okay — let's make space to recover.",
    tone: "alert",
  },
};

/** Maps a tone to an oklch color for the gauge, tuned to stay soft. */
export const TONE_COLOR: Record<StatusCopy["tone"], string> = {
  calm: "oklch(0.70 0.10 175)",
  steady: "oklch(0.68 0.11 150)",
  warm: "oklch(0.74 0.11 90)",
  amber: "oklch(0.74 0.13 65)",
  alert: "oklch(0.66 0.16 30)",
};
