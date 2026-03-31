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

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
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
    </>
  );
}
