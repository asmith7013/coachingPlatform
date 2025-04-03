// lib/ui/tokens.ts
import { designTokens } from './designTokens';

const { colors } = designTokens;

// 🎨 Text Colors
export const textColors = {
  primary: `text-[${colors.primary}]`,
  secondary: `text-[${colors.gray[700]}]`,
  muted: `text-[${colors.gray[500]}]`,
  white: `text-[${colors.white}]`,
  black: `text-[${colors.black}]`,
  success: `text-[${colors.success}]`,
  danger: `text-[${colors.danger}]`,
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
  surface: `bg-[${colors.gray[50]}]`,
  surfaceHover: `bg-[${colors.gray[100]}] hover:bg-[${colors.gray[100]}]`,
  primary: `bg-[${colors.primary}]`,
  primaryHover: `hover:bg-[${colors.primaryHover}]`,
  secondary: `bg-[${colors.secondary}]`,
  secondaryHover: `hover:bg-[${colors.secondaryHover}]`,
  danger: `bg-[${colors.danger}]`,
  dangerHover: `hover:bg-[${colors.dangerHover}]`,
  success: `bg-[${colors.success}]`,
  successHover: `hover:bg-[${colors.successHover}]`,
  white: `bg-[${colors.white}]`,
  black: `bg-[${colors.black}]`,
};

export type BackgroundColor = keyof typeof backgroundColors;

// 🎨 Border Colors
export const borderColors = {
  primary: `border-[${colors.primary}]`,
  secondary: `border-[${colors.secondary}]`,
  surface: `border-[${colors.gray[200]}]`,
  default: `border-[${colors.gray[200]}]`,
  outline: `border-[${colors.gray[300]}]`,
  success: `border-[${colors.success}]`,
  danger: `border-[${colors.danger}]`,
  white: `border-[${colors.white}]`,
  black: `border-[${colors.black}]`,
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
  none: `border-[${designTokens.borders.width.none}]`,
  sm: `border-[${designTokens.borders.width.sm}]`,
  md: `border-[${designTokens.borders.width.md}]`,
  lg: `border-[${designTokens.borders.width.lg}]`,
};

export const borderStyles = {
  solid: `border-[${designTokens.borders.style.solid}]`,
  dashed: `border-[${designTokens.borders.style.dashed}]`,
  dotted: `border-[${designTokens.borders.style.dotted}]`,
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
  xs: `p-[${designTokens.spacing.xs}]`,
  sm: `p-[${designTokens.spacing.sm}]`,
  md: `p-[${designTokens.spacing.md}]`,
  lg: `p-[${designTokens.spacing.lg}]`,
  xl: `p-[${designTokens.spacing.xl}]`,
  "2xl": `p-[${designTokens.spacing["2xl"]}]`,
};

export type Spacing = keyof typeof spacing;

// 🔠 Font Size classes
export const fontSizes = {
  xs: `text-[${designTokens.fontSize.xs}]`,
  sm: `text-[${designTokens.fontSize.sm}]`,
  base: `text-[${designTokens.fontSize.base}]`,
  lg: `text-[${designTokens.fontSize.lg}]`,
  xl: `text-[${designTokens.fontSize.xl}]`,
  "2xl": `text-[${designTokens.fontSize["2xl"]}]`,
};

export type FontSize = keyof typeof fontSizes;

// 📐 Radius utility classes
export const radii = {
  none: `rounded-[${designTokens.radii.none}]`,
  xs: `rounded-[${designTokens.radii.xs}]`,
  sm: `rounded-[${designTokens.radii.sm}]`,
  md: `rounded-[${designTokens.radii.md}]`,
  lg: `rounded-[${designTokens.radii.lg}]`,
  xl: `rounded-[${designTokens.radii.xl}]`,
  "2xl": `rounded-[${designTokens.radii["2xl"]}]`,
  full: `rounded-[${designTokens.radii.full}]`,
};

export type Radius = keyof typeof radii;

// 🔘 Size Variants for buttons/inputs
export const sizeVariants = {
  xs: `text-[${designTokens.sizeVariants.xs.fontSize}] px-[${designTokens.sizeVariants.xs.paddingX}] py-[${designTokens.sizeVariants.xs.paddingY}]`,
  sm: `text-[${designTokens.sizeVariants.sm.fontSize}] px-[${designTokens.sizeVariants.sm.paddingX}] py-[${designTokens.sizeVariants.sm.paddingY}]`,
  md: `text-[${designTokens.sizeVariants.md.fontSize}] px-[${designTokens.sizeVariants.md.paddingX}] py-[${designTokens.sizeVariants.md.paddingY}]`,
  lg: `text-[${designTokens.sizeVariants.lg.fontSize}] px-[${designTokens.sizeVariants.lg.paddingX}] py-[${designTokens.sizeVariants.lg.paddingY}]`,
  xl: `text-[${designTokens.sizeVariants.xl.fontSize}] px-[${designTokens.sizeVariants.xl.paddingX}] py-[${designTokens.sizeVariants.xl.paddingY}]`,
};

export type SizeVariant = keyof typeof sizeVariants;

// 📏 Line Height
export const leading = {
  none: `leading-[${designTokens.leading.none}]`,
  tight: `leading-[${designTokens.leading.tight}]`,
  snug: `leading-[${designTokens.leading.snug}]`,
  normal: `leading-[${designTokens.leading.normal}]`,
  relaxed: `leading-[${designTokens.leading.relaxed}]`,
  loose: `leading-[${designTokens.leading.loose}]`,
};

export type Leading = keyof typeof leading;

// 📏 Vertical Spacing
export const spacingY = {
  none: `space-y-[${designTokens.spacingY.none}]`,
  xs: `space-y-[${designTokens.spacingY.xs}]`,
  sm: `space-y-[${designTokens.spacingY.sm}]`,
  md: `space-y-[${designTokens.spacingY.md}]`,
  lg: `space-y-[${designTokens.spacingY.lg}]`,
  xl: `space-y-[${designTokens.spacingY.xl}]`,
  "2xl": `space-y-[${designTokens.spacingY["2xl"]}]`,
};

export type SpacingY = keyof typeof spacingY;

// 🎯 Layout Utilities
export const layout = {
  container: 'container mx-auto',
  cardStack: `flex flex-col ${spacingY.md}`,
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
    xs: `px-[${designTokens.sizeVariants.xs.paddingX}]`,
    sm: `px-[${designTokens.sizeVariants.sm.paddingX}]`,
    md: `px-[${designTokens.sizeVariants.md.paddingX}]`,
    lg: `px-[${designTokens.sizeVariants.lg.paddingX}]`,
    xl: `px-[${designTokens.sizeVariants.xl.paddingX}]`,
  },
  y: {
    xs: `py-[${designTokens.sizeVariants.xs.paddingY}]`,
    sm: `py-[${designTokens.sizeVariants.sm.paddingY}]`,
    md: `py-[${designTokens.sizeVariants.md.paddingY}]`,
    lg: `py-[${designTokens.sizeVariants.lg.paddingY}]`,
    xl: `py-[${designTokens.sizeVariants.xl.paddingY}]`,
  },
};

export type PaddingSize = keyof typeof padding.x;