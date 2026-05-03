import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      {/* Minimal Header */}
      <header className="sticky inset-x-0 top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/client/projects" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-amber)] text-xs font-bold text-[var(--color-primary)]">
              R
            </div>
            <span className="text-sm font-semibold text-[var(--color-primary)]">Revive</span>
          </Link>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
        </div>
      </header>

      {/* Centered Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
