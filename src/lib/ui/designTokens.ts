// lib/ui/designTokens.ts

// 🎨 Text Colors
const textColors = {
  primary: '#ffffff',
  secondary: '#d1d5db',
  muted: '#9ca3af',
  white: '#ffffff',
  black: '#000000',
  success: '#16a34a',
  danger: '#dc2626',
}

// 🎨 Color Variants
const colorVariants = {
  primary: '#2563eb',
  primaryHover: '#1e40af',
  secondary: '#64748b',
  secondaryHover: '#475569',
  surface: '#f9fafb',
  surfaceHover: '#f3f4f6',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
  success: '#16a34a',
  successHover: '#15803d',
  white: '#ffffff',
  black: '#000000',
}

// 🌗 Shadows
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  "2xl": '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}

export const designTokens = {
  textColors,
  colorVariants,
  shadows,
  // 📏 Spacing Scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
    "2xl": '8rem',
  },

  // 🔠 Font Sizes
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    "2xl": '1.5rem',
  },

  // 📐 Border Radius
  radii: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    "2xl": '1.5rem',
    full: '9999px',
  },

  // 🧱 Border Utilities
  borders: {
    width: {
      none: '0',
      sm: '1px',
      md: '2px',
      lg: '4px',
    },
    color: {
      ...colorVariants,
      default: '#e5e7eb', // gray-200 — neutral border
      outline: '#d1d5db', // gray-300 — for focus rings or outlines
    },
    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
    },
  },

  // 🔘 Size Variants (used in tokens.ts for inputs/buttons)
  sizeVariants: {
    xs: {
      fontSize: '0.75rem',
      paddingX: '0.25rem',
      paddingY: '0.125rem',
    },
    sm: {
      fontSize: '0.875rem',
      paddingX: '0.5rem',
      paddingY: '0.25rem',
    },
    md: {
      fontSize: '1rem',
      paddingX: '1rem',
      paddingY: '0.5rem',
    },
    lg: {
      fontSize: '1.125rem',
      paddingX: '1.5rem',
      paddingY: '0.75rem',
    },
    xl: {
      fontSize: '1.25rem',
      paddingX: '2rem',
      paddingY: '1rem',
    },
  },

  // 📏 Line Height
  leading: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // 📏 Vertical Spacing
  spacingY: {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
    "2xl": '8rem',
  },
};