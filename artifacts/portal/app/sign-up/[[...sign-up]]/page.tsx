import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          Invite-only sign-up
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          The Revive Repair Portal is invite-only. Please ask your project
          manager to send you an invitation. The invite email will contain a
          secure link that lets you set your password and sign in.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-full bg-[var(--color-amber)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)]"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
