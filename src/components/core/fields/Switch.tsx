import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  disabledVariant,
} from '@ui-variants/shared-variants'
import { 
  textColors 
} from '@/lib/tokens/tokens'
import { 
  TextSizeToken,
  PaddingToken,
  RadiusToken
} from '@/lib/tokens/types'
import { FieldWrapper } from './FieldWrapper'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  error?: string
  className?: string
  disabled?: boolean
  textSize?: TextSizeToken
  padding?: PaddingToken
  radius?: RadiusToken
}

// 🎨 Switch style variants
const switchStyles = tv({
  slots: {
    wrapper: [
      'relative flex items-start',
    ],
    track: [
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
    textSize: {
      xs: { 
        wrapper: 'gap-x-2',
        description: 'text-xs',
        track: 'h-3.5 w-6',
        thumb: 'h-2.5 w-2.5',
      },
      sm: { 
        wrapper: 'gap-x-2.5',
        description: 'text-sm',
        track: 'h-4 w-7',
        thumb: 'h-3 w-3',
      },
      base: { 
        wrapper: 'gap-x-3',
        description: 'text-base',
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
      },
      lg: { 
        wrapper: 'gap-x-3.5',
        description: 'text-lg',
        track: 'h-6 w-10',
        thumb: 'h-5 w-5',
      },
      xl: { 
        wrapper: 'gap-x-4',
        description: 'text-xl',
        track: 'h-7 w-12',
        thumb: 'h-6 w-6',
      },
      '2xl': { 
        wrapper: 'gap-x-5',
        description: 'text-2xl',
        track: 'h-8 w-14',
        thumb: 'h-7 w-7',
      },
    },
    padding: {
      none: { wrapper: 'p-0' },
      xs: { wrapper: 'p-1' },
      sm: { wrapper: 'p-1.5' },
      md: { wrapper: 'p-2' },
      lg: { wrapper: 'p-3' },
      xl: { wrapper: 'p-4' },
      '2xl': { wrapper: 'p-6' },
    },
    radius: radiusVariant.variants.radius,
    disabled: disabledVariant.variants.disabled,
    checked: {
      true: {
        track: 'bg-primary',
        thumb: 'translate-x-[133%]',
      },
      false: {
        track: 'bg-surface-hover',
        thumb: 'translate-x-0',
      },
    },
    error: {
      true: {
        track: [
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
        track: 'opacity-50',
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
  radius,
}: SwitchProps) {
  const styles = switchStyles({ 
    checked: checked as boolean, 
    error: Boolean(error),
    disabled,
    textSize,
    padding,
    radius: radius as SwitchVariants['radius'],
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
          className={cn(styles.track(), className)}
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
