"use client";

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function NavbarUserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-3 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center text-xs font-bold text-accent-fg">
            {initials}
          </div>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-muted"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-surface-2 border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            {user.name && (
              <p className="text-sm font-medium text-ink-primary truncate">
                {user.name}
              </p>
            )}
            <p className="text-xs text-ink-muted truncate">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-3 transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profil
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-3 transition-colors text-left"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logga ut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NavbarLoginButton() {
  return (
    <Link
      href="/login"
      className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-light text-accent-fg text-sm font-medium transition-colors"
    >
      Logga in
    </Link>
  );
}
