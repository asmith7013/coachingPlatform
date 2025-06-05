'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { Text } from '@/components/core/typography'
import type { LucideIcon } from 'lucide-react'

const statCard = tv({
  slots: {
    container: 'text-center p-3 rounded-lg',
    iconWrapper: 'mx-auto mb-1',
    icon: 'w-6 h-6',
    value: 'font-semibold',
    label: ''
  },
  variants: {
    color: {
      blue: {
        container: 'bg-blue-50',
        icon: 'text-blue-600',
        value: 'text-blue-900'
      },
      green: {
        container: 'bg-green-50',
        icon: 'text-green-600',
        value: 'text-green-900'
      },
      purple: {
        container: 'bg-purple-50',
        icon: 'text-purple-600',
        value: 'text-purple-900'
      },
      orange: {
        container: 'bg-orange-50',
        icon: 'text-orange-600',
        value: 'text-orange-900'
      },
      red: {
        container: 'bg-red-50',
        icon: 'text-red-600',
        value: 'text-red-900'
      },
      gray: {
        container: 'bg-gray-50',
        icon: 'text-gray-600',
        value: 'text-gray-900'
      }
    },
    size: {
      sm: {
        container: 'p-2',
        icon: 'w-5 h-5'
      },
      md: {
        container: 'p-3',
        icon: 'w-6 h-6'
      },
      lg: {
        container: 'p-4',
        icon: 'w-8 h-8'
      }
    }
  },
  defaultVariants: {
    color: 'blue',
    size: 'md'
  }
})

export interface StatCardProps extends VariantProps<typeof statCard> {
  icon: LucideIcon
  value: string | number
  label: string
  className?: string
}

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  size, 
  className 
}: StatCardProps) {
  const styles = statCard({ color, size })

  return (
    <div className={styles.container({ className })}>
      <div className={styles.iconWrapper()}>
        <Icon className={styles.icon()} />
      </div>
      <Text className={styles.value()}>{value}</Text>
      <Text textSize="xs" color="muted" className={styles.label()}>
        {label}
      </Text>
    </div>
  )
} 