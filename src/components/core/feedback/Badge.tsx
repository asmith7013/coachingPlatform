"use client";
import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens';
import { backgroundColors, textColors } from '@ui-tokens/colors';

// Define component-specific types
type BadgeTextSize = 'xs' | 'sm' | 'base';
type BadgePadding = 'xs' | 'sm' | 'md';
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

const badge = tv({
  base: `inline-block font-semibold ${radii.full}`,
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
      primary: `${backgroundColors.primary} ${textColors.default}`,
      secondary: `${backgroundColors.secondary} ${textColors.default}`,
      success: `${backgroundColors.success} ${textColors.default}`,
      danger: `${backgroundColors.danger} ${textColors.default}`,
      warning: `${backgroundColors.danger} ${textColors.default}`,
      info: `${backgroundColors.primary} ${textColors.default}`,
    },
  },
  defaultVariants: {
    textSize: "xs",
    padding: "sm",
    variant: "primary",
  },
});

export type BadgeVariants = VariantProps<typeof badge>;

export interface BadgeProps {
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