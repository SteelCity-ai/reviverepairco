import { Card } from "@/components/ui/Card";

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <Card className="max-w-md w-full text-center animate-fade-in-up">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-amber)] text-lg font-bold text-[var(--color-primary)]">
            R
          </div>
        </div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Accept Invitation</h1>
        <p className="mt-2 text-sm text-gray-500">
          Check your email for the invitation link from Clerk. Click the link in your email to complete setup.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Having trouble? Contact your project manager.
        </p>
      </Card>
    </div>
  );
}
