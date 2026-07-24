"use client";

import { useState, type FormEvent } from "react";
import { useBodyWeights } from "@/hooks/useBodyWeights";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDay(iso: string) {
  const today = todayIso();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WeightProgress() {
  const { weights, loading, saveWeight, deleteWeight } = useBodyWeights();
  const [date, setDate] = useState(todayIso());
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const value = Number(weightInput);
    if (!value || value <= 0) {
      setMessage("Enter a valid weight.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const error = await saveWeight(date, value);
    setSaving(false);
    if (error) {
      setMessage(error);
    } else {
      setWeightInput("");
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4">
        <div className="flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
            Date
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
            Weight (kg)
            <input
              type="number"
              min={1}
              max={999}
              step="0.1"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="0.0"
              className="w-24 rounded-xl bg-zinc-800 px-3 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !weightInput}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
          >
            {saving ? "…" : "Save"}
          </button>
        </div>
        {message && <p className="text-sm text-red-400">{message}</p>}
        <p className="text-xs text-zinc-600">
          One entry per day — saving again on the same date updates it.
        </p>
      </form>

      <div className="flex flex-col gap-2">
        {weights.length === 0 && (
          <p className="py-8 text-center text-zinc-500">No weigh-ins yet. Log your first one above.</p>
        )}
        {weights.map((w, i) => {
          const prev = weights[i + 1];
          const delta = prev ? w.weight - prev.weight : null;
          return (
            <div key={w.id} className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3">
              <button
                onClick={() => {
                  setDate(w.recorded_on);
                  setWeightInput(String(w.weight));
                  setMessage(null);
                }}
                className="flex flex-1 items-center justify-between pr-3 text-left"
              >
                <span className="text-sm text-zinc-400">{formatDay(w.recorded_on)}</span>
                <span className="flex items-baseline gap-2">
                  {delta !== null && delta !== 0 && (
                    <span className={`text-xs ${delta < 0 ? "text-emerald-400" : "text-zinc-500"}`}>
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(1)}
                    </span>
                  )}
                  <span className="font-mono text-lg text-white">{w.weight} kg</span>
                </span>
              </button>
              <button
                onClick={() => deleteWeight(w.id)}
                aria-label="Delete entry"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 active:bg-red-500 active:text-white"
              >
                ×
              </button>
            </div>
          );
        })}
        {weights.length > 0 && (
          <p className="pt-1 text-center text-xs text-zinc-600">Tap an entry to edit it</p>
        )}
      </div>
    </div>
  );
}
