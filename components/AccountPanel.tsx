"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function AccountPanel() {
  const { session } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMessage({ kind: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setMessage({ kind: "error", text: "Passwords don't match." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
    } else {
      setPassword("");
      setConfirm("");
      setMessage({ kind: "ok", text: "Password saved. You can now sign in with it on any device." });
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="rounded-2xl bg-zinc-900 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Signed in as</p>
        <p className="mt-1 text-white">{session?.user.email}</p>
      </div>

      <form onSubmit={handleSetPassword} className="flex flex-col gap-3 rounded-2xl bg-zinc-900 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Set / change password
        </p>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          className="rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          className="rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="submit"
          disabled={saving || !password || !confirm}
          className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save password"}
        </button>
        {message && (
          <p className={`text-sm ${message.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {message.text}
          </p>
        )}
      </form>

      <button
        onClick={() => supabase.auth.signOut()}
        className="rounded-2xl bg-zinc-900 px-4 py-4 font-semibold text-red-400 active:bg-zinc-800"
      >
        Sign out
      </button>
    </div>
  );
}
