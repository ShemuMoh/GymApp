"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "sending" | "sent" | "error";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Gym Timer</h1>

      {status === "sent" ? (
        <p className="max-w-sm text-center text-zinc-400">
          Check <span className="text-white">{email}</span> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg bg-zinc-800 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-transform active:scale-95 disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
          {status === "error" && (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
