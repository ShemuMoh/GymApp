"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Single Timer" },
  { href: "/double", label: "Double Timer" },
  { href: "/counter", label: "Counter" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 flex border-b border-zinc-800 bg-zinc-950">
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
    </nav>
  );
}
