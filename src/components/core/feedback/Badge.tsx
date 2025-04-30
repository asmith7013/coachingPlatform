"use client";
import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens';
import { textColors, backgroundColors, ringColors } from '@ui-tokens/colors';

// Define badge variants using your semantic color system
const badge = tv({
  base: "inline-flex items-center font-medium ring-1 ring-inset",
  variants: {
    intent: {
      neutral: `${backgroundColors.light.muted} ${textColors.default} ring-1 ring-inset border-border`,
      primary: `${backgroundColors.light.primary} ${textColors.primary} ring-1 ring-inset ${ringColors.light.primary}`,
      secondary: `${backgroundColors.light.secondary} ${textColors.secondary} ring-1 ring-inset ${ringColors.light.secondary}`,
      danger: `${backgroundColors.light.danger} ${textColors.danger} ring-1 ring-inset ${ringColors.light.danger}`,
      success: `${backgroundColors.light.success} ${textColors.success} ring-1 ring-inset ${ringColors.light.success}`,
      info: `${backgroundColors.light.primary} ${textColors.primary} ring-1 ring-inset ${ringColors.light.primary} opacity-80`,
      warning: `${backgroundColors.light.danger} ${textColors.danger} ring-1 ring-inset ${ringColors.light.danger} opacity-80`,
    },
    size: {
      xs: `${textSize.xs} ${paddingX.xs} ${paddingY.xs}`,
      sm: `${textSize.sm} ${paddingX.sm} ${paddingY.xs}`,
      md: `${textSize.base} ${paddingX.md} ${paddingY.sm}`,
    },
    rounded: {
      default: radii.md,
      full: radii.full,
      none: radii.none
    }
  },
  defaultVariants: {
    intent: "neutral",
    size: "xs",
    rounded: "default"
  }
});

export type BadgeProps = {
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof badge>;

export function Badge({ 
  children, 
  className,
  intent,
  size,
  rounded,
}: BadgeProps) {
  return (
    <span
      className={cn(
        badge({ intent, size, rounded }),
        className
      )}
    >
      {children}
    </span>
  );
}