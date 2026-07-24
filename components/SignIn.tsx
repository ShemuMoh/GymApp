"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Mode = "signin" | "signup";
type Status = "idle" | "working" | "sent" | "confirm" | "error";

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (mode === "signup") {
      if (password.length < 8) {
        setStatus("error");
        setErrorMessage("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setStatus("error");
        setErrorMessage("Passwords don't match.");
        return;
      }
      setStatus("working");

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setStatus("error");
        setErrorMessage(
          /already registered/i.test(error.message)
            ? "This email already has an account. Use Sign in instead."
            : error.message,
        );
        return;
      }
      // Supabase signals an existing email by returning a user with no identities.
      if (data.user && data.user.identities?.length === 0) {
        setStatus("error");
        setErrorMessage("This email already has an account. Use Sign in instead.");
        return;
      }
      if (!data.session) {
        setStatus("confirm");
        return;
      }
      // Session present: signed up and logged in; auth listener takes over.
      return;
    }

    setStatus("working");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Wrong email or password. If you haven't set a password yet, use the magic link instead."
          : error.message,
      );
    }
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
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">Gym App</h1>
        <p className="max-w-sm text-center text-zinc-400">
          Check <span className="text-white">{email}</span> for a sign-in link.
        </p>
      </div>
    );
  }

  if (status === "confirm") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">Gym App</h1>
        <p className="max-w-sm text-center text-zinc-400">
          Almost there — check <span className="text-white">{email}</span> for a confirmation
          link to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Gym App</h1>

      <div className="flex w-full max-w-xs rounded-xl bg-zinc-900 p-1">
        <button
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "signin" ? "bg-zinc-700 text-white" : "text-zinc-500"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "signup" ? "bg-zinc-700 text-white" : "text-zinc-500"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
          className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {mode === "signup" && (
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-emerald-400"
          />
        )}
        <button
          type="submit"
          disabled={status === "working" || !email || !password}
          className="rounded-2xl bg-emerald-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-transform active:scale-95 disabled:opacity-40"
        >
          {status === "working"
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
        {mode === "signin" && (
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={status === "working"}
            className="py-1 text-sm font-medium text-zinc-500 active:text-zinc-300 disabled:opacity-40"
          >
            Email me a magic link instead
          </button>
        )}
        {status === "error" && (
          <p className="text-center text-sm text-red-400">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
