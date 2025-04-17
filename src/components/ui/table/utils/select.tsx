import { tv, type VariantProps } from 'tailwind-variants'

interface SelectOption {
  label: string
  value: string
}

const tableSelect = tv({
  base: [
    'rounded-md border',
    'text-text bg-background border-surface',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
  ],
  variants: {
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export type TableSelectVariants = VariantProps<typeof tableSelect>
export const tableSelectStyles = tableSelect

interface TableSelectProps extends TableSelectVariants {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

export function TableSelect({
  value,
  onChange,
  options,
  className,
  size
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={tableSelect({ size, className })}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
} 