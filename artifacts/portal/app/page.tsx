import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const BASE = process.env.PORTAL_BASE_PATH ?? "/portal";

export default async function HomePage() {
  const { userId, sessionClaims } = await auth();

  if (userId) {
    const role =
      (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ??
      "CREW";
    if (role === "ADMIN") redirect(`${BASE}/admin/dashboard`);
    if (role === "CREW") redirect(`${BASE}/crew/today`);
    redirect(`${BASE}/client/projects`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-primary)] text-white">
      <header className="px-6 py-5">
        <Image
          src="/images/revive-logo-v3.png"
          alt="Revive Repair"
          width={140}
          height={42}
          className="h-10 w-auto brightness-0 invert"
        />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Revive Repair Portal
        </h1>
        <p className="mt-4 max-w-md text-white/70">
          Project management for our crew, project managers, and clients.
          Roofing and general contracting in Central Pennsylvania.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/sign-in"
            className="rounded-full bg-[var(--color-amber)] px-6 py-2.5 font-semibold text-[var(--color-primary)] transition hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/60">
          New users are invite-only. Please contact your project manager.
        </p>
      </main>
      <footer className="px-6 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Revive Repair Co.
      </footer>
    </div>
  );
}
