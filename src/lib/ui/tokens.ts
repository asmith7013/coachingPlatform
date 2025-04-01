// lib/ui/tokens.ts
import { designTokens } from './designTokens';

// 🎨 Text Colors
export const textColors = {
  primary: `text-[${designTokens.textColors.primary}]`,
  secondary: `text-[${designTokens.textColors.secondary}]`,
  muted: `text-[${designTokens.textColors.muted}]`,
  white: `text-[${designTokens.textColors.white}]`,
  black: `text-[${designTokens.textColors.black}]`,
  success: `text-[${designTokens.textColors.success}]`,
  danger: `text-[${designTokens.textColors.danger}]`,
};

export type TextColor = keyof typeof textColors;

// 🎨 Color Variants (used in <Button />, <Badge />, etc.)
export const colorVariants = {
  primary: `bg-[${designTokens.colorVariants.primary}] text-white hover:bg-[${designTokens.colorVariants.primaryHover}]`,
  secondary: `bg-[${designTokens.colorVariants.secondary}] text-white hover:bg-[${designTokens.colorVariants.secondaryHover}]`,
  danger: `bg-[${designTokens.colorVariants.danger}] text-white hover:bg-[${designTokens.colorVariants.dangerHover}]`,
  success: `bg-[${designTokens.colorVariants.success}] text-white hover:bg-[${designTokens.colorVariants.successHover}]`,
  white: `bg-[${designTokens.colorVariants.white}] text-black`,
  black: `bg-[${designTokens.colorVariants.black}] text-white`,
  
  // Surface colors
  surface: `bg-[${designTokens.colorVariants.surface}]`,
  surfaceHover: `bg-[${designTokens.colorVariants.surfaceHover}] hover:bg-[${designTokens.colorVariants.surfaceHover}]`,
};

export type ColorVariant = keyof typeof colorVariants;

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

// 🌗 Shadows
export const shadows = {
  sm: `shadow-[${designTokens.shadows.sm}]`,
  md: `shadow-[${designTokens.shadows.md}]`,
  lg: `shadow-[${designTokens.shadows.lg}]`,
  xl: `shadow-[${designTokens.shadows.xl}]`,
  "2xl": `shadow-[${designTokens.shadows["2xl"]}]`,
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

export const borderColors = {
  primary: `border-[${designTokens.borders.color.primary}]`,
  secondary: `border-[${designTokens.borders.color.secondary}]`,
  danger: `border-[${designTokens.borders.color.danger}]`,
  success: `border-[${designTokens.borders.color.success}]`,
  surface: `border-[${designTokens.borders.color.surface}]`,
  default: `border-[${designTokens.borders.color.default}]`,
  outline: `border-[${designTokens.borders.color.outline}]`,
  white: `border-[${designTokens.borders.color.white}]`,
  black: `border-[${designTokens.borders.color.black}]`,
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
export type BorderColor = keyof typeof borderColors;
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