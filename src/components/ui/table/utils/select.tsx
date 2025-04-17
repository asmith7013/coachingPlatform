import { tv, type VariantProps } from 'tailwind-variants'
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

interface SelectOption {
  label: string
  value: string
}

const tableSelect = tv({
  base: [
    'rounded-md border',
    'bg-background border-surface',
    textColors.default,
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
  ],
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md'
  }
})

export type TableSelectVariants = VariantProps<typeof tableSelect>
export const tableSelectStyles = tableSelect

interface TableSelectProps extends Omit<TableSelectVariants, 'textSize'> {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  textSize?: TableSelectVariants['textSize']
}

export function TableSelect({
  value,
  onChange,
  options,
  className,
  textSize = 'base',
  padding = 'md'
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={tableSelect({ textSize, padding, className })}
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