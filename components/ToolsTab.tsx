"use client";

import { useState } from "react";
import SingleTimer from "@/components/SingleTimer";
import DoubleTimer from "@/components/DoubleTimer";
import CounterTab from "@/components/CounterTab";
import Stopwatch from "@/components/Stopwatch";

const TOOLS = [
  { key: "single", label: "Timer" },
  { key: "double", label: "Intervals" },
  { key: "stopwatch", label: "Stopwatch" },
  { key: "counter", label: "Counter" },
] as const;

type ToolKey = (typeof TOOLS)[number]["key"];

export default function ToolsTab() {
  const [active, setActive] = useState<ToolKey>("single");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 py-3">
        <h1 className="text-2xl font-bold">Utilities</h1>
      </div>

      <div className="flex gap-1 px-4 pb-2">
        <div className="flex flex-1 rounded-xl bg-zinc-900 p-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              onClick={() => setActive(tool.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                active === tool.key
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 active:text-zinc-300"
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {active === "single" && <SingleTimer />}
      {active === "double" && <DoubleTimer />}
      {active === "stopwatch" && <Stopwatch />}
      {active === "counter" && <CounterTab />}
    </div>
  );
}
