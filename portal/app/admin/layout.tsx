import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/admin/projects", label: "Projects", icon: "▦" },
  { href: "/admin/clients", label: "Clients", icon: "◷" },
  { href: "/admin/service-requests", label: "Service Requests", icon: "✉" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
  { href: "/admin/users", label: "Users", icon: "◎" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--color-primary)] text-white">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-amber)] text-sm font-bold text-[var(--color-primary)]">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight">Revive Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-amber)]">
            Main Menu
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-white/10 px-6 py-4">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "shadow-xl",
                },
              }}
            />
          </SignedIn>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
