import { tv, type VariantProps } from "tailwind-variants";
import { heading, textSize, weight, color } from "../../tokens/typography";

export const headingVariants = tv({
  base: "font-heading tracking-tight",
  variants: {
    level: heading,
    color: color,
  },
  defaultVariants: {
    level: "h3",
    color: "default",
  },
});

export const textVariants = tv({
  base: "font-body leading-normal",
  variants: {
    size: textSize,
    weight: weight,
    color: color,
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "default",
  },
});

export type HeadingVariants = VariantProps<typeof headingVariants>;
export type TextVariants = VariantProps<typeof textVariants>;
