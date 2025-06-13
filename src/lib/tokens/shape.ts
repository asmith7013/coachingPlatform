// Border utilities
export const borderWidths = {
  none: 'border-0',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
}

export const borderStyles = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}

export const borderPositions = {
  top: 'border-t',
  right: 'border-r',
  bottom: 'border-b',
  left: 'border-l',
  all: 'border',
}

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  none: 'shadow-none',
}

export const radii = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

export const radiiTop = {
  none: 'rounded-t-none',
  sm: 'rounded-t-sm',
  md: 'rounded-t',
  lg: 'rounded-t-lg',
  xl: 'rounded-t-xl',
  '2xl': 'rounded-t-2xl',
}

export const radiiBottom = {
  none: 'rounded-b-none',
  sm: 'rounded-b-sm',
  md: 'rounded-b',
  lg: 'rounded-b-lg',
  xl: 'rounded-b-xl',
  '2xl': 'rounded-b-2xl',
}

export const radiiLeft = {
  none: 'rounded-l-none',
  sm: 'rounded-l-sm',
  md: 'rounded-l',
  lg: 'rounded-l-lg',
  xl: 'rounded-l-xl',
  '2xl': 'rounded-l-2xl',
};

export const radiiRight = {
  none: 'rounded-r-none',
  sm: 'rounded-r-sm',
  md: 'rounded-r',
  lg: 'rounded-r-lg',
  xl: 'rounded-r-xl',
  '2xl': 'rounded-r-2xl',
};

export type BorderWidth = keyof typeof borderWidths
export type BorderStyle = keyof typeof borderStyles
export type BorderPosition = keyof typeof borderPositions

export type Shadow = keyof typeof shadows
export type Radius = keyof typeof radii
export type RadiiDirectionalToken = keyof typeof radiiTop 