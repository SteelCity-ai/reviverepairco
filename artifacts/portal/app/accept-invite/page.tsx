import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Card } from "@/components/ui/Card";

const BASE = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? "/portal";

/**
 * Clerk invitation acceptance flow.
 *
 * The invitation email links here with `?__clerk_ticket=<ticket>`. When the
 * ticket is present we render Clerk's <SignUp/> in `ticket` mode, which
 * auto-binds the invited identity. Without a ticket we show a friendly
 * "no invitation found" fallback so the page does not silently break.
 */
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ __clerk_ticket?: string }>;
}) {
  const sp = await searchParams;
  const ticket = sp?.__clerk_ticket;
  const after = BASE === "" ? "/" : `${BASE}/`;

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
        <Card className="w-full max-w-md text-center animate-fade-in-up">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-amber)] text-lg font-bold text-[var(--color-primary)]">
              R
            </div>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Invitation link required
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This page accepts Clerk invitation links. Open the invitation
            email from your project manager and click the secure link there
            to complete account setup.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href={`${BASE}/sign-in`}
              className="font-semibold text-[var(--color-primary)] underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <SignUp
        path={`${BASE}/accept-invite`}
        routing="path"
        signInUrl={`${BASE}/sign-in`}
        afterSignUpUrl={after}
        afterSignInUrl={after}
      />
    </div>
  );
}
