"use client";

import { useState } from "react";
import WeightProgress from "@/components/WeightProgress";
import PhotoProgress from "@/components/PhotoProgress";
import PersonalBests from "@/components/PersonalBests";

const SUBTABS = [
  { key: "weight", label: "Weight" },
  { key: "photo", label: "Photos" },
  { key: "pb", label: "Personal best" },
] as const;

type SubTab = (typeof SUBTABS)[number]["key"];

export default function ProgressTab() {
  const [active, setActive] = useState<SubTab>("weight");

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-zinc-950/90 px-4 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Progress</h1>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        <div className="flex flex-1 rounded-xl bg-zinc-900 p-1">
          {SUBTABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                active === tab.key
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 active:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {active === "weight" && <WeightProgress />}
      {active === "photo" && <PhotoProgress />}
      {active === "pb" && <PersonalBests />}
    </div>
  );
}
