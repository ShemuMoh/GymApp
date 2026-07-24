import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export type Exercise = { id: string; name: string };

export type WorkoutSet = {
  id: string;
  exercise_id: string;
  performed_on: string;
  set_number: number;
  reps: number;
  weight: number;
};

export function useWorkoutData() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.all([
      supabase.from("exercises").select("id, name").order("created_at", { ascending: true }),
      supabase
        .from("workout_sets")
        .select("id, exercise_id, performed_on, set_number, reps, weight")
        .order("performed_on", { ascending: false }),
    ]).then(([exercisesRes, setsRes]) => {
      if (cancelled) return;
      setExercises((exercisesRes.data ?? []) as Exercise[]);
      setSets((setsRes.data ?? []) as WorkoutSet[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addExercise = useCallback(
    async (name: string): Promise<Exercise | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("exercises")
        .insert({ name, user_id: userId })
        .select("id, name")
        .single();
      if (error || !data) return null;
      const exercise = data as Exercise;
      setExercises((prev) => [...prev, exercise]);
      return exercise;
    },
    [userId],
  );

  const addSet = useCallback(
    async (performedOn: string, exerciseId: string, reps: number, weight: number, setNumber: number) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("workout_sets")
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          performed_on: performedOn,
          set_number: setNumber,
          reps,
          weight,
        })
        .select("id, exercise_id, performed_on, set_number, reps, weight")
        .single();
      if (!error && data) {
        setSets((prev) => [data as WorkoutSet, ...prev]);
      }
    },
    [userId],
  );

  const updateSet = useCallback(async (id: string, reps: number, weight: number) => {
    const { error } = await supabase.from("workout_sets").update({ reps, weight }).eq("id", id);
    if (!error) {
      setSets((prev) => prev.map((s) => (s.id === id ? { ...s, reps, weight } : s)));
    }
  }, []);

  const deleteSet = useCallback(async (id: string) => {
    await supabase.from("workout_sets").delete().eq("id", id);
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const deleteExerciseDay = useCallback(async (performedOn: string, exerciseId: string) => {
    await supabase
      .from("workout_sets")
      .delete()
      .eq("performed_on", performedOn)
      .eq("exercise_id", exerciseId);
    setSets((prev) =>
      prev.filter((s) => !(s.performed_on === performedOn && s.exercise_id === exerciseId)),
    );
  }, []);

  return { exercises, sets, loading, addExercise, addSet, updateSet, deleteSet, deleteExerciseDay };
}
