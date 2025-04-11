// Shared tailwind-variants definitions based on design tokens
// import { tv } from 'tailwind-variants';
import {
  sizeVariants,
  radii,
  fontSizes,
  shadows,
  // disabledStates,
  // loadingStates,
  textColors,
  alignments,
  gaps,
  paddings,
} from './tokens';

import type {
  SizeVariant,
  Shadow,
  Radius,
  // DisabledState,
  // LoadingState,
} from './tokens';

import { booleanVariant } from './utils/variantHelpers';

// Common size variant used by buttons, inputs, etc.
export const sizeVariant = {
  variants: {
    size: sizeVariants,
  },
  defaultVariants: {
    size: 'md' as SizeVariant,
  },
};

// Common full width support
export const fullWidthVariant = {
  variants: {
    fullWidth: booleanVariant('w-full'),
  },
  defaultVariants: {
    fullWidth: 'false',
  },
};

// Common radius variant
export const radiusVariant = {
  variants: {
    radius: radii,
  },
  defaultVariants: {
    radius: 'md' as Radius,
  },
};

// Typography support (optional for Text components)
export const textSizeVariant = {
  variants: {
    textSize: fontSizes,
  },
  defaultVariants: {
    textSize: 'base',
  },
};

// Optional shadow / elevation support
export const shadowVariant = {
  variants: {
    shadow: shadows,
  },
  defaultVariants: {
    shadow: 'sm' as Shadow,
  },
};

export const disabledVariant = {
  variants: {
    disabled: booleanVariant('opacity-50 pointer-events-none'),
  },
  defaultVariants: {
    disabled: 'false',
  },
};

export const loadingVariant = {
  variants: {
    loading: booleanVariant('cursor-wait'),
  },
  defaultVariants: {
    loading: 'false',
  },
};

export const textColorVariant = {
  variants: {
    color: textColors,
  },
  defaultVariants: {
    color: 'default',
  },
};

export const alignmentVariant = {
  variants: {
    align: alignments,
  },
  defaultVariants: {
    align: 'start',
  },
};

export const gapVariant = {
  variants: {
    gap: gaps,
  },
  defaultVariants: {
    gap: 'md',
  },
};

export const paddingVariant = {
  variants: {
    padding: paddings,
  },
  defaultVariants: {
    padding: 'md',
  },
};

export { booleanVariant } from './utils/variantHelpers'; 