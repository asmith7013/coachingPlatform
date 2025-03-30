// lib/ui/designTokens.ts

// 🎨 Text Colors
const textColors = {
  primary: '#ffffff',
  secondary: '#d1d5db',
  muted: '#9ca3af',
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

export const designTokens = {
  textColors,
  colorVariants,
  // 📏 Spacing Scale
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
  },

  // 🔠 Font Sizes
  fontSize: {
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },

  // 📐 Border Radius
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },

  // 🧱 Border Utilities
  borders: {
    width: {
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
    },
  },

  // 🔘 Size Variants (used in tokens.ts for inputs/buttons)
  sizeVariants: {
    sm: {
      fontSize: '0.875rem', // ~text-sm
      paddingX: '0.5rem',
      paddingY: '0.25rem',
    },
    md: {
      fontSize: '1rem', // ~text-base
      paddingX: '1rem',
      paddingY: '0.5rem',
    },
    lg: {
      fontSize: '1.125rem', // ~text-lg
      paddingX: '1.5rem',
      paddingY: '0.75rem',
    },
  },
};