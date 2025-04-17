import { tv, type VariantProps } from 'tailwind-variants'
import { componentSize, radii, shadows } from '../tokens'
import { booleanVariant } from '../utils/variantHelpers'

export const sizeVariant = tv({
  variants: {
    size: componentSize,
  },
  defaultVariants: {
    size: 'md',
  },
})

export const radiusVariant = tv({
  variants: {
    rounded: radii,
  },
  defaultVariants: {
    rounded: 'md',
  },
})

export const shadowVariant = tv({
  variants: {
    shadow: shadows,
  },
  defaultVariants: {
    shadow: 'sm',
  },
})

export const fullWidthVariant = tv({
  variants: {
    fullWidth: booleanVariant('w-full'),
  },
  defaultVariants: {
    fullWidth: false,
  },
})

export const disabledVariant = tv({
  variants: {
    disabled: booleanVariant('opacity-50 pointer-events-none'),
  },
  defaultVariants: {
    disabled: false,
  },
})

export const loadingVariant = tv({
  variants: {
    loading: booleanVariant('cursor-wait'),
  },
  defaultVariants: {
    loading: false,
  },
})

export type SizeVariant = VariantProps<typeof sizeVariant>
export type RadiusVariant = VariantProps<typeof radiusVariant>
export type ShadowVariant = VariantProps<typeof shadowVariant>
export type FullWidthVariant = VariantProps<typeof fullWidthVariant>
export type DisabledVariant = VariantProps<typeof disabledVariant>
export type LoadingVariant = VariantProps<typeof loadingVariant> 