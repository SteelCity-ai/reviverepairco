"use client";

import { useState } from "react";

const services = [
  "Roofing",
  "General Contracting",
  "Renovation",
  "Demolition",
  "Not sure yet",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPageForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      service: String(formData.get("service") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong sending your request.");
      }

      setStatus("success");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your request.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[var(--color-amber)]/30 bg-[var(--color-surface)] p-8 text-center">
        <h3 className="text-2xl font-bold text-[var(--color-primary)]">Thanks!</h3>
        <p className="mt-3 text-base text-[var(--color-slate)]">
          We&apos;ve got your request and will follow up shortly to confirm a time. For
          anything urgent, please call{" "}
          <a
            href="tel:+17175001434"
            className="font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
          >
            (717) 500-1434
          </a>
          .
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-[var(--color-primary)]"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
          />
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="block text-sm font-semibold text-[var(--color-primary)]"
          >
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            placeholder="(717) 555-1234"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-[var(--color-primary)]"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
          />
        </div>
        <div>
          <label
            htmlFor="contact-service"
            className="block text-sm font-semibold text-[var(--color-primary)]"
          >
            Service needed
          </label>
          <select
            id="contact-service"
            name="service"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
          >
            <option value="" disabled>
              Choose one…
            </option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-[var(--color-primary)]"
        >
          Project details
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us what's going on, when it started, and whether it's urgent."
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-2 focus:ring-[var(--color-amber)]/30"
        />
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage} You can also call us at{" "}
          <a href="tel:+17175001434" className="font-semibold underline">
            (717) 500-1434
          </a>
          .
        </div>
      )}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-slate)]">
          Your information is private and never shared.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Request free estimate"}
        </button>
      </div>
    </form>
  );
}
