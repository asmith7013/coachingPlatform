// Shared tailwind-variants definitions based on design tokens
import { tv, type VariantProps } from 'tailwind-variants';
import { type BooleanVariantProps } from './variantHelpers';

// 🎨 Visual Styling
export const radiusVariant = tv({
  variants: {
    radius: {
      none: 'rounded-none',
      xs: 'rounded-sm',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    radius: 'md',
  },
});

export const shadowVariant = tv({
  variants: {
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-xs',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    },
  },
  defaultVariants: {
    shadow: 'md',
  },
});

// 🧩 Boolean Behaviors
export const disabledVariant = tv({
  variants: {
    disabled: {
      true: 'opacity-50 pointer-events-none',
      false: '',
    }
  },
  defaultVariants: {
    disabled: false,
  }
});

export const loadingVariant = tv({
  variants: {
    loading: {
      true: 'cursor-wait',
      false: '',
    }
  },
  defaultVariants: {
    loading: false,
  }
});

export const fullWidthVariant = tv({
  variants: {
    fullWidth: {
      true: 'w-full',
      false: '',
    }
  },
  defaultVariants: {
    fullWidth: false,
  }
});

// ✅ Export variant types
export type RadiusVariantProps = VariantProps<typeof radiusVariant>;
export type ShadowVariantProps = VariantProps<typeof shadowVariant>;
export type DisabledVariantProps = BooleanVariantProps<typeof disabledVariant>;
export type LoadingVariantProps = BooleanVariantProps<typeof loadingVariant>;
export type FullWidthVariantProps = BooleanVariantProps<typeof fullWidthVariant>;

// Padding variants
export const paddingVariant = tv({
  variants: {
    padding: {
      none: 'p-0',
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
      '2xl': 'p-10',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

// Boolean variants with proper string typing
export const borderVariant = tv({
  variants: {
    border: {
      true: 'border border-gray-200',
      false: '',
    }
  },
  defaultVariants: {
    border: false,
  }
});

// Export variant types for easier consumption
export type PaddingVariantProps = VariantProps<typeof paddingVariant>;
export type BorderVariantProps = BooleanVariantProps<typeof borderVariant>; 