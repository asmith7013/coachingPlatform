/**
 * Shared Design System Variants
 * 
 * All variants and helpers combined into a single export object
 * for easier importing and usage.
 */

import { tv, type VariantProps } from 'tailwind-variants';
import { booleanVariant } from '../utils/variant-utils';

// Component state variants
const disabledVariant = tv({
  variants: {
    disabled: booleanVariant('opacity-50 pointer-events-none'),
  },
  defaultVariants: {
    disabled: false,
  },
});

const loadingVariant = tv({
  variants: {
    loading: booleanVariant('cursor-wait'),
  },
  defaultVariants: {
    loading: false,
  },
});

const errorVariant = tv({
  variants: {
    error: booleanVariant('border-danger focus:ring-danger'),
  },
  defaultVariants: {
    error: false,
  },
});

const fullWidthVariant = tv({
  variants: {
    fullWidth: booleanVariant('w-full'),
  },
  defaultVariants: {
    fullWidth: false,
  },
});

// Radius variant
const radiusVariant = tv({
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    radius: 'md',
  },
});

// Shadow variant
const shadowVariant = tv({
  variants: {
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      inner: 'shadow-inner',
    },
  },
  defaultVariants: {
    shadow: 'none',
  },
});

// Export all variants in a single object
export const sharedVariants = {
  // Component state variants
  disabled: disabledVariant.variants.disabled,
  loading: loadingVariant.variants.loading,
  error: errorVariant.variants.error,
  fullWidth: fullWidthVariant.variants.fullWidth,
  radius: radiusVariant.variants.radius,
  shadow: shadowVariant.variants.shadow,
  
  // Utility functions
  booleanVariant,
};

// Example usage in a component:
//
// const myComponent = tv({
//   base: 'base-styles-here',
//   variants: {
//     disabled: sharedVariants.disabled,
//     loading: sharedVariants.loading,
//     radius: sharedVariants.radius,
//     shadow: sharedVariants.shadow,
//     // ...other variants
//   }
// });

// Also export individual variants for those who prefer that style
export {
  disabledVariant,
  loadingVariant,
  errorVariant,
  fullWidthVariant,
  radiusVariant,
  shadowVariant,
  booleanVariant,
};

// Export types
export type DisabledVariant = VariantProps<typeof disabledVariant>;
export type LoadingVariant = VariantProps<typeof loadingVariant>;
export type ErrorVariant = VariantProps<typeof errorVariant>;
export type FullWidthVariant = VariantProps<typeof fullWidthVariant>;
export type RadiusVariant = VariantProps<typeof radiusVariant>;
export type ShadowVariant = VariantProps<typeof shadowVariant>;