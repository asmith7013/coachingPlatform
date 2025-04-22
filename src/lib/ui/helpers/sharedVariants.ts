// Shared tailwind-variants definitions based on design tokens
import { tv, type VariantProps } from 'tailwind-variants';
import {
  radii,
  shadows,
} from './tokens';

import { booleanVariant } from './utils/variantHelpers';

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

// ✅ Export variant types
export type RadiusVariantType = VariantProps<typeof radiusVariant>;
export type ShadowVariantType = VariantProps<typeof shadowVariant>;
export type DisabledVariantType = VariantProps<typeof disabledVariant>;
export type LoadingVariantType = VariantProps<typeof loadingVariant>;
export type FullWidthVariantType = VariantProps<typeof fullWidthVariant>;

// Re-export helper functions
export { booleanVariant } from './utils/variantHelpers'; 