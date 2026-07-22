"use client";

import { ReactNode } from "react";

const colorMap = {
  emerald: "bg-emerald-500 hover:bg-emerald-400 text-black",
  amber: "bg-amber-500 hover:bg-amber-400 text-black",
  zinc: "bg-zinc-700 hover:bg-zinc-600 text-white",
};

export default function BigButton({
  onClick,
  children,
  color = "emerald",
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  color?: keyof typeof colorMap;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-8 py-4 text-lg font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${colorMap[color]}`}
    >
      {children}
    </button>
  );
}
