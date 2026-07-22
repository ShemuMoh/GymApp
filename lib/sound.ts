let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function tone(frequency: number, startTime: number, duration: number, volume = 0.3) {
  const audioCtx = getCtx();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  const t = audioCtx.currentTime + startTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.setValueAtTime(volume, t + duration - 0.03);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  oscillator.start(t);
  oscillator.stop(t + duration);
}

export function playSwitchBeep() {
  tone(880, 0, 0.15);
}

export function playFinishSound() {
  tone(660, 0, 0.15);
  tone(880, 0.2, 0.15);
  tone(1046, 0.4, 0.35);
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
