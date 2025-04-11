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

// 🚫 Disabled States
export const disabledStates = {
  true: 'opacity-50 pointer-events-none',
  false: '',
};

export type DisabledState = keyof typeof disabledStates;

// 🕓 Loading Cursor
export const loadingStates = {
  true: 'cursor-wait',
  false: '',
};

export type LoadingState = keyof typeof loadingStates;

// 🎨 Text Color (non-intent)
export const textColors = {
  default: 'text-gray-900',
  muted: 'text-muted-foreground',
  accent: 'text-primary',
  danger: 'text-red-600',
};

export type TextColor = keyof typeof textColors;

// 🧭 Alignment for layouts
export const alignments = {
  start: 'items-start justify-start',
  center: 'items-center justify-center',
  end: 'items-end justify-end',
  between: 'justify-between',
};

export type Alignment = keyof typeof alignments;

// 📏 Common gap variants
export const gaps = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export type Gap = keyof typeof gaps;

// 📦 Padding (flat variant style)
export const paddings = {
  none: 'p-0',
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export type Padding = keyof typeof paddings;

export type DefaultSizeVariant = { size: SizeVariant };
export type DefaultShadowVariant = { shadow: Shadow };
export type DefaultRadiusVariant = { radius: Radius };
export type DefaultFullWidthVariant = { fullWidth: boolean };
export type DefaultDisabledVariant = { disabled: boolean };
export type DefaultLoadingVariant = { loading: boolean };
