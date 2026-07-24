"use client";

import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type Message = { kind: "ok" | "error"; text: string };

export default function AccountPanel() {
  const { session } = useAuth();
  const user = session?.user;
  const meta = (user?.user_metadata ?? {}) as { display_name?: string; avatar_url?: string };

  const [name, setName] = useState(meta.display_name ?? "");
  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<Message | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(meta.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resettingPassword, setResettingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  const initial = (name || user?.email || "?").trim().charAt(0).toUpperCase();

  async function handleAvatarSelected(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      setAvatarMessage({ kind: "error", text: "Please choose an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ kind: "error", text: "Image must be under 5 MB." });
      return;
    }
    setUploading(true);
    setAvatarMessage(null);

    const path = `${user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      setAvatarMessage({ kind: "error", text: uploadError.message });
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: url } });

    setUploading(false);
    if (metaError) {
      setAvatarMessage({ kind: "error", text: metaError.message });
    } else {
      setAvatarUrl(url);
      setAvatarMessage({ kind: "ok", text: "Photo updated." });
    }
  }

  function startEditingName() {
    setNameDraft(name);
    setNameMessage(null);
    setEditingName(true);
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameMessage(null);
    const trimmed = nameDraft.trim();
    const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
    setSavingName(false);
    if (error) {
      setNameMessage({ kind: "error", text: error.message });
    } else {
      setName(trimmed);
      setEditingName(false);
    }
  }

  function startResettingPassword() {
    setOldPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setPasswordMessage(null);
    setResettingPassword(true);
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    if (newPassword.length < 8) {
      setPasswordMessage({ kind: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordMessage({ kind: "error", text: "New passwords don't match." });
      return;
    }
    setSavingPassword(true);
    setPasswordMessage(null);

    // Verify the old password by re-authenticating before allowing the change.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (verifyError) {
      setSavingPassword(false);
      setPasswordMessage({ kind: "error", text: "Old password is incorrect." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPassword(false);
    if (error) {
      setPasswordMessage({ kind: "error", text: error.message });
    } else {
      setResettingPassword(false);
      setPasswordMessage({ kind: "ok", text: "Password updated." });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-zinc-950/90 px-4 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Account</h1>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
            className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-zinc-700 active:scale-95 disabled:opacity-60"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, next/image needs remote config
              <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-500">
                {initial}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
              {uploading ? "Uploading…" : "Edit"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarSelected(file);
              e.target.value = "";
            }}
          />
          {avatarMessage && (
            <p className={`text-sm ${avatarMessage.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {avatarMessage.text}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="rounded-2xl bg-zinc-900 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Name</p>
          {editingName ? (
            <form onSubmit={handleSaveName} className="mt-2 flex gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your name"
                className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={savingName}
                className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
              >
                {savingName ? "…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="rounded-xl bg-zinc-800 px-4 py-3 font-medium text-zinc-300"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <p className={name ? "text-white" : "text-zinc-500"}>{name || "Not set"}</p>
              <button
                onClick={startEditingName}
                className="text-sm font-semibold text-emerald-400 active:text-emerald-300"
              >
                Edit
              </button>
            </div>
          )}
          {nameMessage && (
            <p className={`mt-2 text-sm ${nameMessage.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {nameMessage.text}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="rounded-2xl bg-zinc-900 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</p>
          <p className="mt-1 text-white">{user?.email}</p>
        </div>

        {/* Reset password */}
        <div className="rounded-2xl bg-zinc-900 px-4 py-4">
          {resettingPassword ? (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Reset password
              </p>
              <input
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Old password"
                className="rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repeat new password"
                className="rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingPassword || !oldPassword || !newPassword || !repeatPassword}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-40"
                >
                  {savingPassword ? "Saving…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => setResettingPassword(false)}
                  className="rounded-xl bg-zinc-800 px-4 py-3 font-medium text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startResettingPassword}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-semibold text-white">Reset password</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-600">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {passwordMessage && (
            <p className={`mt-2 text-sm ${passwordMessage.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {passwordMessage.text}
            </p>
          )}
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-2xl bg-zinc-900 px-4 py-4 font-semibold text-red-400 active:bg-zinc-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
