import { cn } from '@/lib/utils'
import { textColors, backgroundColors } from '@/lib/ui/tokens'

interface TableLoadingProps {
  className?: string
}

export function TableLoading({
  className,
}: TableLoadingProps) {
  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      backgroundColors.surface,
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        <p className={cn(
          'text-sm',
          textColors.muted
        )}>
          Loading...
        </p>
      </div>
    </div>
  )
} 