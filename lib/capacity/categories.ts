import {
  Briefcase,
  ClipboardList,
  Footprints,
  Leaf,
  type LucideIcon,
  Repeat,
  Users,
  Waves,
} from "lucide-react";

import type { CategoryId } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Plain-language hint of what belongs here. */
  hint: string;
  icon: LucideIcon;
  /** Categories that usually restore energy default the "recharges me" toggle on. */
  restorativeByDefault: boolean;
  /** oklch accent used for the category dot. Warm, low-saturation to stay calm. */
  color: string;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  focus: {
    id: "focus",
    label: "Focus",
    hint: "Deep work, studying, anything demanding attention",
    icon: Briefcase,
    restorativeByDefault: false,
    color: "oklch(0.62 0.13 258)",
  },
  social: {
    id: "social",
    label: "Social",
    hint: "Meetings, calls, seeing people, masking",
    icon: Users,
    restorativeByDefault: false,
    color: "oklch(0.66 0.15 20)",
  },
  sensory: {
    id: "sensory",
    label: "Sensory",
    hint: "Loud, bright, busy, or otherwise overstimulating",
    icon: Waves,
    restorativeByDefault: false,
    color: "oklch(0.64 0.13 300)",
  },
  physical: {
    id: "physical",
    label: "Physical",
    hint: "Exercise, chores, being on your feet",
    icon: Footprints,
    restorativeByDefault: false,
    color: "oklch(0.66 0.13 150)",
  },
  admin: {
    id: "admin",
    label: "Admin",
    hint: "Errands, paperwork, appointments, planning",
    icon: ClipboardList,
    restorativeByDefault: false,
    color: "oklch(0.68 0.11 80)",
  },
  transition: {
    id: "transition",
    label: "Transition",
    hint: "Travel, commuting, switching between tasks",
    icon: Repeat,
    restorativeByDefault: false,
    color: "oklch(0.64 0.10 40)",
  },
  rest: {
    id: "rest",
    label: "Recharge",
    hint: "Rest, stimming, quiet time, things that refill you",
    icon: Leaf,
    restorativeByDefault: true,
    color: "oklch(0.68 0.11 175)",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
