"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type Exercise = {
  id: string;
  name: string;
};

type ExerciseRecord = {
  id: string;
  exercise_id: string;
  performed_on: string;
  sets: number;
  reps: number;
  weight: number;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExerciseTracker() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [date, setDate] = useState(todayIso());
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the fetch below
    setLoadingExercises(true);
    supabase
      .from("exercises")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data ?? []) as Exercise[];
        setExercises(list);
        setLoadingExercises(false);
        if (list.length > 0) {
          setSelectedId((prev) => prev ?? list[0].id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale records when deselected
      setRecords([]);
      return;
    }
    let cancelled = false;
    setLoadingRecords(true);
    supabase
      .from("exercise_records")
      .select("id, exercise_id, performed_on, sets, reps, weight")
      .eq("exercise_id", selectedId)
      .order("performed_on", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setRecords((data ?? []) as ExerciseRecord[]);
        setLoadingRecords(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleAddExercise(e: FormEvent) {
    e.preventDefault();
    const name = newExerciseName.trim();
    if (!name || !userId) return;

    const { data, error } = await supabase
      .from("exercises")
      .insert({ name, user_id: userId })
      .select("id, name")
      .single();

    if (!error && data) {
      const exercise = data as Exercise;
      setExercises((prev) => [exercise, ...prev]);
      setSelectedId(exercise.id);
      setNewExerciseName("");
    }
  }

  async function handleDeleteExercise(id: string) {
    await supabase.from("exercises").delete().eq("id", id);
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }

  async function handleAddRecord(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !userId) return;

    const { data, error } = await supabase
      .from("exercise_records")
      .insert({
        exercise_id: selectedId,
        user_id: userId,
        performed_on: date,
        sets,
        reps,
        weight,
      })
      .select("id, exercise_id, performed_on, sets, reps, weight")
      .single();

    if (!error && data) {
      const record = data as ExerciseRecord;
      setRecords((prev) =>
        [record, ...prev].sort((a, b) => (a.performed_on < b.performed_on ? 1 : -1)),
      );
    }
  }

  async function handleDeleteRecord(id: string) {
    await supabase.from("exercise_records").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  const selectedExercise = exercises.find((ex) => ex.id === selectedId);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <form onSubmit={handleAddExercise} className="flex gap-2">
        <input
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          placeholder="New exercise name (e.g. Bench Press)"
          className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="submit"
          disabled={!newExerciseName.trim()}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {loadingExercises ? (
        <p className="text-zinc-500">Loading exercises…</p>
      ) : exercises.length === 0 ? (
        <p className="text-zinc-500">Add your first exercise above to get started.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {exercises.map((ex) => (
            <div key={ex.id} className="group relative">
              <button
                onClick={() => setSelectedId(ex.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedId === ex.id
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {ex.name}
              </button>
              <button
                onClick={() => handleDeleteExercise(ex.id)}
                aria-label={`Delete ${ex.name}`}
                className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs text-zinc-300 hover:bg-red-500 hover:text-white group-hover:flex"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedExercise && (
        <div className="flex flex-col gap-4 rounded-2xl bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-white">{selectedExercise.name}</h2>

          <form onSubmit={handleAddRecord} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Sets
              <input
                type="number"
                min={0}
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Reps
              <input
                type="number"
                min={0}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
              Weight
              <input
                type="number"
                min={0}
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-24 rounded-lg bg-zinc-800 px-3 py-2 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <button type="submit" className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-black">
              Save
            </button>
          </form>

          <div className="flex flex-col gap-2">
            {loadingRecords ? (
              <p className="text-zinc-500">Loading history…</p>
            ) : records.length === 0 ? (
              <p className="text-zinc-500">No records yet for this exercise.</p>
            ) : (
              records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 px-4 py-3"
                >
                  <span className="text-sm text-zinc-400">{r.performed_on}</span>
                  <span className="font-mono text-white">
                    {r.sets} × {r.reps} @ {r.weight}
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(r.id)}
                    aria-label="Delete record"
                    className="text-zinc-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
