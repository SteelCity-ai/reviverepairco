import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const BASE = process.env.PORTAL_BASE_PATH ?? "/portal";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand (matching existing split-panel login) */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[var(--color-primary)] lg:flex">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,32,44,0.95)_0%,rgba(26,32,44,0.7)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,158,46,0.18),transparent_50%)]" />

        <div className="relative z-10 max-w-md px-8 text-center animate-fade-in-up">
          <div className="mb-8">
            <Image
              src="/images/revive-logo-v3.png"
              alt="Revive Repair"
              width={200}
              height={142}
              className="mx-auto h-auto w-48 brightness-0 invert"
            />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-white">Welcome to the Revive Portal</h2>
          <p className="text-white/70">
            Project management for roofing and general contracting in Central Pennsylvania.
            Access your projects, tasks, and approvals.
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

      {/* Right Panel — Sign In */}
      <div className="flex w-full items-center justify-center bg-white px-4 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-amber)] text-sm font-bold text-[var(--color-primary)]">
              R
            </div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">Revive Portal</h1>
          </div>
          <SignIn
            routing="path"
            path="/portal/sign-in"
            signUpUrl="/portal/sign-up"
            fallbackRedirectUrl="/portal/"
            forceRedirectUrl="/portal/"
          />
        </div>
      </div>
    </div>
  );
}
