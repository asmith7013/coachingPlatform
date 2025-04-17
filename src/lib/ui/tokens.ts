// Re-export all tokens from their respective files
export * from './tokens/typography'
export * from './tokens/layout'
export * from './tokens/shape'
export * from './tokens/spacing'
export * from './tokens/colors'
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

export type BorderWidth = keyof typeof borderWidths
export type BorderStyle = keyof typeof borderStyles
export type BorderPosition = keyof typeof borderPositions

// Legacy table styles - use tv() variants instead
export const legacyTableStyles = {
  header: 'bg-gray-50 font-medium text-gray-900',
  cell: 'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
  row: 'border-b border-gray-200',
} 