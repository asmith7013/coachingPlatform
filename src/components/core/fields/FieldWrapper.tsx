import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { 
  textSize, weight, paddingX, paddingY
} from '@/lib/tokens/tokens'
import { 
  textColors
} from '@/lib/tokens/colors'
import {
  TextSizeToken, 
  PaddingToken, 
  TextColorToken
} from '@/lib/tokens/types'
import type { BaseComponentProps } from '@/lib/types/core/token'

const fieldWrapper = tv({
  slots: {
    root: ['w-full'],
    label: [
      weight.medium,       // font-medium → weight.medium
      textColors.default,
    ],
    content: [],
    error: [
      textColors.danger,
    ],
    helpText: [
      textColors.muted,
      textSize.sm         // text-sm → textSize.sm
    ],
  },
  variants: {
    textSize: {
      xs: { 
        label: [textSize.xs, 'mb-0.5'],           // text-xs mb-0.5 → textSize.xs mb-0.5
        error: [textSize.xs, 'mt-0.5'],           // text-xs mt-0.5 → textSize.xs mt-0.5
        helpText: [textSize.xs, 'mt-0.5']         // text-xs mt-0.5 → textSize.xs mt-0.5
      },
      sm: { 
        label: [textSize.sm, 'mb-1'],             // text-sm mb-1 → textSize.sm mb-1
        error: [textSize.sm, 'mt-1'],             // text-sm mt-1 → textSize.sm mt-1
        helpText: [textSize.xs, 'mt-1']           // text-xs mt-1 → textSize.xs mt-1
      },
      base: { 
        label: [textSize.base, 'mb-1'],           // text-base mb-1 → textSize.base mb-1
        error: [textSize.sm, 'mt-1'],             // text-sm mt-1 → textSize.sm mt-1
        helpText: [textSize.xs, 'mt-1']           // text-xs mt-1 → textSize.xs mt-1
      },
      lg: { 
        label: [textSize.lg, 'mb-1.5'],           // text-lg mb-1.5 → textSize.lg mb-1.5
        error: [textSize.sm, 'mt-1.5'],           // text-sm mt-1.5 → textSize.sm mt-1.5
        helpText: [textSize.xs, 'mt-1.5']         // text-xs mt-1.5 → textSize.xs mt-1.5
      },
      xl: { 
        label: [textSize.xl, 'mb-2'],             // text-xl mb-2 → textSize.xl mb-2
        error: [textSize.sm, 'mt-2'],             // text-sm mt-2 → textSize.sm mt-2
        helpText: [textSize.xs, 'mt-2']           // text-xs mt-2 → textSize.xs mt-2
      },
      '2xl': { 
        label: [textSize['2xl'], 'mb-2.5'],       // text-2xl mb-2.5 → textSize['2xl'] mb-2.5
        error: [textSize.sm, 'mt-2.5'],           // text-sm mt-2.5 → textSize.sm mt-2.5
        helpText: [textSize.xs, 'mt-2.5']         // text-xs mt-2.5 → textSize.xs mt-2.5
      },
    },
    padding: {
      none: { 
        root: [paddingX.none, paddingY.none],     // p-0 → paddingX.none + paddingY.none
        content: 'mb-0' 
      },
      xs: { 
        root: [paddingX.xs, paddingY.xs],         // p-1 → paddingX.xs + paddingY.xs
        content: 'mb-1' 
      },
      sm: { 
        root: ['p-1.5'],                          // Keep p-1.5 as-is (no direct token)
        content: 'mb-1.5' 
      },
      md: { 
        root: [paddingX.sm, paddingY.sm],         // p-2 → paddingX.sm + paddingY.sm
        content: 'mb-2' 
      },
      lg: { 
        root: [paddingX.md, paddingY.md],         // p-3 → paddingX.md + paddingY.md (approximate)
        content: 'mb-3' 
      },
      xl: { 
        root: [paddingX.md, paddingY.md],         // p-4 → paddingX.md + paddingY.md
        content: 'mb-4' 
      },
      '2xl': { 
        root: [paddingX.lg, paddingY.lg],         // p-6 → paddingX.lg + paddingY.lg
        content: 'mb-6' 
      }
    },
    labelColor: {
      default: { label: textColors.default },
      muted: { label: textColors.muted },
      accent: { label: textColors.accent },
      primary: { label: textColors.primary },
      secondary: { label: textColors.secondary },
      danger: { label: textColors.danger },
      success: { label: textColors.success },
      surface: { label: textColors.surface },
      background: { label: textColors.background },
      border: { label: textColors.border },
      white: { label: textColors.white },
      black: { label: textColors.black },
    },
    required: {
      true: { label: 'after:content-["*"] after:ml-0.5 after:text-danger' },
      false: {},
    }
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    labelColor: 'default',
    required: false,
  },
})

export type FieldWrapperVariants = VariantProps<typeof fieldWrapper>

export interface FieldWrapperProps extends BaseComponentProps {
  id?: string;
  label?: string;
  error?: string;
  helpText?: string;
  textSize?: TextSizeToken;
  padding?: PaddingToken;
  labelColor?: TextColorToken;
  required?: boolean;
}

export function FieldWrapper({ 
  id, 
  label, 
  error, 
  helpText,
  children, 
  className,
  textSize,
  padding,
  labelColor,
  required,
}: FieldWrapperProps) {
  const styles = fieldWrapper({ textSize, padding, labelColor, required })

  return (
    <div className={cn(styles.root(), className)}>
      {label && (
        <label htmlFor={id} className={styles.label()}>
          {label}
        </label>
      )}
      <div className={styles.content()}>{children}</div>
      {helpText && !error && (
        <p className={styles.helpText()}>
          {helpText}
        </p>
      )}
      {error && (
        <p className={styles.error()}>
          {error}
        </p>
      )}
    </div>
  )
}