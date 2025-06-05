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
}

export const radiiBottom = {
  none: 'rounded-b-none',
  sm: 'rounded-b-sm',
  md: 'rounded-b',
  lg: 'rounded-b-lg',
  xl: 'rounded-b-xl',
}

export type Shadow = keyof typeof shadows
export type Radius = keyof typeof radii 