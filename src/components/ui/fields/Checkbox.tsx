import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import {
  radiusVariant,
  disabledVariant,
} from '@/lib/ui/sharedVariants'
import { FieldWrapper } from './FieldWrapper'

type CheckboxHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

interface CheckboxProps extends CheckboxHTMLProps {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// 🎨 Checkbox style variants
export const checkbox = tv({
  slots: {
    input: [
      'h-4 w-4 border-gray-300 text-indigo-600',
      'focus:ring-indigo-600',
      'cursor-pointer disabled:cursor-not-allowed',
      'transition-colors',
    ],
    description: [
      'ml-3 text-sm leading-6 text-gray-600',
    ],
  },
  variants: {
    ...radiusVariant.variants,
    ...disabledVariant.variants,
    error: {
      true: {
        input: 'border-red-500 text-red-500 focus:ring-red-500',
      },
      false: {},
    },
  },
  defaultVariants: {
    radius: 'sm',
    error: false,
  },
});

// ✅ Export for atomic style use elsewhere
export const checkboxStyles = checkbox;

// ✅ Export type for variant props
export type CheckboxVariants = Parameters<typeof checkbox>[0];

export function Checkbox({
  label,
  description,
  error,
  className,
  radius = 'sm',
  disabled,
  ...props
}: CheckboxProps) {
  const styles = checkbox({
    radius,
    error: !!error,
    disabled,
  });

  return (
    <FieldWrapper id={props.id} label={label} error={error}>
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            type="checkbox"
            className={cn(styles.input(), className)}
            disabled={disabled}
            {...props}
          />
        </div>
        {description && (
          <div className={styles.description()}>
            <p>{description}</p>
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}
