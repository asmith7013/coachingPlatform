"use client";
import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { textSize, paddingX, paddingY, radii } from '@/lib/tokens/tokens';
import { textColors, backgroundColors, ringColors } from '@/lib/tokens/colors';

// Define badge variants using your semantic color system
const badge = tv({
  base: "inline-flex items-center font-medium border-1 border-inset",
  variants: {
    intent: {
      neutral: ``,
      primary: ``,
      secondary: ``,
      danger: ``,
      success: ``,
      info: ``,
      warning: ``,
    },
    appearance: {
      solid: '',
      alt: '',
      outline: 'bg-transparent',
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
  compoundVariants: [
    // Solid appearance
    {
      appearance: 'solid',
      intent: 'neutral',
      className: `${backgroundColors.light.muted} border-border`,
    },
    {
      appearance: 'solid',
      intent: 'primary',
      className: `${backgroundColors.light.primary} ${ringColors.light.primary}`,
    },
    {
      appearance: 'solid',
      intent: 'secondary',
      className: `${backgroundColors.light.secondary} ${ringColors.light.secondary}`,
    },
    {
      appearance: 'solid',
      intent: 'danger',
      className: `${backgroundColors.light.danger} ${ringColors.light.danger}`,
    },
    {
      appearance: 'solid',
      intent: 'success',
      className: `${backgroundColors.light.success} ${ringColors.success} border-success text-success`,
    },
    // Alt appearance - add more as needed
    {
      appearance: 'alt',
      intent: 'primary',
      className: `${backgroundColors.light.primary} border-primary-300`,
    },
    // Outline appearance - add more as needed
    {
      appearance: 'outline',
      intent: 'primary',
      className: `${ringColors.light.primary}`,
    },
    {
      appearance: 'outline',
      intent: 'secondary',
      className: `${backgroundColors.light.secondary} ${textColors.secondary} ${ringColors.secondary}`,
    },
    {
      appearance: 'outline',
      intent: 'success',
      className: `${backgroundColors.light.success} ${textColors.success} ${ringColors.success}`,
    },
  ],
  defaultVariants: {
    intent: "neutral",
    appearance: "solid",
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
  appearance,
}: BadgeProps) {
  return (
    <span
      className={cn(
        badge({ intent, size, rounded, appearance }),
        className
      )}
    >
      {children}
    </span>
  );
}