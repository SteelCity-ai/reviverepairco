export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-amber)]" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
