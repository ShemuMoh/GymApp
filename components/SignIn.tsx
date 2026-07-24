"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "working" | "sent" | "error";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    setStatus("working");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Wrong email or password. If you haven't set a password yet, use the magic link instead."
          : error.message,
      );
    }
    // On success the auth listener signs us in automatically.
  }

  async function handleMagicLink() {
    if (!email) {
      setStatus("error");
      setErrorMessage("Enter your email first.");
      return;
    }
    setStatus("working");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
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
      <h1 className="text-2xl font-bold">Gym App</h1>

      {status === "sent" ? (
        <p className="max-w-sm text-center text-zinc-400">
          Check <span className="text-white">{email}</span> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handlePasswordSignIn} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            disabled={status === "working" || !email || !password}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-transform active:scale-95 disabled:opacity-40"
          >
            {status === "working" ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={status === "working"}
            className="py-1 text-sm font-medium text-zinc-500 active:text-zinc-300 disabled:opacity-40"
          >
            Email me a magic link instead
          </button>
          {status === "error" && (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
