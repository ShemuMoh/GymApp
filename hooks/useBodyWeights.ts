import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export type BodyWeight = {
  id: string;
  recorded_on: string;
  weight: number;
};

export function useBodyWeights() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [weights, setWeights] = useState<BodyWeight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from("body_weights")
      .select("id, recorded_on, weight")
      .order("recorded_on", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setWeights((data ?? []) as BodyWeight[]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveWeight = useCallback(
    async (recordedOn: string, weight: number): Promise<string | null> => {
      if (!userId) return "Not signed in.";
      const { data, error } = await supabase
        .from("body_weights")
        .upsert(
          { user_id: userId, recorded_on: recordedOn, weight },
          { onConflict: "user_id,recorded_on" },
        )
        .select("id, recorded_on, weight")
        .single();
      if (error || !data) return error?.message ?? "Could not save weight.";

      const row = data as BodyWeight;
      setWeights((prev) => {
        const rest = prev.filter((w) => w.recorded_on !== row.recorded_on);
        return [...rest, row].sort((a, b) => (a.recorded_on < b.recorded_on ? 1 : -1));
      });
      return null;
    },
    [userId],
  );

  const deleteWeight = useCallback(async (id: string) => {
    await supabase.from("body_weights").delete().eq("id", id);
    setWeights((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { weights, loading, saveWeight, deleteWeight };
}
