import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[var(--color-primary)] lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,32,44,0.95)_0%,rgba(26,32,44,0.7)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,158,46,0.18),transparent_50%)]" />

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mb-8">
            <Image
              src="/images/revive-logo-v3.png"
              alt="Revive Repair"
              width={200}
              height={142}
              className="mx-auto h-auto w-48 brightness-0 invert"
            />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-white/70">
            Join the Revive Portal to track your projects, communicate with your
            crew, and stay up to date on every job.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Roofing", "Siding", "Gutters", "Storm Repair"].map((svc) => (
              <span
                key={svc}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/70 backdrop-blur-sm"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Sign Up */}
      <div className="flex w-full items-center justify-center bg-white px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-amber)] text-sm font-bold text-[var(--color-primary)]">
              R
            </div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">Revive Portal</h1>
          </div>
          <SignUp
            appearance={{
              elements: {
                card: "shadow-none border-0",
                headerTitle: "text-[var(--color-primary)] text-xl font-bold",
                headerSubtitle: "text-gray-500 text-sm",
                formButtonPrimary:
                  "bg-[var(--color-amber)] hover:bg-[var(--color-amber-light)] text-[var(--color-primary)] font-semibold rounded-full px-5 py-2.5",
                formFieldInput:
                  "rounded-lg border-[var(--color-border)] focus:border-[var(--color-amber)] focus:ring-[var(--color-amber)]/20",
                footerActionLink:
                  "text-[var(--color-amber)] hover:text-[var(--color-amber-light)]",
              },
            }}
          />
          <p className="mt-4 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-[var(--color-amber)] hover:text-[var(--color-amber-light)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}