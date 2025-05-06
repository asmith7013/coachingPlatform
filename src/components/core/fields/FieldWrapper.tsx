import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { 
  textColors
} from '@/lib/tokens/tokens'
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
      'font-medium',
      textColors.default,
    ],
    content: [],
    error: [
      textColors.danger,
    ],
    helpText: [
      textColors.muted,
      'text-sm'
    ],
  },
  variants: {
    textSize: {
      xs: { label: 'text-xs mb-0.5', error: 'text-xs mt-0.5', helpText: 'text-xs mt-0.5' },
      sm: { label: 'text-sm mb-1', error: 'text-sm mt-1', helpText: 'text-xs mt-1' },
      base: { label: 'text-base mb-1', error: 'text-sm mt-1', helpText: 'text-xs mt-1' },
      lg: { label: 'text-lg mb-1.5', error: 'text-sm mt-1.5', helpText: 'text-xs mt-1.5' },
      xl: { label: 'text-xl mb-2', error: 'text-sm mt-2', helpText: 'text-xs mt-2' },
      '2xl': { label: 'text-2xl mb-2.5', error: 'text-sm mt-2.5', helpText: 'text-xs mt-2.5' },
    },
    padding: {
      none: { root: 'p-0', content: 'mb-0' },
      xs: { root: 'p-1', content: 'mb-1' },
      sm: { root: 'p-1.5', content: 'mb-1.5' },
      md: { root: 'p-2', content: 'mb-2' },
      lg: { root: 'p-3', content: 'mb-3' },
      xl: { root: 'p-4', content: 'mb-4' },
      '2xl': { root: 'p-6', content: 'mb-6' }
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