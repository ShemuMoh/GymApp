"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
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
      <Nav />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
