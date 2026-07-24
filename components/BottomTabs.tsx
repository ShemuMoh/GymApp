"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Log",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
        <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <path d="M9 6l1.5-2.5h3L15 6M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
    ),
  },
  {
    href: "/utilities",
    label: "Utilities",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2">
      <div className="pointer-events-auto flex items-center rounded-full border border-white/10 bg-zinc-500/25 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-white/20 text-emerald-300 shadow-inner"
                  : "text-zinc-200 active:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
