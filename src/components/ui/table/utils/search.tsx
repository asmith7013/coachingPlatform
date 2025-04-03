import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: TableSearchProps) {
  return (
    <div className={cn(
      'flex items-center space-x-4 px-4 py-3',
      backgroundColors.surface,
      borderColors.default,
      className
    )}>
      <p className={cn(
        'text-sm font-medium',
        textColors.muted
      )}>
        Search:
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'px-3 py-1 text-sm rounded-md border',
          textColors.secondary,
          backgroundColors.white,
          borderColors.default,
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
        )}
      />
    </div>
  )
} 