// lib/ui/tokens.ts
// import { tailwindColors } from './tokens/colors';

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

  success: '#18a058',
  successHover: '#0f7a45',

  white: 'white',
  black: '#000000',
};

// 🎨 Text Colors
export const textColors = {
  primary: `text-${semanticColors.primary}`,
  secondary: `text-${semanticColors.textMuted}`,
  muted: `text-${semanticColors.textMuted}`,
  white: `text-${semanticColors.white}`,
  black: `text-[${semanticColors.black}]`,
  success: `text-[${semanticColors.success}]`,
  danger: `text-${semanticColors.danger}`,
};

export type TextColor = keyof typeof textColors;

// 🎨 Text On Background Colors
export const textOn = {
  primary: textColors.white,
  secondary: textColors.white,
  surface: textColors.primary,
  success: textColors.white,
  danger: textColors.white,
};

export type TextOnColor = keyof typeof textOn;

// 🎨 Background Colors
export const backgroundColors = {
  surface: `bg-${semanticColors.surface}`,
  surfaceHover: `bg-${semanticColors.surfaceHover}`,
  primary: `bg-${semanticColors.primary}`,
  primaryHover: `hover:bg-${semanticColors.primaryHover}`,
  secondary: `bg-${semanticColors.sidebarBg}`,
  secondaryHover: `hover:bg-${semanticColors.sidebarBg}-600`,
  danger: `bg-${semanticColors.danger}`,
  dangerHover: `hover:bg-${semanticColors.danger}-600`,
  success: `bg-[${semanticColors.success}]`,
  successHover: `hover:bg-[${semanticColors.successHover}]`,
  white: `bg-${semanticColors.white}`,
  black: `bg-[${semanticColors.black}]`,
};

export type BackgroundColor = keyof typeof backgroundColors;

// 🎨 Border Colors
export const borderColors = {
  primary: `border-${semanticColors.primary}`,
  secondary: `border-${semanticColors.sidebarBg}`,
  surface: `border-${semanticColors.surface}-200`,
  default: `border-${semanticColors.surface}-200`,
  outline: `border-${semanticColors.surface}-300`,
  success: `border-[${semanticColors.success}]`,
  danger: `border-${semanticColors.danger}`,
  white: `border-${semanticColors.white}`,
  black: `border-[${semanticColors.black}]`,
};

export type BorderColor = keyof typeof borderColors;

// 🔠 Typography
export const typography = {
  heading: {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium uppercase',
  },
  text: {
    xs: 'text-xs leading-normal',
    sm: 'text-sm leading-normal',
    base: 'text-base leading-normal',
    lg: 'text-lg leading-normal',
    xl: 'text-xl leading-normal',
  },
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
};

export type HeadingLevel = keyof typeof typography.heading;
export type TextSize = keyof typeof typography.text;
export type FontWeight = keyof typeof typography.weight;

// 🎯 Table Styles
export const table = {
  wrapper: 'w-full overflow-hidden shadow-sm rounded-lg',
  base: 'min-w-full divide-y divide-gray-200',
  header: {
    cell: 'px-4 py-3 text-gray-500 font-medium text-left',
    row: 'bg-gray-50',
  },
  body: {
    row: 'border-t border-gray-200',
    cell: 'px-4 py-3 text-base text-gray-900',
    link: 'text-gray-900 hover:text-gray-500',
  },
  footer: {
    wrapper: 'px-4 py-3 border-t border-gray-200',
    text: 'text-sm text-gray-500',
  },
};

// 🌗 Shadows (using Tailwind's built-in shadows)
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  "2xl": 'shadow-2xl',
};

export type Shadow = keyof typeof shadows;

// 🧱 Border Utilities
export const borderWidths = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
};

export const borderStyles = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

export const borderPositions = {
  top: 'border-t',
  right: 'border-r',
  bottom: 'border-b',
  left: 'border-l',
  all: 'border',
};

export type BorderWidth = keyof typeof borderWidths;
export type BorderStyle = keyof typeof borderStyles;
export type BorderPosition = keyof typeof borderPositions;

// 📏 Spacing utility classes
export const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  "2xl": 'p-12',
};

export type Spacing = keyof typeof spacing;

// 🔠 Font Size classes
export const fontSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  "2xl": 'text-2xl',
};

export type FontSize = keyof typeof fontSizes;

// 📐 Radius utility classes
export const radii = {
  none: 'rounded-none',
  xs: 'rounded-sm',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  "2xl": 'rounded-2xl',
  full: 'rounded-full',
};

export type Radius = keyof typeof radii;

// 🔘 Size Variants for buttons/inputs
export const sizeVariants = {
  xs: 'text-xs px-1 py-0.5',
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
  xl: 'text-xl px-8 py-4',
};

export type SizeVariant = keyof typeof sizeVariants;

// 📏 Line Height
export const leading = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
};

export type Leading = keyof typeof leading;

// 📏 Vertical Spacing
export const spacingY = {
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  "2xl": 'space-y-12',
};

export type SpacingY = keyof typeof spacingY;

// 🎯 Layout Utilities
export const layout = {
  container: 'container mx-auto',
  cardStack: 'flex flex-col space-y-4',
  grid: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  flex: {
    row: 'flex flex-row',
    col: 'flex flex-col',
    center: 'items-center justify-center',
    between: 'justify-between',
    start: 'justify-start',
    end: 'justify-end',
  },
};

export type Layout = keyof typeof layout;

// ✳️ Utility function for joining classnames
export const mergeTokens = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(' ');

// 💎 Semantic Variant Styles
export const variantStyles = {
  primary: {
    bg: backgroundColors.primary,
    text: textColors.white,
    border: borderColors.primary,
  },
  secondary: {
    bg: backgroundColors.secondary,
    text: textColors.white,
    border: borderColors.secondary,
  },
  surface: {
    bg: backgroundColors.surface,
    text: textColors.primary,
    border: borderColors.surface,
  },
  success: {
    bg: backgroundColors.success,
    text: textColors.white,
    border: borderColors.success,
  },
  danger: {
    bg: backgroundColors.danger,
    text: textColors.white,
    border: borderColors.danger,
  },
};

export type VariantStyle = keyof typeof variantStyles;

// 📏 Padding Helpers
export const padding = {
  x: {
    xs: 'px-1',
    sm: 'px-2',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
  },
  y: {
    xs: 'py-0.5',
    sm: 'py-1',
    md: 'py-2',
    lg: 'py-3',
    xl: 'py-4',
  },
};

export type PaddingSize = keyof typeof padding.x;

export const tokens = {
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
  // ... existing code ...
} as const;