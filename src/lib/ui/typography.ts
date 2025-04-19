import { tv } from 'tailwind-variants';
import { heading as headingTokens, textSize, weight, color } from './tokens/typography';

export const heading = tv({
  base: 'font-heading font-semibold tracking-tight',
  variants: {
    level: headingTokens,
    color,
  },
  defaultVariants: {
    level: 'h3',
    color: 'default',
  },
});

export const text = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize,
    color,
    weight,
  },
  defaultVariants: {
    textSize: 'base',
    color: 'default',
    weight: 'normal',
  },
});

export type HeadingVariants = typeof heading.variants;
export type TextVariants = typeof text.variants; 