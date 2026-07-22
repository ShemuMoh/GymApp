import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(onComplete: () => void) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const left = endAt - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setRunning(false);
        endAtRef.current = null;
        onCompleteRef.current();
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback((durationMs: number) => {
    endAtRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setRemainingMs((prev) => {
      const endAt = endAtRef.current;
      return endAt !== null ? Math.max(0, endAt - Date.now()) : prev;
    });
    endAtRef.current = null;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    setRemainingMs((prev) => {
      endAtRef.current = Date.now() + prev;
      return prev;
    });
    setRunning(true);
  }, []);

  const reset = useCallback((durationMs: number) => {
    endAtRef.current = null;
    setRunning(false);
    setRemainingMs(durationMs);
  }, []);

  return { remainingMs, running, start, pause, resume, reset };
}
