"use client";
import { cn } from "@/lib/utils/general";
import { tv, type VariantProps } from "tailwind-variants";
import { textSize, paddingX, paddingY } from '@/lib/ui/tokens'

// Define component-specific types
type BadgeTextSize = 'xs' | 'sm' | 'base';
type BadgePadding = 'xs' | 'sm' | 'md';
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

const badge = tv({
  base: "inline-block rounded-full font-semibold",
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
    },
    padding: {
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
    },
    variant: {
      primary: "bg-primary-700 text-white",
      secondary: "bg-secondary-700 text-white",
      success: "bg-success-700 text-white",
      danger: "bg-danger-700 text-white",
      warning: "bg-warning-700 text-black",
      info: "bg-info-700 text-white",
    },
  },
  defaultVariants: {
    textSize: "xs",
    padding: "sm",
    variant: "primary",
  },
});

export type BadgeVariants = VariantProps<typeof badge>;

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  textSize?: BadgeTextSize;
  padding?: BadgePadding;
  variant?: BadgeVariant;
}

export function Badge({ 
  children, 
  className,
  textSize,
  padding,
  variant,
}: BadgeProps) {
  return (
    <span
      className={cn(
        badge({ textSize, padding, variant }),
        className
      )}
    >
      {children}
    </span>
  );
} 