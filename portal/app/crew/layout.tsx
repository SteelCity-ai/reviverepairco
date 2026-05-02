import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/crew/today", label: "My Day", icon: "☀" },
  { href: "/crew/upcoming", label: "Upcoming", icon: "📅" },
  { href: "/crew/done", label: "Done", icon: "✓" },
  { href: "/crew/clock-in", label: "Clock In", icon: "⏱" },
];

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      {/* Header */}
      <header className="sticky inset-x-0 top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-amber)] text-xs font-bold text-[var(--color-primary)]">
              R
            </div>
            <span className="text-sm font-semibold text-[var(--color-primary)]">Revive Crew</span>
          </div>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Nav (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium text-gray-500 transition hover:text-[var(--color-amber)]"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
