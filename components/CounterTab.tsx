"use client";

import { useEffect, useState } from "react";

const PRESETS = ["Reps", "Sets", "Rounds", "Rest breaks"] as const;
type Preset = (typeof PRESETS)[number];

const STORAGE_KEY = "gym-timer-counters";

const initialCounts: Record<Preset, number> = {
  Reps: 0,
  Sets: 0,
  Rounds: 0,
  "Rest breaks": 0,
};

export default function CounterTab() {
  const [active, setActive] = useState<Preset>("Reps");
  const [counts, setCounts] = useState<Record<Preset, number>>(initialCounts);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
        setCounts((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore corrupted storage
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts, loaded]);

  function adjust(delta: number) {
    setCounts((prev) => ({ ...prev, [active]: Math.max(0, prev[active] + delta) }));
  }

  function resetActive() {
    setCounts((prev) => ({ ...prev, [active]: 0 }));
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-3">
      <div className="flex flex-wrap justify-center gap-2 rounded-full bg-zinc-900 p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setActive(preset)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === preset ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="text-sm uppercase tracking-widest text-zinc-500">{active}</p>
      <div className="font-mono text-8xl font-bold tabular-nums">{counts[active]}</div>

      <div className="flex gap-4">
        <button
          onClick={() => adjust(-1)}
          className="h-20 w-20 rounded-full bg-zinc-800 text-4xl font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-zinc-700"
          aria-label="Decrease"
        >
          −
        </button>
        <button
          onClick={() => adjust(1)}
          className="h-20 w-20 rounded-full bg-emerald-500 text-4xl font-bold text-black shadow-lg transition-transform active:scale-95 hover:bg-emerald-400"
          aria-label="Increase"
        >
          +
        </button>
      </div>

      <button
        onClick={resetActive}
        className="rounded-full bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
      >
        Reset {active}
      </button>
    </div>
  );
}
