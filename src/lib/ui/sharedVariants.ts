// Shared tailwind-variants definitions based on design tokens
import { tv, type VariantProps } from 'tailwind-variants';
import {
  radii,
  shadows,
  layout,
} from './tokens';
import { typography } from './tokens/typography'
import { gap } from './tokens/spacing'

import { booleanVariant } from './utils/variantHelpers';

// 🔷 Component Sizing
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeVariants = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-2.5',
  xl: 'text-xl px-6 py-3',
};

export const sizeVariant = tv({
  variants: {
    size: sizeVariants,
  },
  defaultVariants: {
    size: 'md',
  },
});

export const textSizeVariant = tv({
  variants: {
    textSize: typography.textSize
  },
  defaultVariants: {
    textSize: 'base'
  }
});

export const paddingVariant = tv({
  variants: {
    padding: {
      none: 'p-0',
      xs: 'px-2 py-1',
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-5 py-2.5',
      xl: 'px-6 py-3',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

// 🎨 Visual Styling
export const radiusVariant = tv({
  variants: {
    radius: radii,
  },
  defaultVariants: {
    radius: 'md',
  },
});

export const shadowVariant = tv({
  variants: {
    shadow: shadows,
  },
  defaultVariants: {
    shadow: 'sm',
  },
});

// 🧩 Boolean Behaviors
export const disabledVariant = tv({
  variants: {
    disabled: booleanVariant('opacity-50 pointer-events-none'),
  },
  defaultVariants: {
    disabled: false,
  },
});

export const loadingVariant = tv({
  variants: {
    loading: booleanVariant('cursor-wait'),
  },
  defaultVariants: {
    loading: false,
  },
});

export const fullWidthVariant = tv({
  variants: {
    fullWidth: booleanVariant('w-full'),
  },
  defaultVariants: {
    fullWidth: false,
  },
});

// 📝 Typography & Layout
export const textColorVariant = tv({
  variants: {
    color: typography.color
  },
  defaultVariants: {
    color: 'default'
  }
});

export const alignmentVariant = tv({
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

export const gapVariant = tv({
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
});

// ✅ Export variant types
export type SizeVariantType = VariantProps<typeof sizeVariant>;
export type TextSizeVariantType = VariantProps<typeof textSizeVariant>;
export type PaddingVariantType = VariantProps<typeof paddingVariant>;
export type RadiusVariantType = VariantProps<typeof radiusVariant>;
export type ShadowVariantType = VariantProps<typeof shadowVariant>;
export type DisabledVariantType = VariantProps<typeof disabledVariant>;
export type LoadingVariantType = VariantProps<typeof loadingVariant>;
export type FullWidthVariantType = VariantProps<typeof fullWidthVariant>;
export type TextColorVariantType = VariantProps<typeof textColorVariant>;
export type AlignmentVariantType = VariantProps<typeof alignmentVariant>;
export type GapVariantType = VariantProps<typeof gapVariant>;
export type HeadingVariantType = VariantProps<typeof headingVariants>;
export type TextVariantType = VariantProps<typeof textVariants>;
export type GridVariantType = VariantProps<typeof gridVariants>;
export type FlexVariantType = VariantProps<typeof flexVariants>;

// Re-export helper functions
export { booleanVariant } from './utils/variantHelpers';

export const headingVariants = tv({
  base: 'font-heading tracking-tight',
  variants: {
    level: typography.heading,
    color: typography.color,
  },
  defaultVariants: {
    level: 'h3',
    color: 'default',
  },
})

export const textVariants = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize: typography.textSize,
    weight: typography.weight,
    color: typography.color,
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
  },
})

export const gridVariants = tv({
  base: 'grid',
  variants: {
    cols: layout.grid.cols,
    gap: layout.grid.gap,
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})

export const flexVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end', 
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center', 
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    gap,
  },
  defaultVariants: {
    gap: 'md',
    direction: 'row',
    justify: 'start',
    align: 'start',
  },
}) 