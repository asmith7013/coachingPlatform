// lib/ui/designTokens.ts

// 🎨 Semantic Color Mapping
const semanticColors = {
  primary: 'red-violet',
  primaryHover: 'red-violet-600',
  primaryDisabled: 'red-violet-300',

  surface: 'seasalt',
  surfaceHover: 'seasalt',

  sidebarBg: 'gunmetal',
  sidebarText: 'white',

  cardBg: 'white',
  textMuted: 'paynes-gray-600',

  focusRing: 'lavender-pink-300',
  hoverText: 'lavender-pink-400',

  danger: 'raspberry-500',
  dangerHover: 'raspberry-600',

  success: 'greenSuccess',
  successHover: 'greenSuccess-600',

  white: 'white',
  black: '#000000',
};

// 🎨 Utility Class Mappings
export const textColors = {
  primary: `text-${semanticColors.primary}`,
  primaryHover: `hover:text-${semanticColors.primaryHover}`,
  primaryDisabled: `text-${semanticColors.primaryDisabled}`,

  surface: `text-${semanticColors.surface}`,
  surfaceHover: `hover:text-${semanticColors.surfaceHover}`,

  sidebar: `text-${semanticColors.sidebarText}`,
  card: `text-${semanticColors.cardBg}`,
  muted: `text-${semanticColors.textMuted}`,

  focusRing: `text-${semanticColors.focusRing}`,
  hoverText: `hover:text-${semanticColors.hoverText}`,

  danger: `text-${semanticColors.danger}`,
  dangerHover: `hover:text-${semanticColors.dangerHover}`,

  success: `text-[${semanticColors.success}]`,
  successHover: `hover:text-[${semanticColors.successHover}]`,

  white: `text-${semanticColors.white}`,
  black: `text-[${semanticColors.black}]`,
};

export const backgroundColors = {
  primary: `bg-${semanticColors.primary}`,
  primaryHover: `hover:bg-${semanticColors.primaryHover}`,
  primaryDisabled: `bg-${semanticColors.primaryDisabled}`,

  surface: `bg-${semanticColors.surface}`,
  surfaceHover: `hover:bg-${semanticColors.surfaceHover}`,

  sidebar: `bg-${semanticColors.sidebarBg}`,
  card: `bg-${semanticColors.cardBg}`,

  focusRing: `bg-${semanticColors.focusRing}`,
  hoverText: `hover:bg-${semanticColors.hoverText}`,

  danger: `bg-${semanticColors.danger}`,
  dangerHover: `hover:bg-${semanticColors.dangerHover}`,

  success: `bg-[${semanticColors.success}]`,
  successHover: `hover:bg-[${semanticColors.successHover}]`,

  white: `bg-${semanticColors.white}`,
  black: `bg-[${semanticColors.black}]`,
};

export const borderColors = {
  primary: `border-${semanticColors.primary}`,
  primaryHover: `hover:border-${semanticColors.primaryHover}`,
  primaryDisabled: `border-${semanticColors.primaryDisabled}`,

  surface: `border-${semanticColors.surface}`,
  surfaceHover: `hover:border-${semanticColors.surfaceHover}`,

  sidebar: `border-${semanticColors.sidebarBg}`,
  card: `border-${semanticColors.cardBg}`,

  focusRing: `border-${semanticColors.focusRing}`,
  hoverText: `hover:border-${semanticColors.hoverText}`,

  danger: `border-${semanticColors.danger}`,
  dangerHover: `hover:border-${semanticColors.dangerHover}`,

  success: `border-[${semanticColors.success}]`,
  successHover: `hover:border-[${semanticColors.successHover}]`,

  white: `border-${semanticColors.white}`,
  black: `border-[${semanticColors.black}]`,
};

// 🌗 Shadows
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// 🧱 Border Utilities
const borders = {
  width: {
    none: '0',
    sm: '1px',
    md: '2px',
    lg: '4px',
  },
  color: {
    ...semanticColors,
    default: '#e5e7eb', // gray-200
    outline: '#d1d5db', // gray-300
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
  position: {
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
    all: 'all',
  },
};

export const designTokens = {
  colors: {
    // Semantic colors
    primary: 'red-violet',
    primaryHover: 'red-violet-600',
    primaryDisabled: 'red-violet-300',
    danger: 'raspberry-500',
    dangerHover: 'raspberry-600',
    text: 'gunmetal',
    textMuted: 'paynes-gray-600',
    background: 'seasalt',
    focusRing: 'lavender-pink-300',
    hoverText: 'lavender-pink-400',
  },
  semanticColors,
  textColors,
  backgroundColors,
  borderColors,
  shadows,
  borders,

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
    '2xl': '8rem',
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },

  // 📐 Border Radius
  radii: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
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
    '2xl': '8rem',
  },

  // 🔘 Component Sizing
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
} as const;