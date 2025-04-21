// src/lib/ui/tokens/index.ts

// Typography
export { textSize, heading, weight, typography } from './typography'

// Colors
export { semanticColorMap, tailwindColors } from './colors'

// Text utilities
export { textColors, alignments } from './text'

// Shape tokens
export { radii, shadows } from './shape'

// Spacing + layout
export { paddingX, paddingY, gap, stack, componentSize } from './spacing'
export { layout } from './layout'

// Type re-exports (optional: could be separate in a /types barrel)
export type {
  TextSize,
  HeadingLevel,
  FontWeight,
  TextColor,
} from './typography'

export type {
  Radius,
  Shadow,
} from './shape'

export type {
  PaddingSize,
  Gap,
  Stack,
  ComponentSize,
} from './spacing'

export type {
  Alignment,
} from './text' 