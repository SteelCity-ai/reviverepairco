import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-amber)] text-lg font-bold text-[var(--color-primary)]">
            R
          </div>
        </div>
        <h1 className="mb-2 text-xl font-bold text-[var(--color-primary)]">
          Sign Out
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Are you sure you want to sign out of the Revive Portal?
        </p>
        <div className="space-y-3">
          <SignOutButton redirectUrl="/sign-in">
            <button className="w-full rounded-full bg-[var(--color-amber)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-amber-light)]">
              Sign Out
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="block w-full rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}