import { useCallback, useEffect, useRef, useState } from "react";

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  // Timestamp the current run segment started, minus time already banked.
  const startedAtRef = useRef<number | null>(null);

  // Keep the screen awake while running — a locked phone suspends JS timers.
  useEffect(() => {
    if (!running || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (released) lock.release();
      } catch {
        // Not critical; browser may refuse (e.g. low battery).
      }
    };
    acquire();

    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt !== null) setElapsedMs(Date.now() - startedAt);
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setElapsedMs((prev) => {
      const startedAt = startedAtRef.current;
      return startedAt !== null ? Date.now() - startedAt : prev;
    });
    startedAtRef.current = null;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    setElapsedMs((prev) => {
      startedAtRef.current = Date.now() - prev;
      return prev;
    });
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    setRunning(false);
    setElapsedMs(0);
  }, []);

  return { elapsedMs, running, start, pause, resume, reset };
}
