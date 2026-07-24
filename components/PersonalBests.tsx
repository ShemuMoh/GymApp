"use client";

import { useMemo, useState, type FormEvent } from "react";
import { usePersonalBests } from "@/hooks/usePersonalBests";
import { cleanNumberText } from "@/lib/numberText";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PersonalBests() {
  const { exercises, bests, loading, addBest, deleteBest } = usePersonalBests();
  const [exerciseId, setExerciseId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [popup, setPopup] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byExercise = new Map<string, typeof bests>();
    for (const b of bests) {
      const list = byExercise.get(b.exercise_id) ?? [];
      list.push(b);
      byExercise.set(b.exercise_id, list);
    }
    // Order exercise groups by their most recent PB.
    return [...byExercise.entries()].sort((a, b) =>
      a[1][0].achieved_on < b[1][0].achieved_on ? 1 : -1,
    );
  }, [bests]);

  const exerciseName = (id: string) => exercises.find((ex) => ex.id === id)?.name ?? "Exercise";

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const w = Number(weight);
    if (!exerciseId) {
      setMessage("Pick an exercise.");
      return;
    }
    if (!w || w <= 0) {
      setMessage("Enter a valid weight.");
      return;
    }

    // Only a strictly higher weight counts as a new personal best.
    const existing = bests.filter((b) => b.exercise_id === exerciseId);
    if (existing.length > 0) {
      const current = existing.reduce((top, b) => (b.weight > top.weight ? b : top), existing[0]);
      if (w <= current.weight) {
        setPopup(
          `You did ${current.weight} kg on ${formatDay(current.achieved_on)} which was a better personal best, keep pushing!`,
        );
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    const error = await addBest(exerciseId, date, w, Number(reps) || 1);
    setSaving(false);
    if (error) {
      setMessage(error);
    } else {
      setWeight("");
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-8">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-zinc-900 p-6 text-center">
            <span className="text-4xl">🏆</span>
            <p className="text-white">{popup}</p>
            <button
              onClick={() => setPopup(null)}
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-black active:scale-95"
            >
              Keep pushing 💪
            </button>
          </div>
        </div>
      )}

      {exercises.length === 0 ? (
        <p className="py-8 text-center text-zinc-500">
          Add exercises in the Log tab first, then record your personal bests here.
        </p>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4">
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Choose exercise…</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <div className="flex items-end gap-3">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Weight (kg)
              <input
                type="number"
                min={0}
                max={999}
                step="0.5"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(cleanNumberText(e.target.value))}
                placeholder="0.0"
                className="w-24 rounded-xl bg-zinc-800 px-3 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Reps
              <input
                type="number"
                min={1}
                max={99}
                value={reps}
                onChange={(e) => setReps(cleanNumberText(e.target.value))}
                className="w-16 rounded-xl bg-zinc-800 px-3 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
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
          </div>
          <button
            type="submit"
            disabled={saving || !exerciseId || !weight}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save personal best"}
          </button>
          {message && <p className="text-sm text-red-400">{message}</p>}
        </form>
      )}

      {grouped.length === 0 && exercises.length > 0 && (
        <p className="py-8 text-center text-zinc-500">No personal bests yet. Log your first one above.</p>
      )}

      {grouped.map(([exId, entries]) => {
        const best = entries.reduce((top, e) => (e.weight > top.weight ? e : top), entries[0]);
        const history = entries.filter((e) => e.id !== best.id);
        const expanded = expandedId === exId;
        return (
          <div key={exId} className="flex flex-col gap-2 rounded-2xl bg-zinc-900 p-4">
            <button
              onClick={() => setExpandedId(expanded ? null : exId)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h2 className="font-semibold text-white">{exerciseName(exId)}</h2>
                <p className="text-xs text-zinc-500">{formatDay(best.achieved_on)}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-400">
                🏆 {best.weight} kg × {best.reps}
              </span>
            </button>

            {expanded && (
              <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  PB history
                </p>
                {history.length === 0 && (
                  <p className="text-sm text-zinc-500">No previous records — this is your first PB.</p>
                )}
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-800/50 px-3 py-2"
                  >
                    <span className="text-sm text-zinc-400">{formatDay(entry.achieved_on)}</span>
                    <span className="font-mono text-white">
                      {entry.weight} kg × {entry.reps}
                    </span>
                    <button
                      onClick={() => deleteBest(entry.id)}
                      aria-label="Delete record"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-sm text-zinc-400 active:bg-red-500 active:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {grouped.length > 0 && (
        <p className="pb-2 text-center text-xs text-zinc-600">Tap a PB to see its history</p>
      )}
    </div>
  );
}
