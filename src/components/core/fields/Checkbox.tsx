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
    textSize: {
      xs: { description: 'text-xs', root: 'gap-x-2' },
      sm: { description: 'text-sm', root: 'gap-x-2.5' },
      base: { description: 'text-base', root: 'gap-x-3' },
      lg: { description: 'text-lg', root: 'gap-x-3.5' },
      xl: { description: 'text-xl', root: 'gap-x-4' },
      '2xl': { description: 'text-2xl', root: 'gap-x-5' },
    },
    padding: {
      none: { root: 'p-0' },
      xs: { root: 'p-1' },
      sm: { root: 'p-1.5' },
      md: { root: 'p-2' },
      lg: { root: 'p-3' },
      xl: { root: 'p-4' },
      '2xl': { root: 'p-6' },
    },
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

/**
 * TanStack Form field integration props (optional)
 */
interface TanStackFormProps {
  fieldApi?: {
    state: {
      value: unknown;
      meta: {
        errors?: string[];
        isValidating?: boolean;
        isDirty?: boolean;
        isTouched?: boolean;
      };
    };
    handleChange: (value: unknown) => void;
    handleBlur: () => void;
    name: string;
  };
}

// Export the interface
export interface CheckboxProps extends CheckboxHTMLProps, TanStackFormProps {
  label?: string;
  description?: string;
  error?: string;
  textSize?: TextSizeToken;
  padding?: PaddingToken;
  radius?: RadiusToken;
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
  fieldApi,
  ...props
}: CheckboxProps) {
  // TanStack Form integration
  const finalChecked = fieldApi ? Boolean(fieldApi.state.value) : props.checked;
  const finalError = fieldApi ? fieldApi.state.meta.errors?.[0] : error;
  const finalDisabled = disabled || (fieldApi ? fieldApi.state.meta.isValidating : false);
  
  const handleChange = fieldApi ? 
    (e: React.ChangeEvent<HTMLInputElement>) => fieldApi.handleChange(e.target.checked) :
    props.onChange;
  
  const handleBlur = fieldApi ? 
    () => fieldApi.handleBlur() :
    props.onBlur;

  const styles = checkbox({
    textSize,
    padding,
    radius: radius as CheckboxVariants['radius'],
    error: Boolean(finalError),
    disabled: finalDisabled,
  });

  return (
    <FieldWrapper 
      id={props.id || fieldApi?.name} 
      label={label} 
      error={finalError}
      textSize={textSize}
      padding={padding}
    >
      <div className={styles.root()}>
        <div className={styles.control()}>
          <input
            type="checkbox"
            className={cn(styles.input(), className)}
            {...props}
            checked={finalChecked}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={finalDisabled}
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
