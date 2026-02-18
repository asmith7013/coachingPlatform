import { ElementType, ReactNode } from "react";
import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { textSize, weight, textColors } from "@/lib/tokens/tokens";
import {
  TextSizeToken,
  FontWeightToken,
  TextColorToken,
} from "@/lib/tokens/types";

const text = tv({
  base: "font-body leading-normal",
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
      "2xl": textSize["2xl"],
    },
    weight: {
      normal: weight.normal,
      medium: weight.medium,
      semibold: weight.semibold,
      bold: weight.bold,
    },
    color: {
      default: textColors.default,
      muted: textColors.muted,
      accent: textColors.accent,
      primary: textColors.primary,
      secondary: textColors.secondary,
      danger: textColors.danger,
      success: textColors.success,
      surface: textColors.surface,
      background: textColors.background,
      border: textColors.border,
      white: textColors.white,
      black: textColors.black,
    },
  },
  defaultVariants: {
    textSize: "base",
    weight: "normal",
    color: "default",
  },
});

export type TextVariants = VariantProps<typeof text>;

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  children: ReactNode;
  as?: ElementType;
  textSize?: TextSizeToken;
  weight?: FontWeightToken;
  color?: TextColorToken;
  className?: string;
}

export function Text({
  children,
  as: Component = "p",
  textSize,
  weight,
  color,
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(text({ textSize, weight, color }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
