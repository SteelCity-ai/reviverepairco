import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "../components/LoginForm";

export const metadata: Metadata = {
  title: "Client Login | Revive Repair Specialists",
  description:
    "Sign in to your Revive Repair Specialists client account to view project updates, invoices, and documents.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] flex-col bg-[var(--color-surface)]">
      <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden flex-col justify-between rounded-[32px] bg-[var(--color-primary)] p-10 text-white shadow-[0_26px_70px_rgba(15,23,42,0.16)] lg:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
                Client portal
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Your project, in one place.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/80">
                Sign in to follow your project from estimate to final walkthrough — review
                scopes of work, see photo updates, approve change orders, and download
                invoices and warranty documents.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-white/85">
                {[
                  "Live project status & next steps",
                  "Crew schedule and on-site photos",
                  "Estimates, change orders, and invoices",
                  "Warranty and inspection documents",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-amber)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-10 text-xs uppercase tracking-[0.24em] text-white/50">
              Coming soon — portal launching for active clients
            </p>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-[0_26px_70px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-primary)]">
              Welcome back.
            </h2>
            <p className="mt-3 text-base text-[var(--color-slate)]">
              Enter your account details below to access your project dashboard.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <div className="mt-8 border-t border-black/5 pt-6 text-sm text-[var(--color-slate)]">
              <p>
                Not a Revive client yet?{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  Request a free estimate
                </Link>
                .
              </p>
              <p className="mt-2">
                Need account help?{" "}
                <a
                  href="tel:+17175001434"
                  className="font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  Call (717) 500-1434
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
