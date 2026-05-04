import { SignUp } from "@clerk/nextjs";

const BASE = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? "/portal";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <SignUp
        path={`${BASE}/sign-up`}
        routing="path"
        signInUrl={`${BASE}/sign-in`}
        afterSignUpUrl={BASE === "" ? "/" : `${BASE}/`}
      />
    </div>
  );
}
