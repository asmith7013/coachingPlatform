// Text colors
export const textColors = {
  default: 'text-gray-900',
  muted: 'text-muted-foreground',
  accent: 'text-primary',
  danger: 'text-red-600',
}

// Alignment utilities
export const alignments = {
  start: 'items-start justify-start',
  center: 'items-center justify-center',
  end: 'items-end justify-end',
  between: 'justify-between',
}

export type TextColor = keyof typeof textColors
export type Alignment = keyof typeof alignments 