const badges = [
  "Licensed Pennsylvania contractor",
  "Fully insured crews",
  "Storm damage specialists",
  "Insurance claim support",
  "Serving Harrisburg & Central PA",
];

export default function TrustBadges() {
  return (
    <div className="-mt-10 relative z-20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-6">
        {badges.map((badge) => (
          <div
            key={badge}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-slate)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-amber)]/15 text-[var(--color-amber)]">
              ✓
            </span>
            {badge}
          </div>
        ))}
      </div>
    </div>
  );
}
