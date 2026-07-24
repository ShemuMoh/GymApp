"use client";

import { useState } from "react";
import { cleanNumberText } from "@/lib/numberText";

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
  // Track the raw typed text so the field can be empty mid-edit and never
  // shows stale leading zeros; falls back to the parent value when it
  // changes externally (quick-add buttons, Clear, etc.).
  const [draft, setDraft] = useState({ text: String(value), value });
  const text = draft.value === value ? draft.text : String(value);

  return (
    <label className="flex flex-col items-center gap-1 text-xs uppercase tracking-wide text-zinc-500">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            setDraft({ text: "", value: 0 });
            onChange(0);
            return;
          }
          const parsed = Number(raw);
          if (Number.isNaN(parsed)) return;
          const clamped = Math.max(0, Math.min(max, parsed));
          const cleaned = clamped === parsed ? cleanNumberText(raw) : String(clamped);
          setDraft({ text: cleaned, value: clamped });
          onChange(clamped);
        }}
        onBlur={() => setDraft({ text: String(value), value })}
        className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-center text-2xl font-mono text-white outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {label}
    </label>
  );
}
