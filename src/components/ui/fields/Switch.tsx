import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  disabledVariant,
  paddingVariant,
  textSizeVariant,
} from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'
import { FieldWrapper } from './FieldWrapper'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  error?: string
  className?: string
  disabled?: boolean
  textSize?: "base" | "xs" | "sm" | "lg" | "xl" | "2xl"
  padding?: "xs" | "sm" | "md" | "lg" | "xl" | "none"
}

// 🎨 Switch style variants
const switchStyles = tv({
  slots: {
    wrapper: [
      'relative flex items-start',
    ],
    root: [
      'relative inline-flex flex-shrink-0 cursor-pointer',
      'rounded-full border-2 border-transparent',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'cursor-pointer disabled:cursor-not-allowed',
    ],
    thumb: [
      'pointer-events-none inline-block',
      'transform rounded-full bg-white shadow ring-0',
      'transition duration-200 ease-in-out',
    ],
    description: [
      textColors.muted,
    ],
  },
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding,
    radius: radiusVariant.variants.radius,
    disabled: disabledVariant.variants.disabled,
    checked: {
      true: {
        root: 'bg-primary',
        thumb: 'translate-x-[133%]',
      },
      false: {
        root: 'bg-surface-hover',
        thumb: 'translate-x-0',
      },
    },
    error: {
      true: {
        root: [
          'border-danger',
          'focus:ring-danger',
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'full',
    checked: false,
    error: false,
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

// ✅ Export for atomic style use elsewhere
export const switchComponentStyles = switchStyles;

// ✅ Export type for variant props
export type SwitchVariants = VariantProps<typeof switchStyles>;

export function Switch({
  checked,
  onChange,
  label,
  description,
  error,
  className,
  disabled,
  textSize,
  padding,
}: SwitchProps) {
  const styles = switchStyles({ 
    checked: checked as boolean, 
    error: Boolean(error),
    disabled,
    textSize,
    padding,
  });

  return (
    <FieldWrapper 
      id="switch" 
      label={label} 
      error={error}
      textSize={textSize}
      padding={padding}
    >
      <div className={styles.wrapper()}>
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
