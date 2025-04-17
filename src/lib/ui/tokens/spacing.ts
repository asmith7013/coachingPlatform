// Component size variants (combines text size and padding)
export const componentSize = {
  xs: 'text-xs px-1 py-0.5',
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
  xl: 'text-xl px-8 py-4',
}

// Gap variants
export const gap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

// Directional padding
export const paddingX = {
  none: 'px-0',
  xs: 'px-1',
  sm: 'px-2',
  md: 'px-4',
  lg: 'px-6',
  xl: 'px-8',
}

export const paddingY = {
  none: 'py-0',
  xs: 'py-0.5',
  sm: 'py-1',
  md: 'py-2',
  lg: 'py-3',
  xl: 'py-4',
}

// Stack spacing
export const stack = {
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  '2xl': 'space-y-12',
}

export type ComponentSize = keyof typeof componentSize
export type Gap = keyof typeof gap
export type PaddingSize = keyof typeof paddingX
export type Stack = keyof typeof stack 