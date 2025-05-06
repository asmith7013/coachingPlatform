// Improved Select component with better default styling
'use client'

import { cn } from '@ui/utils/formatters';
import { tv } from 'tailwind-variants'
import { 
  textSize, 
  paddingX, 
  paddingY, 
  radii, 
  textColors,
  TextSizeToken,
  PaddingToken,
  RadiusToken,
  TextColorToken
} from '@/lib/tokens/index'
import { FieldWrapper } from './FieldWrapper'
import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid'

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
  textSize?: TextSizeToken;
  padding?: PaddingToken;
  radius?: RadiusToken;
  disabled?: boolean;
  labelColor?: TextColorToken;
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

// 🎨 Enhanced Select style variants
const select = tv({
  slots: {
    trigger: [
      'relative w-full cursor-default bg-white text-left',
      'border border-gray-300 shadow-sm',
      'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-25',
      'cursor-pointer disabled:cursor-not-allowed',
      'transition-all flex items-center justify-between',
    ],
    options: [
      'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white',
      'py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
    ],
    option: [
      'relative cursor-default select-none py-2 pl-3 pr-9',
    ],
    placeholder: [
      'block truncate text-gray-400 italic',
    ],
    value: [
      'block truncate',
    ],
    icon: [
      'absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400',
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
      '2xl': textSize['2xl'],
    },
    labelColor: {
      default: textColors.default,
      muted: textColors.muted,
      accent: textColors.accent,
      primary: textColors.primary,
      secondary: textColors.secondary,
      danger: textColors.danger,
      success: textColors.success,
      surface: textColors.surface,
      background: textColors.background,
      border: textColors.border,
      white: textColors.white,
      black: textColors.black,
    },
    padding: {
      none: '',
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
      '2xl': `${paddingX['2xl']} ${paddingY['2xl']}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      xl: radii.xl,
      '2xl': radii['2xl'],
      full: radii.full,
    },
    disabled: {
      true: 'opacity-60 pointer-events-none bg-gray-50',
      false: '',
    },
    error: {
      true: { trigger: 'border-red-500 focus:ring-red-500 focus:border-red-500' },
      false: {},
    },              
    active: {
      true: { option: 'bg-indigo-600 text-white' },
      false: { option: 'text-gray-900 hover:bg-indigo-50' },
    },
    selected: {
      true: { 
        value: 'font-semibold text-indigo-900',
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
  labelColor,
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
      labelColor={labelColor}
    >
      <div className="relative w-full">
        <Listbox value={safeValue} onChange={onChange} multiple={multiple}>
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
                {options.find(option => option.value === safeValue)?.label || 
                 <span className="text-gray-400 italic">{placeholder}</span>}
              </span>
            )}
            <span className={styles.icon()}>
              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className={styles.options()}>
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) => cn(
                  styles.option(),
                  active ? 'bg-indigo-50' : ''
                )}
              >
                {({ selected, active }) => (
                  <>
                    <span className={cn(
                      styles.value(),
                      selected ? 'font-semibold text-indigo-900' : 'font-normal',
                    )}>
                      {option.label}
                    </span>
                    {selected && (
                      <span className={cn(
                        styles.checkIcon(),
                        active ? 'text-indigo-600' : 'text-indigo-600'
                      )}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    </FieldWrapper>
  )
}