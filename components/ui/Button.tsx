import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" &&
          "bg-accent text-accent-fg hover:bg-accent-light",
        variant === "secondary" &&
          "bg-surface-3 text-ink-primary border border-border hover:bg-surface-4 hover:border-border-strong",
        variant === "ghost" &&
          "text-ink-secondary hover:text-ink-primary hover:bg-surface-3",
        variant === "danger" &&
          "bg-intensity-high/10 text-intensity-high border border-intensity-high/30 hover:bg-intensity-high/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
