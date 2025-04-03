import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

interface TableSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function TableSelect({
  value,
  onChange,
  options,
  className,
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'px-3 py-1 text-sm rounded-md border',
        textColors.secondary,
        backgroundColors.white,
        borderColors.default,
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        className
      )}
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