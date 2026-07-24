"use client";

import { useMemo, useState } from "react";
import { useWorkoutData } from "@/hooks/useWorkoutData";

type Screen =
  | { name: "days" }
  | { name: "day"; date: string }
  | { name: "exercise"; date: string; exerciseId: string };

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

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 bg-zinc-950/90 px-4 py-4 backdrop-blur">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-emerald-400 active:bg-zinc-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ExerciseLog() {
  const { exercises, sets, loading, addExercise, addSet, updateSet, deleteSet } = useWorkoutData();
  const [screen, setScreen] = useState<Screen>({ name: "days" });
  const [newExerciseName, setNewExerciseName] = useState("");
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState(0);
  const [editWeight, setEditWeight] = useState(0);

  const exerciseById = useMemo(
    () => new Map(exercises.map((ex) => [ex.id, ex])),
    [exercises],
  );

  const days = useMemo(() => {
    const byDay = new Map<string, typeof sets>();
    for (const s of sets) {
      const list = byDay.get(s.performed_on) ?? [];
      list.push(s);
      byDay.set(s.performed_on, list);
    }
    return [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, daySets]) => ({
        date,
        setCount: daySets.length,
        exerciseIds: [...new Set(daySets.map((s) => s.exercise_id))],
      }));
  }, [sets]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  // ── Screen: exercise detail (per-set breakdown for one day) ──
  if (screen.name === "exercise") {
    const exercise = exerciseById.get(screen.exerciseId);
    const daySets = sets
      .filter((s) => s.performed_on === screen.date && s.exercise_id === screen.exerciseId)
      .sort((a, b) => a.set_number - b.set_number);

    return (
      <div className="flex flex-1 flex-col">
        <Header
          title={exercise?.name ?? "Exercise"}
          subtitle={formatDay(screen.date)}
          onBack={() => setScreen({ name: "day", date: screen.date })}
        />

        <div className="flex flex-col gap-2 px-4">
          {daySets.length === 0 && (
            <p className="py-6 text-center text-zinc-500">No sets yet — log your first one below.</p>
          )}
          {daySets.map((s, i) =>
            editingSetId === s.id ? (
              <form
                key={s.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSet(s.id, editReps, editWeight);
                  setEditingSetId(null);
                }}
                className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 ring-2 ring-emerald-400"
              >
                <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Set {i + 1}
                </span>
                <input
                  type="number"
                  min={0}
                  value={editReps}
                  onChange={(e) => setEditReps(Number(e.target.value))}
                  aria-label="Reps"
                  className="w-16 rounded-lg bg-zinc-800 px-2 py-2 text-center text-white outline-none"
                />
                <span className="text-xs text-zinc-500">reps</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  aria-label="Weight"
                  className="w-18 rounded-lg bg-zinc-800 px-2 py-2 text-center text-white outline-none"
                />
                <span className="text-xs text-zinc-500">kg</span>
                <div className="ml-auto flex gap-1">
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-black"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSetId(null)}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div key={s.id} className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3">
                <button
                  onClick={() => {
                    setEditingSetId(s.id);
                    setEditReps(s.reps);
                    setEditWeight(s.weight);
                  }}
                  className="flex flex-1 items-center justify-between pr-3 text-left"
                >
                  <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Set {i + 1}
                  </span>
                  <span className="font-mono text-lg text-white">
                    {s.reps} reps · {s.weight} kg
                  </span>
                </button>
                <button
                  onClick={() => deleteSet(s.id)}
                  aria-label="Delete set"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 active:bg-red-500 active:text-white"
                >
                  ×
                </button>
              </div>
            ),
          )}
          {daySets.length > 0 && (
            <p className="pt-1 text-center text-xs text-zinc-600">Tap a set to edit it</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSet(screen.date, screen.exerciseId, reps, weight, daySets.length + 1);
          }}
          className="mt-4 flex items-end justify-center gap-3 px-4"
        >
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
            Reps
            <input
              type="number"
              min={0}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-20 rounded-xl bg-zinc-800 px-3 py-3 text-center text-lg text-white outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
            Kg
            <input
              type="number"
              min={0}
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-24 rounded-xl bg-zinc-800 px-3 py-3 text-center text-lg text-white outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black active:scale-95"
          >
            Add set
          </button>
        </form>
      </div>
    );
  }

  // ── Screen: one day (exercises done that day) ──
  if (screen.name === "day") {
    const daySets = sets.filter((s) => s.performed_on === screen.date);
    const grouped = new Map<string, number>();
    for (const s of daySets) {
      grouped.set(s.exercise_id, (grouped.get(s.exercise_id) ?? 0) + 1);
    }
    const usedIds = new Set(grouped.keys());
    const unusedExercises = exercises.filter((ex) => !usedIds.has(ex.id));

    return (
      <div className="flex flex-1 flex-col">
        <Header
          title={formatDay(screen.date)}
          subtitle={`${grouped.size} exercise${grouped.size === 1 ? "" : "s"} · ${daySets.length} set${daySets.length === 1 ? "" : "s"}`}
          onBack={() => setScreen({ name: "days" })}
        />

        <div className="flex flex-col gap-2 px-4">
          {[...grouped.entries()].map(([exerciseId, count]) => (
            <button
              key={exerciseId}
              onClick={() => setScreen({ name: "exercise", date: screen.date, exerciseId })}
              className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-4 text-left active:bg-zinc-800"
            >
              <span className="font-semibold text-white">{exerciseById.get(exerciseId)?.name}</span>
              <span className="flex items-center gap-2 text-sm text-zinc-500">
                {count} set{count === 1 ? "" : "s"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 px-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Add exercise</p>
          {unusedExercises.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {unusedExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setScreen({ name: "exercise", date: screen.date, exerciseId: ex.id })}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 active:bg-zinc-800"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const name = newExerciseName.trim();
              if (!name) return;
              const created = await addExercise(name);
              if (created) {
                setNewExerciseName("");
                setScreen({ name: "exercise", date: screen.date, exerciseId: created.id });
              }
            }}
            className="flex gap-2"
          >
            <input
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="New exercise (e.g. Bench Press)"
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!newExerciseName.trim()}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Screen: all days ──
  return (
    <div className="flex flex-1 flex-col">
      <Header title="Exercise Log" />

      <div className="px-4 pb-4">
        <button
          onClick={() => setScreen({ name: "day", date: todayIso() })}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-black shadow-lg active:scale-[0.98]"
        >
          + Log today&apos;s workout
        </button>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {days.length === 0 && (
          <p className="py-10 text-center text-zinc-500">
            No workouts yet. Start with today&apos;s!
          </p>
        )}
        {days.map((day) => (
          <button
            key={day.date}
            onClick={() => setScreen({ name: "day", date: day.date })}
            className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-4 text-left active:bg-zinc-800"
          >
            <div>
              <p className="font-semibold text-white">{formatDay(day.date)}</p>
              <p className="text-sm text-zinc-500">
                {day.exerciseIds.length} exercise{day.exerciseIds.length === 1 ? "" : "s"} · {day.setCount} set{day.setCount === 1 ? "" : "s"}
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-600">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
