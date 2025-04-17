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

type CheckboxHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

// 🎨 Checkbox style variants
const checkbox = tv({
  slots: {
    root: [
      'relative flex items-start',
    ],
    control: [
      'flex h-6 items-center',
    ],
    input: [
      'border border-surface-hover',
      textColors.accent,
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'cursor-pointer disabled:cursor-not-allowed',
      'transition-colors',
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
    error: {
      true: {
        input: [
          'border-danger',
          'text-danger',
          'focus:ring-danger',
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'sm',
    error: false,
  },
});

// ✅ Export for atomic style use elsewhere
export const checkboxStyles = checkbox;

// ✅ Export type for variant props
export type CheckboxVariants = VariantProps<typeof checkbox>;

interface CheckboxProps extends CheckboxHTMLProps {
  label?: string;
  description?: string;
  error?: string;
  textSize?: CheckboxVariants['textSize'];
  padding?: CheckboxVariants['padding'];
  radius?: CheckboxVariants['radius'];
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  description,
  error,
  className,
  textSize,
  padding,
  radius,
  disabled,
  ...props
}: CheckboxProps) {
  const styles = checkbox({
    textSize,
    padding,
    radius,
    error: Boolean(error),
    disabled,
  });

  return (
    <FieldWrapper 
      id={props.id} 
      label={label} 
      error={error}
      textSize={textSize}
      padding={padding}
    >
      <div className={styles.root()}>
        <div className={styles.control()}>
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
