import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export type Pose = "front" | "back";

export type ProgressPhoto = {
  id: string;
  taken_on: string;
  pose: Pose;
  storage_path: string;
};

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export function useProgressPhotos() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from("progress_photos")
      .select("id, taken_on, pose, storage_path")
      .order("taken_on", { ascending: false })
      .then(async ({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as ProgressPhoto[];
        setPhotos(rows);

        if (rows.length > 0) {
          const { data: signed } = await supabase.storage
            .from("progress")
            .createSignedUrls(rows.map((r) => r.storage_path), SIGNED_URL_TTL);
          if (cancelled) return;
          const map: Record<string, string> = {};
          for (const item of signed ?? []) {
            if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
          }
          setUrls(map);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addPhoto = useCallback(
    async (takenOn: string, pose: Pose, file: File): Promise<string | null> => {
      if (!userId) return "Not signed in.";

      const path = `${userId}/${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from("progress")
        .upload(path, file, { contentType: file.type });
      if (uploadError) return uploadError.message;

      const { data, error: insertError } = await supabase
        .from("progress_photos")
        .insert({ user_id: userId, taken_on: takenOn, pose, storage_path: path })
        .select("id, taken_on, pose, storage_path")
        .single();

      if (insertError || !data) {
        await supabase.storage.from("progress").remove([path]);
        return insertError?.code === "23505"
          ? `You already have a ${pose} photo for this day.`
          : (insertError?.message ?? "Could not save photo.");
      }

      const { data: signed } = await supabase.storage
        .from("progress")
        .createSignedUrl(path, SIGNED_URL_TTL);

      setPhotos((prev) => [data as ProgressPhoto, ...prev]);
      if (signed?.signedUrl) {
        setUrls((prev) => ({ ...prev, [path]: signed.signedUrl }));
      }
      return null;
    },
    [userId],
  );

  const deletePhoto = useCallback(async (photo: ProgressPhoto) => {
    await supabase.from("progress_photos").delete().eq("id", photo.id);
    await supabase.storage.from("progress").remove([photo.storage_path]);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }, []);

  const changeDate = useCallback(
    async (oldDate: string, newDate: string): Promise<string | null> => {
      const { error } = await supabase
        .from("progress_photos")
        .update({ taken_on: newDate })
        .eq("taken_on", oldDate);
      if (error) {
        return error.code === "23505"
          ? "That day already has photos for the same pose."
          : error.message;
      }
      setPhotos((prev) =>
        prev.map((p) => (p.taken_on === oldDate ? { ...p, taken_on: newDate } : p)),
      );
      return null;
    },
    [],
  );

  return { photos, urls, loading, addPhoto, deletePhoto, changeDate };
}
