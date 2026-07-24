"use client";

import { useMemo, useRef, useState } from "react";
import { useProgressPhotos, type Pose, type ProgressPhoto } from "@/hooks/useProgressPhotos";

type Screen = { name: "days" } | { name: "day"; date: string };

const MAX_BYTES = 25 * 1024 * 1024;
const POSES: { key: Pose; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
];

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

export default function PhotoProgress() {
  const { photos, urls, loading, addPhoto, deletePhoto, changeDate } = useProgressPhotos();
  const [screen, setScreen] = useState<Screen>({ name: "days" });
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null);
  const [uploadingPose, setUploadingPose] = useState<Pose | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pendingPoseRef = useRef<Pose | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const days = useMemo(() => {
    const byDay = new Map<string, ProgressPhoto[]>();
    for (const p of photos) {
      const list = byDay.get(p.taken_on) ?? [];
      list.push(p);
      byDay.set(p.taken_on, list);
    }
    return [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [photos]);

  async function handleFileSelected(file: File) {
    const pose = pendingPoseRef.current;
    if (!pose || screen.name !== "day") return;
    if (!file.type.startsWith("image/")) {
      setMessage("Only photos are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage("Photo must be under 25 MB.");
      return;
    }
    setMessage(null);
    setUploadingPose(pose);
    const error = await addPhoto(screen.date, pose, file);
    setUploadingPose(null);
    if (error) setMessage(error);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  // ── Fullscreen viewer ──
  if (viewing) {
    const url = urls[viewing.storage_path];
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="font-semibold text-white">
              {POSES.find((p) => p.key === viewing.pose)?.label}
            </p>
            <p className="text-sm text-zinc-400">{formatDay(viewing.taken_on)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deletePhoto(viewing);
                setViewing(null);
              }}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-red-400"
            >
              Delete
            </button>
            <button
              onClick={() => setViewing(null)}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed Supabase Storage URL
          <img src={url} alt={`${viewing.pose} progress photo`} className="min-h-0 flex-1 object-contain" />
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">Loading…</div>
        )}
      </div>
    );
  }

  // ── Day view: Front / Back slots ──
  if (screen.name === "day") {
    const dayPhotos = photos.filter((p) => p.taken_on === screen.date);
    const hasPhotos = dayPhotos.length > 0;

    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => {
              setMessage(null);
              setScreen({ name: "days" });
            }}
            aria-label="Back"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-emerald-400 active:bg-zinc-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">{formatDay(screen.date)}</h2>
        </div>

        <div className="flex items-center gap-3 px-4 pb-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Date</label>
          <input
            type="date"
            value={screen.date}
            max={todayIso()}
            onChange={async (e) => {
              const newDate = e.target.value;
              if (!newDate || newDate === screen.date) return;
              setMessage(null);
              if (hasPhotos) {
                const error = await changeDate(screen.date, newDate);
                if (error) {
                  setMessage(error);
                  return;
                }
              }
              setScreen({ name: "day", date: newDate });
            }}
            className="rounded-xl bg-zinc-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 px-4">
          {POSES.map((pose) => {
            const photo = dayPhotos.find((p) => p.pose === pose.key);
            const url = photo ? urls[photo.storage_path] : undefined;
            return (
              <div key={pose.key} className="flex flex-col gap-2">
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {pose.label}
                </p>
                {photo ? (
                  <button
                    onClick={() => setViewing(photo)}
                    className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 active:opacity-80"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- signed Supabase Storage URL
                      <img src={url} alt={`${pose.label} progress photo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-zinc-600">…</span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      pendingPoseRef.current = pose.key;
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingPose !== null}
                    className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-600 active:border-emerald-400 active:text-emerald-400 disabled:opacity-50"
                  >
                    {uploadingPose === pose.key ? (
                      <span className="text-sm">Uploading…</span>
                    ) : (
                      <>
                        <span className="text-4xl font-light">+</span>
                        <span className="text-xs font-semibold uppercase tracking-wide">Upload</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {message && <p className="px-4 pt-3 text-center text-sm text-red-400">{message}</p>}
        <p className="px-4 pt-4 text-center text-xs text-zinc-600">
          Photos only · max 25 MB · one front and one back per day
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  // ── Days list ──
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pb-4">
        <button
          onClick={() => setScreen({ name: "day", date: todayIso() })}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-black shadow-lg active:scale-[0.98]"
        >
          + Add today&apos;s photos
        </button>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {days.length === 0 && (
          <p className="py-10 text-center text-zinc-500">
            No progress photos yet. Add your first ones!
          </p>
        )}
        {days.map(([date, dayPhotos]) => (
          <button
            key={date}
            onClick={() => setScreen({ name: "day", date })}
            className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3 text-left active:bg-zinc-800"
          >
            <div>
              <p className="font-semibold text-white">{formatDay(date)}</p>
              <p className="text-sm text-zinc-500">
                {dayPhotos
                  .map((p) => POSES.find((pose) => pose.key === p.pose)?.label)
                  .sort()
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {dayPhotos.slice(0, 2).map((p) => {
                const url = urls[p.storage_path];
                return url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed Supabase Storage URL
                  <img
                    key={p.id}
                    src={url}
                    alt=""
                    className="h-12 w-9 rounded-lg object-cover"
                  />
                ) : null;
              })}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-600">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
