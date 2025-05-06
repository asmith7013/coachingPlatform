import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@ui/utils/formatters';
import { 
  textSize, 
  paddingX, 
  paddingY, 
  radii, 
  borderWidths,
} from '@/lib/tokens/tokens'


import { backgroundColors, borderColors, ringColors, textColors } from '@/lib/tokens/colors';
import { FieldWrapper } from './FieldWrapper';
import type { FieldComponentProps } from '@/lib/types/core/token';

const input = tv({
  slots: {
    base: `w-full ${borderWidths.sm} ${backgroundColors.white} ${textColors.default} placeholder:${textColors.muted} focus:outline-none focus:ring-2 ${ringColors.primary} focus:border-transparent`,
    wrapper: '',
  },
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
      '2xl': textSize['2xl'],
    },
    padding: {
      none: `${paddingX.none} ${paddingY.none}`,
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
      '2xl': `${paddingX['2xl']} ${paddingY['2xl']}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      xl: radii.xl,
      '2xl': radii['2xl'],
      full: radii.full,
    },
    disabled: {
      true: 'opacity-60 pointer-events-none',
      false: '',
    },
    error: {
      true: `${borderColors.danger} focus:${ringColors.danger}`,
      false: `${borderColors.default}`,
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'md',
    disabled: false,
    error: false,
  },
})

export type InputVariants = VariantProps<typeof input>
type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>

export interface InputProps extends InputHTMLProps, Omit<FieldComponentProps, 'children'> {
  disabled?: boolean;
}

export function Input({
  label,
  error,
  helpText,
  className,
  textSize,
  padding,
  radius,
  disabled,
  required,
  readOnly,
  ...props
}: InputProps) {
  const { base } = input({
    textSize,
    padding,
    radius,
    error: Boolean(error),
    disabled,
  })
  
  return (
    <FieldWrapper
      id={props.id}
      label={label}
      error={typeof error === 'boolean' ? undefined : error}
      helpText={helpText}
      textSize={textSize}
      padding={padding}
      required={required}
    >
      <input
        {...props}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(base(), className)}
      />
    </FieldWrapper>
  )
}

export default Input 