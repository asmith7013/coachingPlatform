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
    width: {
      auto: 'w-auto',
      full: 'w-full',
    },
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'md',
    width: 'full',
    resize: 'vertical',
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
  width?: TextareaVariants['width'];
  resize?: TextareaVariants['resize'];
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function Textarea({
  label,
  error,
  textSize,
  padding,
  radius,
  width,
  resize,
  className,
  disabled,
  rows = 4, // Set default to 4 rows
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
            width,
            resize,
            error: Boolean(error),
            disabled,
          }),
          className
        )}
        disabled={disabled}
        rows={rows}
        {...props}
      />
    </FieldWrapper>
  )
}