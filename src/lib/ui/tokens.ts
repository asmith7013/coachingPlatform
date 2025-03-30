// lib/ui/tokens.ts
import { designTokens } from './designTokens';

// 🎨 Text Colors
export const textColors = {
  primary: `text-[${designTokens.textColors.primary}]`,
  secondary: `text-[${designTokens.textColors.secondary}]`,
  muted: `text-[${designTokens.textColors.muted}]`,
};

export type TextColor = keyof typeof textColors;

// 🎨 Color Variants (used in <Button />, <Badge />, etc.)
export const colorVariants = {
  primary: `bg-[${designTokens.colorVariants.primary}] text-white hover:bg-[${designTokens.colorVariants.primaryHover}]`,
  secondary: `bg-[${designTokens.colorVariants.secondary}] text-white hover:bg-[${designTokens.colorVariants.secondaryHover}]`,
  danger: `bg-[${designTokens.colorVariants.danger}] text-white hover:bg-[${designTokens.colorVariants.dangerHover}]`,
  success: `bg-[${designTokens.colorVariants.success}] text-white hover:bg-[${designTokens.colorVariants.successHover}]`,
  
  // Surface colors
  surface: `bg-[${designTokens.colorVariants.surface}]`,
  surfaceHover: `bg-[${designTokens.colorVariants.surfaceHover}] hover:bg-[${designTokens.colorVariants.surfaceHover}]`,
};

export type ColorVariant = keyof typeof colorVariants;

// 📏 Spacing utility classes
export const spacing = {
  sm: `p-[${designTokens.spacing.sm}]`,
  md: `p-[${designTokens.spacing.md}]`,
  lg: `p-[${designTokens.spacing.lg}]`,
  xl: `p-[${designTokens.spacing.xl}]`,
};

export type Spacing = keyof typeof spacing;

// 🔠 Font Size classes
export const fontSizes = {
  base: `text-[${designTokens.fontSize.base}]`,
  lg: `text-[${designTokens.fontSize.lg}]`,
  xl: `text-[${designTokens.fontSize.xl}]`,
};

export type FontSize = keyof typeof fontSizes;

// 📐 Radius utility classes
export const radii = {
  sm: `rounded-[${designTokens.radii.sm}]`,
  md: `rounded-[${designTokens.radii.md}]`,
  lg: `rounded-[${designTokens.radii.lg}]`,
  full: `rounded-[${designTokens.radii.full}]`,
};

export type Radius = keyof typeof radii;

// 🔘 Size Variants for buttons/inputs
export const sizeVariants = {
  sm: `text-[${designTokens.sizeVariants.sm.fontSize}] px-[${designTokens.sizeVariants.sm.paddingX}] py-[${designTokens.sizeVariants.sm.paddingY}]`,
  md: `text-[${designTokens.sizeVariants.md.fontSize}] px-[${designTokens.sizeVariants.md.paddingX}] py-[${designTokens.sizeVariants.md.paddingY}]`,
  lg: `text-[${designTokens.sizeVariants.lg.fontSize}] px-[${designTokens.sizeVariants.lg.paddingX}] py-[${designTokens.sizeVariants.lg.paddingY}]`,
};

export type SizeVariant = keyof typeof sizeVariants;

// 🧱 Border Utilities
export const borderWidths = {
  sm: `border-[${designTokens.borders.width.sm}]`,
  md: `border-[${designTokens.borders.width.md}]`,
  lg: `border-[${designTokens.borders.width.lg}]`,
};

export const borderStyles = {
  solid: `border-[${designTokens.borders.style.solid}]`,
  dashed: `border-[${designTokens.borders.style.dashed}]`,
};

export const borderColors = {
  primary: `border-[${designTokens.borders.color.primary}]`,
  secondary: `border-[${designTokens.borders.color.secondary}]`,
  danger: `border-[${designTokens.borders.color.danger}]`,
  success: `border-[${designTokens.borders.color.success}]`,
  surface: `border-[${designTokens.borders.color.surface}]`,
  default: `border-[${designTokens.borders.color.default}]`,
  outline: `border-[${designTokens.borders.color.outline}]`,
};

export type BorderWidth = keyof typeof borderWidths;
export type BorderStyle = keyof typeof borderStyles;
export type BorderColor = keyof typeof borderColors;

// 📏 Line Height
export const leading = {
  tight: `leading-[${designTokens.leading.tight}]`,
  relaxed: `leading-[${designTokens.leading.relaxed}]`,
  snug: `leading-[${designTokens.leading.snug}]`,
};

export type Leading = keyof typeof leading;

// 📏 Vertical Spacing
export const spacingY = {
  none: `my-[${designTokens.spacingY.none}]`,
  xs: `my-[${designTokens.spacingY.xs}]`,
  sm: `my-[${designTokens.spacingY.sm}]`,
  md: `my-[${designTokens.spacingY.md}]`,
};

export type SpacingY = keyof typeof spacingY;

// ✳️ Utility function for joining classnames
export const mergeTokens = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(' ');