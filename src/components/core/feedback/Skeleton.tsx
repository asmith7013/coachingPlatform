import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/ui/utils/formatters";
import { spaceBetween } from "@/lib/tokens/tokens";

/**
 * Base Skeleton component for loading states
 * Provides consistent shimmer animation across the application
 * Follows existing token system and design patterns
 */
const skeleton = tv({
  base: "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
  variants: {
    height: {
      xs: "h-3",
      sm: "h-4",
      base: "h-5",
      lg: "h-6",
      xl: "h-8",
      "2xl": "h-10",
      "3xl": "h-12",
    },
    width: {
      xs: "w-8",
      sm: "w-16",
      base: "w-24",
      lg: "w-32",
      xl: "w-48",
      "2xl": "w-64",
      "1/6": "w-1/6",
      "1/4": "w-1/4",
      "1/3": "w-1/3",
      "1/2": "w-1/2",
      "2/3": "w-2/3",
      "3/4": "w-3/4",
      full: "w-full",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      base: "rounded",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    height: "base",
    width: "full",
    rounded: "base",
  },
});

export type SkeletonVariants = VariantProps<typeof skeleton>;

interface SkeletonProps extends SkeletonVariants {
  className?: string;
  "aria-label"?: string;
}

export function Skeleton({
  height,
  width,
  rounded,
  className,
  "aria-label": ariaLabel = "Loading...",
}: SkeletonProps) {
  return (
    <div
      className={cn(skeleton({ height, width, rounded }), className)}
      aria-label={ariaLabel}
      role="status"
    />
  );
}

/**
 * Skeleton group for multiple related loading elements
 */
interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "xs" | "sm" | "base" | "lg" | "xl";
}

export function SkeletonGroup({
  children,
  className,
  spacing = "base",
}: SkeletonGroupProps) {
  const spacingClasses = {
    xs: spaceBetween.y.xs,
    sm: spaceBetween.y.sm,
    base: "space-y-3",
    lg: spaceBetween.y.md,
    xl: spaceBetween.y.lg,
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>{children}</div>
  );
}
