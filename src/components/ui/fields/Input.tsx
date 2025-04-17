import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import {
  sizeVariant,
  radiusVariant,
  disabledVariant,
} from '@/lib/ui/sharedVariants'
import { FieldWrapper } from './FieldWrapper'

type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

interface InputProps extends InputHTMLProps {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

// 🎨 Input style variants
export const input = tv({
  base: 'block w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 transition-all',
  variants: {
    ...sizeVariant.variants,
    ...radiusVariant.variants,
    ...disabledVariant.variants,
    error: {
      true: 'outline-red-500 focus:outline-red-500',
      false: 'focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600',
    },
  },
  defaultVariants: {
    size: 'md',
    radius: 'md',
    error: false,
  },
});

// ✅ Export for atomic style use elsewhere
export const inputStyles = input;

// ✅ Export type for variant props
export type InputVariants = Parameters<typeof input>[0];

export function Input({
  label,
  error,
  size = 'md',
  radius = 'md',
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <FieldWrapper id={props.id} label={label} error={error}>
      <input
        className={cn(
          input({
            size,
            radius,
            error: !!error,
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
