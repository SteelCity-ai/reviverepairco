import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? "/portal";

/**
 * Revive Portal is invite-only — there is no public self-service sign-up.
 * Users complete account setup via the Clerk invitation link, which routes
 * to /accept-invite with a `__clerk_ticket` query parameter.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          Invite-only sign-up
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          The Revive Repair Portal is invite-only. Contact your project
          manager or admin to receive an invitation. The invite email
          contains a secure link that lets you set your password and sign in.
        </p>
        <Link
          href={`${BASE}/sign-in`}
          className="mt-6 inline-block rounded-full bg-[var(--color-amber)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)]"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
