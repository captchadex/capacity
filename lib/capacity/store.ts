"use client";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";

import { dayKey } from "./logic";
import type { Activity, CapacityState } from "./types";

const STORAGE_KEY = "capacity.state.v1";
const DEFAULT_CAPACITY = 15;

function loadState(): CapacityState {
  if (typeof window === "undefined") {
    return { dailyCapacity: DEFAULT_CAPACITY, activities: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dailyCapacity: DEFAULT_CAPACITY, activities: [] };
    const parsed = JSON.parse(raw) as Partial<CapacityState>;
    return {
      dailyCapacity:
        typeof parsed.dailyCapacity === "number"
          ? parsed.dailyCapacity
          : DEFAULT_CAPACITY,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch {
    return { dailyCapacity: DEFAULT_CAPACITY, activities: [] };
  }
}

export type NewActivity = Omit<Activity, "id" | "createdAt" | "date" | "done">;

export interface CapacityStore {
  /** True once client-side state has hydrated from localStorage. */
  ready: boolean;
  dailyCapacity: number;
  /** Activities scoped to today. */
  today: Activity[];
  addActivity: (input: NewActivity) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  setDailyCapacity: (value: number) => void;
  clearToday: () => void;
}

export function useCapacityStore(): CapacityStore {
  const [state, setState] = useState<CapacityState>({
    dailyCapacity: DEFAULT_CAPACITY,
    activities: [],
  });
  const [ready, setReady] = useState(false);

  // Hydrate from storage after mount to avoid SSR/client mismatch.
  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  // Persist whenever state changes (but not before hydration).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / privacy-mode failures — the app still works in-session.
    }
  }, [state, ready]);

  const addActivity = useCallback((input: NewActivity) => {
    setState((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          ...input,
          id: nanoid(),
          date: dayKey(),
          done: false,
          createdAt: Date.now(),
        },
      ],
    }));
  }, []);

  const updateActivity = useCallback((id: string, patch: Partial<Activity>) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    }));
  }, []);

  const removeActivity = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  }, []);

  const setDailyCapacity = useCallback((value: number) => {
    setState((prev) => ({ ...prev, dailyCapacity: value }));
  }, []);

  const clearToday = useCallback(() => {
    const today = dayKey();
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.date !== today),
    }));
  }, []);

  const today = state.activities.filter((a) => a.date === dayKey());

  return {
    ready,
    dailyCapacity: state.dailyCapacity,
    today,
    addActivity,
    updateActivity,
    removeActivity,
    setDailyCapacity,
    clearToday,
  };
}
