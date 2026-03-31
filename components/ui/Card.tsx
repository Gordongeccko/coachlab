import clsx from "clsx";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border",
        variant === "default" && "bg-surface-2",
        variant === "elevated" && "bg-surface-3 shadow-xl shadow-black/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
