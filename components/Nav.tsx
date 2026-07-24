"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const tabs = [
  { href: "/", label: "Tools" },
  { href: "/exercises", label: "Exercises" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 flex items-center border-b border-zinc-800 bg-zinc-950">
      <div className="flex flex-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 py-4 text-center text-sm font-semibold tracking-wide transition-colors ${
                active
                  ? "border-b-2 border-emerald-400 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="px-4 text-xs font-medium text-zinc-500 hover:text-zinc-300"
      >
        Sign out
      </button>
    </nav>
  );
}
