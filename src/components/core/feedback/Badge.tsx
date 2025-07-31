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
      mastery: ``,
      blue: ``,
      muted: ``,
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
    },
    // Add interactive variant for clickable badges
    interactive: {
      true: 'cursor-pointer transition-opacity duration-200 hover:opacity-80 active:scale-95',
      false: ''
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
      className: `${backgroundColors.light.danger} ${ringColors.light.danger} border-danger text-danger`,
    },
      {
        appearance: 'solid',
        intent: 'success',
        className: `${backgroundColors.success} ${ringColors.success} border-success text-white`,
      },
      {
        appearance: 'solid',
        intent: 'mastery',
        className: `${backgroundColors.success} ${ringColors.blue} border-blue text-white border-2 ring-2 ring-inset ring-white`,
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
      className: `${ringColors.light.primary} ${textColors.primary} ${backgroundColors.light.primary}`,
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
    {
      appearance: 'outline',
      intent: 'danger',
      className: `${backgroundColors.light.danger} ${ringColors.light.danger} border-danger text-danger`,
    },
    {
      appearance: 'outline',
      intent: 'muted',
      className: `${backgroundColors.light.secondary} ${textColors.muted} ${ringColors.secondary}`,    },
    {
      appearance: 'outline',
      intent: 'blue',
      className: `${backgroundColors.light.blue} ${ringColors.blue} border-blue text-blue hover:bg-blue-500 hover:text-white`,
    },
  ],
  defaultVariants: {
    intent: "neutral",
    appearance: "solid",
    size: "xs",
    rounded: "default",
    interactive: false
  }
});

export type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & VariantProps<typeof badge>;

export function Badge({ 
  children, 
  className,
  intent,
  size,
  rounded,
  appearance,
  onClick,
}: BadgeProps) {
  const isInteractive = Boolean(onClick);
  
  // Use button element if interactive, span if not
  const Component = isInteractive ? 'button' : 'span';
  
  return (
    <Component
      className={cn(
        badge({ 
          intent, 
          size, 
          rounded, 
          appearance, 
          interactive: isInteractive 
        }),
        className
      )}
      onClick={onClick}
      type={isInteractive && Component === 'button' ? 'button' : undefined}
    >
      {children}
    </Component>
  );
}