"use client";

export default function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
}) {
  return (
    <label className="flex flex-col items-center gap-1 text-xs uppercase tracking-wide text-zinc-500">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Number.isNaN(v) ? 0 : Math.max(0, Math.min(max, v)));
        }}
        className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-center text-2xl font-mono text-white outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {label}
    </label>
  );
}
