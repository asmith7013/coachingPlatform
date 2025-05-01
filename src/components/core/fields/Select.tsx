'use client'

import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens'
import { FieldWrapper } from './FieldWrapper'
import { Listbox } from '@headlessui/react'

// Define component-specific types
export type SelectTextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type SelectPadding = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SelectRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface SelectOption {
  value: string;
  label: string;
  online?: boolean;
}

export interface BaseSelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  textSize?: SelectTextSize;
  padding?: SelectPadding;
  radius?: SelectRadius;
  disabled?: boolean;
}

export interface SingleSelectProps extends BaseSelectProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

export interface MultiSelectProps extends BaseSelectProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

// 🎨 Select style variants
const select = tv({
  slots: {
    trigger: [
      'relative w-full cursor-default bg-white text-left',
      'outline-1 -outline-offset-1 outline-gray-300',
      'focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600',
      'cursor-pointer disabled:cursor-not-allowed',
      'transition-all',
    ],
    options: [
      'absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white',
      'shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
    ],
    option: [
      'relative cursor-default select-none',
    ],
    placeholder: [
      'block truncate text-gray-400 italic',
    ],
    value: [
      'block truncate',
    ],
    checkIcon: [
      'absolute inset-y-0 right-0 flex items-center pr-4',
    ],
  },
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
    },
    padding: {
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      full: radii.full,
    },
    disabled: {
      true: 'opacity-60 pointer-events-none',
      false: '',
    },
    error: {
      true: { trigger: 'outline-red-500 focus:outline-red-500' },
      false: {},
    },
    active: {
      true: { option: 'bg-indigo-600 text-white' },
      false: { option: 'text-gray-900' },
    },
    selected: {
      true: { 
        value: 'font-semibold',
        checkIcon: 'text-indigo-600',
      },
      false: { 
        value: 'font-normal',
        checkIcon: 'text-gray-400',
      },
    },
    activeSelected: {
      true: { checkIcon: 'text-white' },
      false: {},
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'md',
    error: false,
    active: false,
    selected: false,
    activeSelected: false,
  },
});

export type SelectVariants = VariantProps<typeof select>;

// ✅ Export for atomic style use elsewhere
export const selectStyles = select;

export function Select({ 
  label, 
  options, 
  value, 
  onChange, 
  error,
  placeholder = 'Select an option',
  className,
  multiple = false,
  textSize,
  padding,
  radius,
  disabled = false,
}: SelectProps) {
  const styles = select({ textSize, padding, radius });

  // Add defensive handling for value
  const safeValue = multiple 
    ? (Array.isArray(value) ? value : []) 
    : value;

  return (
    <FieldWrapper 
      id="select" 
      label={label} 
      error={error}
      textSize={textSize}
      padding={padding}
    >
      <Listbox value={safeValue} onChange={onChange} multiple={multiple}>
        <div className="relative w-full">
          <Listbox.Button
            className={cn(
              styles.trigger(),
              className
            )}
            disabled={disabled}
          >
            {multiple ? (
              <span className={styles.value()}>
                {Array.isArray(safeValue) && safeValue.length > 0
                  ? safeValue.map(v => options.find(option => option.value === v)?.label).join(', ')
                  : placeholder}
              </span>
            ) : (
              <span className={styles.value()}>
                {options.find(option => option.value === safeValue)?.label || placeholder}
              </span>
            )}
          </Listbox.Button>
          <Listbox.Options className={styles.options()}>
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) => cn(
                  styles.option(),
                  active ? 'bg-surface-hover' : ''
                )}
              >
                {({ selected }) => (
                  <span className={cn(
                    styles.value(),
                    selected ? 'font-semibold' : 'font-normal'
                  )}>
                    {option.label}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </FieldWrapper>
  )
}
