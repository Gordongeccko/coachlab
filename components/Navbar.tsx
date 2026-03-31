"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/planner", label: "Planner" },
  { href: "/sessions", label: "Pass" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-2 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-accent-muted border border-accent/30 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22A06B"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 6.9 17.1M12 2a10 10 0 0 0-6.9 17.1" />
              <path d="M2.5 9h5.5l3-3 3 3h5.5" />
              <path d="M2.5 15h5.5l3 3 3-3h5.5" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
          </div>
          <span className="text-base font-bold text-ink-primary group-hover:text-accent-fg transition-colors">
            CoachLab
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-surface-3 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-surface-3"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
