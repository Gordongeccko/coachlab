import clsx from "clsx";

type BadgeVariant = "category" | "neutral" | "source" | "verified" | "unverified";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
        variant === "neutral" && "bg-surface-3 text-ink-secondary border-border",
        variant === "category" && "bg-surface-4 text-ink-secondary border-border-strong",
        variant === "source" && "bg-surface-4 text-ink-muted border-border",
        variant === "verified" &&
          "bg-accent-muted text-accent-fg border-accent/30",
        variant === "unverified" &&
          "bg-surface-3 text-ink-muted border-border",
        className
      )}
    >
      {variant === "verified" && (
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {children}
    </span>
  );
}
