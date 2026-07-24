"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import BottomTabs from "@/components/BottomTabs";
import SignIn from "@/components/SignIn";

export default function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-24">{children}</main>
      <BottomTabs />
    </>
  );
}
