// Re-export all tokens from their respective files
export * from './typography'
export * from './layout'
export * from './shape'
export * from './spacing'
export * from './colors'
export { textColors, alignments } from './text'
export type { TextColor, Alignment } from './text'
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