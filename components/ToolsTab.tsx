"use client";

import { useState } from "react";
import SingleTimer from "@/components/SingleTimer";
import DoubleTimer from "@/components/DoubleTimer";
import CounterTab from "@/components/CounterTab";

const TOOLS = [
  { key: "single", label: "Single Timer" },
  { key: "double", label: "Double Timer" },
  { key: "counter", label: "Counter" },
] as const;

type ToolKey = (typeof TOOLS)[number]["key"];

export default function ToolsTab() {
  const [active, setActive] = useState<ToolKey>("single");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center gap-2 border-b border-zinc-900 px-4 py-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            onClick={() => setActive(tool.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === tool.key
                ? "bg-emerald-500 text-black"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {active === "single" && <SingleTimer />}
      {active === "double" && <DoubleTimer />}
      {active === "counter" && <CounterTab />}
    </div>
  );
}
