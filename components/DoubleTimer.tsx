"use client";

import { useEffect, useRef, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { playSwitchBeep, playFinishSound, unlockAudio, vibrate } from "@/lib/sound";
import NumberField from "@/components/ui/NumberField";
import BigButton from "@/components/ui/BigButton";

type Phase = "A" | "B";
type Mode = "indefinite" | "rounds";

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function DoubleTimer() {
  const [labelA, setLabelA] = useState("Work");
  const [minutesA, setMinutesA] = useState(0);
  const [secondsA, setSecondsA] = useState(30);

  const [labelB, setLabelB] = useState("Rest");
  const [minutesB, setMinutesB] = useState(0);
  const [secondsB, setSecondsB] = useState(15);

  const [mode, setMode] = useState<Mode>("rounds");
  const [targetRounds, setTargetRounds] = useState(8);

  const [phase, setPhase] = useState<Phase>("A");
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const durationA = (minutesA * 60 + secondsA) * 1000;
  const durationB = (minutesB * 60 + secondsB) * 1000;

  const phaseRef = useRef<Phase>("A");
  const roundRef = useRef(1);
  const modeRef = useRef<Mode>(mode);
  const targetRoundsRef = useRef(targetRounds);
  const durationARef = useRef(durationA);
  const durationBRef = useRef(durationB);
  const startRef = useRef<(durationMs: number) => void>(() => {});

  useEffect(() => {
    modeRef.current = mode;
    targetRoundsRef.current = targetRounds;
    durationARef.current = durationA;
    durationBRef.current = durationB;
  });

  const { remainingMs, running, start, pause, resume, reset } = useCountdown(() => {
    playSwitchBeep();
    vibrate(100);

    if (phaseRef.current === "B") {
      if (modeRef.current === "rounds" && roundRef.current >= targetRoundsRef.current) {
        playFinishSound();
        vibrate([200, 100, 200, 100, 200]);
        setFinished(true);
        return;
      }
      roundRef.current += 1;
      phaseRef.current = "A";
      setRound(roundRef.current);
      setPhase("A");
      startRef.current(durationARef.current);
    } else {
      phaseRef.current = "B";
      setPhase("B");
      startRef.current(durationBRef.current);
    }
  });

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  function handleStart() {
    unlockAudio();
    setFinished(false);
    setStarted(true);
    phaseRef.current = "A";
    roundRef.current = 1;
    setPhase("A");
    setRound(1);
    start(durationA);
  }

  function handleReset() {
    setFinished(false);
    setStarted(false);
    phaseRef.current = "A";
    roundRef.current = 1;
    setPhase("A");
    setRound(1);
    reset(durationA);
  }

  const phaseColor = phase === "A" ? "text-sky-400" : "text-orange-400";
  const backdrop = finished
    ? "animate-pulse bg-emerald-900/40"
    : started
      ? phase === "A"
        ? "bg-sky-950/30"
        : "bg-orange-950/30"
      : "";

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-4 px-4 py-3 transition-colors duration-300 ${backdrop}`}
    >
      {!started ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-900 p-3">
              <input
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                className="w-32 rounded-lg bg-zinc-800 px-3 py-1 text-center text-lg font-semibold text-sky-400 outline-none"
              />
              <div className="flex items-center gap-3">
                <NumberField label="min" value={minutesA} onChange={setMinutesA} max={99} />
                <span className="text-2xl">:</span>
                <NumberField label="sec" value={secondsA} onChange={setSecondsA} max={59} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-900 p-3">
              <input
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                className="w-32 rounded-lg bg-zinc-800 px-3 py-1 text-center text-lg font-semibold text-orange-400 outline-none"
              />
              <div className="flex items-center gap-3">
                <NumberField label="min" value={minutesB} onChange={setMinutesB} max={99} />
                <span className="text-2xl">:</span>
                <NumberField label="sec" value={secondsB} onChange={setSecondsB} max={59} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 rounded-full bg-zinc-900 p-1">
              <button
                onClick={() => setMode("indefinite")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  mode === "indefinite" ? "bg-emerald-500 text-black" : "text-zinc-400"
                }`}
              >
                Indefinite
              </button>
              <button
                onClick={() => setMode("rounds")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  mode === "rounds" ? "bg-emerald-500 text-black" : "text-zinc-400"
                }`}
              >
                Rounds
              </button>
            </div>
            {mode === "rounds" && (
              <NumberField
                label="rounds"
                value={targetRounds}
                onChange={(v) => setTargetRounds(Math.max(1, v))}
                max={99}
              />
            )}
          </div>

          <BigButton onClick={handleStart} disabled={durationA === 0 || durationB === 0}>
            Start
          </BigButton>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className={`text-2xl font-bold uppercase tracking-widest ${phaseColor}`}>
            {phase === "A" ? labelA : labelB}
          </p>
          <div className="font-mono text-7xl font-bold tabular-nums">{formatTime(remainingMs)}</div>
          {mode === "rounds" ? (
            <p className="text-zinc-400">
              Round {Math.min(round, targetRounds)} of {targetRounds}
            </p>
          ) : (
            <p className="text-zinc-400">Round {round}</p>
          )}
          {finished && <p className="text-2xl font-semibold text-emerald-400">Workout complete!</p>}

          <div className="flex gap-4">
            {!finished && running && (
              <BigButton onClick={pause} color="amber">
                Pause
              </BigButton>
            )}
            {!finished && !running && (
              <BigButton
                onClick={() => {
                  unlockAudio();
                  resume();
                }}
              >
                Resume
              </BigButton>
            )}
            <BigButton onClick={handleReset} color="zinc">
              Reset
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
