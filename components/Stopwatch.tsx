"use client";

import { useState } from "react";
import { useStopwatch } from "@/hooks/useStopwatch";
import BigButton from "@/components/ui/BigButton";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${tenths}`;
}

export default function Stopwatch() {
  const { elapsedMs, running, start, pause, resume, reset } = useStopwatch();
  const [started, setStarted] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  function handleStart() {
    setLaps([]);
    setStarted(true);
    start();
  }

  function handleReset() {
    setStarted(false);
    setLaps([]);
    reset();
  }

  function handleLap() {
    setLaps((prev) => [elapsedMs, ...prev]);
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-5 overflow-hidden px-6 py-3">
      <div className="flex flex-col items-center gap-5 pt-10">
        <div className="font-mono text-7xl font-bold tabular-nums">{formatTime(elapsedMs)}</div>

        <div className="flex gap-4">
          {!started && <BigButton onClick={handleStart}>Start</BigButton>}
          {started && running && (
            <>
              <BigButton onClick={pause} color="amber">
                Pause
              </BigButton>
              <BigButton onClick={handleLap} color="zinc">
                Lap
              </BigButton>
            </>
          )}
          {started && !running && (
            <>
              <BigButton onClick={resume}>Resume</BigButton>
              <BigButton onClick={handleReset} color="zinc">
                Reset
              </BigButton>
            </>
          )}
        </div>
      </div>

      {laps.length > 0 && (
        <div className="flex w-full max-w-xs flex-1 flex-col gap-1.5 overflow-y-auto pb-2">
          {laps.map((lapMs, i) => {
            const lapNumber = laps.length - i;
            const previous = laps[i + 1] ?? 0;
            return (
              <div
                key={lapNumber}
                className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-2"
              >
                <span className="text-sm text-zinc-500">Lap {lapNumber}</span>
                <span className="font-mono text-sm text-zinc-400">
                  +{formatTime(lapMs - previous)}
                </span>
                <span className="font-mono text-white">{formatTime(lapMs)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
