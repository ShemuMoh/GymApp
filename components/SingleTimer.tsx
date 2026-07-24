"use client";

import { useEffect, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { playFinishSound, unlockAudio, vibrate } from "@/lib/sound";
import NumberField from "@/components/ui/NumberField";
import BigButton from "@/components/ui/BigButton";

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function SingleTimer() {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const durationMs = (minutes * 60 + seconds) * 1000;

  const { remainingMs, running, start, pause, resume, reset } = useCountdown(() => {
    vibrate([200, 100, 200, 100, 200]);
    setFinished(true);
  });

  useEffect(() => {
    if (!finished) return;
    playFinishSound();
    const id = setInterval(playFinishSound, 1200);
    return () => clearInterval(id);
  }, [finished]);

  function handleStart() {
    unlockAudio();
    setFinished(false);
    setStarted(true);
    start(durationMs);
  }

  function handleRepeat() {
    unlockAudio();
    setFinished(false);
    start(durationMs);
  }

  function handleReset() {
    setFinished(false);
    setStarted(false);
    reset(durationMs);
  }

  function addTime(deltaSeconds: number) {
    const total = minutes * 60 + seconds + deltaSeconds;
    const clamped = Math.max(0, Math.min(99 * 60 + 59, total));
    setMinutes(Math.floor(clamped / 60));
    setSeconds(clamped % 60);
  }

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 transition-colors duration-300 ${
        finished ? "animate-pulse bg-emerald-900/40" : ""
      }`}
    >
      <div className="font-mono text-8xl font-bold tabular-nums">
        {formatTime(started ? remainingMs : durationMs)}
      </div>

      {finished && <p className="text-2xl font-semibold text-emerald-400">Time&apos;s up!</p>}

      {!started && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <NumberField label="min" value={minutes} onChange={setMinutes} max={99} />
            <span className="text-3xl">:</span>
            <NumberField label="sec" value={seconds} onChange={setSeconds} max={59} />
          </div>
          <div className="flex gap-2">
            {[1, 5, 60, 120, 300].map((s) => (
              <button
                key={s}
                onClick={() => addTime(s)}
                className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
              >
                +{s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
            <button
              onClick={() => {
                setMinutes(0);
                setSeconds(0);
              }}
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!started && (
          <BigButton onClick={handleStart} disabled={durationMs === 0}>
            Start
          </BigButton>
        )}
        {started && !finished && running && (
          <BigButton onClick={pause} color="amber">
            Pause
          </BigButton>
        )}
        {started && !finished && !running && (
          <BigButton
            onClick={() => {
              unlockAudio();
              resume();
            }}
          >
            Resume
          </BigButton>
        )}
        {finished && <BigButton onClick={handleRepeat}>Repeat</BigButton>}
        {started && (
          <BigButton onClick={handleReset} color="zinc">
            Reset
          </BigButton>
        )}
      </div>
    </div>
  );
}
