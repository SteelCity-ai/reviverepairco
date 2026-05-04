import { SignUp } from "@clerk/nextjs";

const BASE = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? "/portal";

/**
 * Clerk invitation acceptance flow.
 * The invitation email links here with `?__clerk_ticket=<ticket>`; passing
 * `signUpForceRedirectUrl` + ticket-aware <SignUp/> completes the handshake.
 */
export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { __clerk_ticket?: string; redirect_url?: string };
}) {
  const ticket = searchParams?.__clerk_ticket;
  const after = BASE === "" ? "/" : `${BASE}/`;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <SignUp
        path={`${BASE}/accept-invite`}
        routing="path"
        signInUrl={`${BASE}/sign-in`}
        afterSignUpUrl={after}
        afterSignInUrl={after}
        initialValues={ticket ? { } : undefined}
      />
    </div>
  );
}
