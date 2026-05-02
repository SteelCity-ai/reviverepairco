"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-[var(--color-amber-light)]",
  secondary: "border border-[var(--color-border)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)]",
  ghost: "text-[var(--color-primary)] hover:bg-[var(--color-surface)]",
  danger: "bg-[var(--color-danger)] text-white hover:bg-red-600",
  outline: "border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)]/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-4 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-amber)] disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
