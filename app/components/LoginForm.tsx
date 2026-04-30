"use client";

import { useState } from "react";

export default function LoginForm() {
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(
      "The client portal isn't live yet — we'll email you as soon as your account is ready.",
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-semibold text-[var(--color-primary)]"
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-sm font-semibold text-[var(--color-primary)]"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() =>
              setNotice("Password reset will be available when the client portal launches.")
            }
            className="text-xs font-semibold text-[var(--color-primary)]/70 underline-offset-4 hover:text-[var(--color-primary)] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-slate)]">
        <input
          type="checkbox"
          name="remember"
          className="h-4 w-4 rounded border-black/20 text-[var(--color-amber)] focus:ring-[var(--color-amber)]"
        />
        Keep me signed in on this device
      </label>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
      >
        Sign in
      </button>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-[var(--color-amber)]/30 bg-[var(--color-surface)] p-4 text-sm text-[var(--color-slate)]"
        >
          {notice}
        </div>
      )}
    </form>
  );
}
