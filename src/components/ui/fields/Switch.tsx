import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import {
  radiusVariant,
  disabledVariant,
} from '@/lib/ui/sharedVariants'
import { FieldWrapper } from './FieldWrapper'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  error?: string
  className?: string
  disabled?: boolean
}

// 🎨 Switch style variants
export const switchStyles = tv({
  slots: {
    root: [
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer',
      'rounded-full border-2 border-transparent',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
      'cursor-pointer disabled:cursor-not-allowed',
    ],
    thumb: [
      'pointer-events-none inline-block h-5 w-5',
      'transform rounded-full bg-white shadow ring-0',
      'transition duration-200 ease-in-out',
    ],
    description: [
      'ml-3 text-sm leading-6 text-gray-600',
    ],
  },
  variants: {
    ...radiusVariant.variants,
    ...disabledVariant.variants,
    checked: {
      true: {
        root: 'bg-indigo-600',
        thumb: 'translate-x-5',
      },
      false: {
        root: 'bg-gray-200',
        thumb: 'translate-x-0',
      },
    },
    error: {
      true: {
        root: 'border-red-500 focus:ring-red-500',
      },
      false: {},
    },
  },
  defaultVariants: {
    checked: false,
    error: false,
    radius: 'full',
  },
  compoundVariants: [
    {
      disabled: true,
      class: {
        root: 'opacity-50',
      },
    },
  ],
});

// ✅ Export type for variant props
export type SwitchVariants = Parameters<typeof switchStyles>[0];

export function Switch({
  checked,
  onChange,
  label,
  description,
  error,
  className,
  disabled,
}: SwitchProps) {
  const styles = switchStyles({ 
    checked: checked as boolean, 
    error: !!error,
    disabled 
  });

  return (
    <FieldWrapper id="switch" label={label} error={error}>
      <div className="relative flex items-start">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(styles.root(), className)}
        >
          <span className={styles.thumb()} />
        </button>
        {description && (
          <div className={styles.description()}>
            <p>{description}</p>
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}
