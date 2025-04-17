import { tv } from 'tailwind-variants';
import { typography, textColors } from './tokens';

export const heading = tv({
  base: 'font-heading font-semibold tracking-tight',
  variants: {
    size: {
      h1: 'text-4xl md:text-5xl leading-tight',
      h2: 'text-3xl md:text-4xl leading-tight',
      h3: 'text-2xl md:text-3xl leading-snug',
      h4: 'text-xl md:text-2xl leading-snug',
      h5: 'text-lg md:text-xl leading-normal',
      h6: 'text-base md:text-lg leading-normal',
    },
    color: textColors,
  },
  defaultVariants: {
    size: 'h1',
    color: 'default',
  },
});

export const text = tv({
  base: 'font-body leading-normal',
  variants: {
    size: typography.text,
    color: textColors,
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'base',
    color: 'default',
    weight: 'normal',
  },
});

export type HeadingVariants = typeof heading.variants;
export type TextVariants = typeof text.variants; 