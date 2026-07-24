import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Exercise } from "@/hooks/useWorkoutData";

export type PersonalBest = {
  id: string;
  exercise_id: string;
  achieved_on: string;
  weight: number;
  reps: number;
};

export function usePersonalBests() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.all([
      supabase.from("exercises").select("id, name").order("created_at", { ascending: true }),
      supabase
        .from("personal_bests")
        .select("id, exercise_id, achieved_on, weight, reps")
        .order("achieved_on", { ascending: false }),
    ]).then(([exercisesRes, bestsRes]) => {
      if (cancelled) return;
      setExercises((exercisesRes.data ?? []) as Exercise[]);
      setBests((bestsRes.data ?? []) as PersonalBest[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addBest = useCallback(
    async (exerciseId: string, achievedOn: string, weight: number, reps: number): Promise<string | null> => {
      if (!userId) return "Not signed in.";
      const { data, error } = await supabase
        .from("personal_bests")
        .insert({ user_id: userId, exercise_id: exerciseId, achieved_on: achievedOn, weight, reps })
        .select("id, exercise_id, achieved_on, weight, reps")
        .single();
      if (error || !data) return error?.message ?? "Could not save personal best.";
      setBests((prev) =>
        [data as PersonalBest, ...prev].sort((a, b) => (a.achieved_on < b.achieved_on ? 1 : -1)),
      );
      return null;
    },
    [userId],
  );

  const deleteBest = useCallback(async (id: string) => {
    await supabase.from("personal_bests").delete().eq("id", id);
    setBests((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { exercises, bests, loading, addBest, deleteBest };
}
