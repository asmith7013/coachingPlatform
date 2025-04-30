import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  disabledVariant,
} from '@ui-variants/shared-variants'
import { textColors } from '@ui-tokens/tokens'
import { FieldWrapper } from './FieldWrapper'

type TextareaHTMLProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

// 🎨 Textarea style variants
const textarea = tv({
  base: [
    'block w-full',
    'bg-surface',
    textColors.default,
    'placeholder:text-muted',
    'border border-surface-hover',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'transition-all',
  ],
  variants: {
    textSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    padding: {
      none: 'p-0',
      xs: 'px-2 py-1',
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-5 py-2.5',
      xl: 'px-6 py-3',
    },
    radius: radiusVariant.variants.radius,
    disabled: disabledVariant.variants.disabled,
    error: {
      true: [
        'border-danger',
        'focus:ring-danger',
      ],
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'md',
  },
});

// ✅ Export for atomic style use elsewhere
export const textareaStyles = textarea;

// ✅ Export type for variant props
export type TextareaVariants = VariantProps<typeof textarea>;

export interface TextareaProps extends TextareaHTMLProps {
  label?: string;
  error?: string;
  textSize?: TextareaVariants['textSize'];
  padding?: TextareaVariants['padding'];
  radius?: TextareaVariants['radius'];
  disabled?: boolean;
  className?: string;
}

export function Textarea({
  label,
  error,
  textSize,
  padding,
  radius,
  className,
  disabled,
  ...props
}: TextareaProps) {
  return (
    <FieldWrapper 
      id={props.id} 
      label={label} 
      error={error}
      textSize={textSize}
      padding={padding}
    >
      <textarea
        className={cn(
          textarea({
            textSize,
            padding,
            radius,
            error: Boolean(error),
            disabled,
          }),
          className
        )}
        disabled={disabled}
        {...props}
      />
    </FieldWrapper>
  )
}
