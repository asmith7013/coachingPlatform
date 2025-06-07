'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { PencilIcon as PencilIconSolid, ChatBubbleLeftIcon as ChatBubbleLeftIconSolid } from '@heroicons/react/24/solid'
import { cn } from '@ui/utils/formatters'

const accountabilityIcon = tv({
  slots: {
    container: 'inline-flex items-center justify-center transition-all duration-300 ease-in-out transform',
    icon: 'transition-all duration-300 ease-in-out',
    loadingOverlay: 'absolute inset-0 flex items-center justify-center',
    loadingSpinner: 'animate-spin rounded-full border-2 border-gray-300',
    pulseEffect: 'animate-pulse'
  },
  variants: {
    size: {
      sm: {
        container: 'w-5 h-5',
        icon: 'w-3 h-3',
        loadingSpinner: 'w-3 h-3 border-[1px]'
      },
      md: {
        container: 'w-6 h-6', 
        icon: 'w-4 h-4',
        loadingSpinner: 'w-4 h-4 border-[1.5px]'
      },
      lg: {
        container: 'w-8 h-8',
        icon: 'w-5 h-5',
        loadingSpinner: 'w-5 h-5 border-2'
      }
    },
    type: {
      observation: {},
      meeting: {}
    },
    state: {
      empty: {
        container: 'border-2 border-gray-300 rounded-full bg-white hover:border-gray-400 hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer',
        icon: 'text-transparent'
      },
      filled: {
        container: 'rounded-full cursor-pointer shadow-sm hover:shadow-lg hover:scale-110 active:scale-95'
      },
      loading: {
        container: 'rounded-full cursor-wait opacity-75'
      },
      success: {
        container: 'rounded-full animate-bounce'
      },
      error: {
        container: 'rounded-full border-2 border-red-300 bg-red-50'
      }
    }
  },
  compoundVariants: [
    // Observation states with enhanced feedback
    {
      type: 'observation',
      state: 'filled',
      class: {
        container: 'bg-blue-500 border-2 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600',
        icon: 'text-white'
      }
    },
    // Meeting states with enhanced feedback
    {
      type: 'meeting',
      state: 'filled',
      class: {
        container: 'bg-green-500 border-2 border-green-500 text-white hover:bg-green-600 hover:border-green-600',
        icon: 'text-white'
      }
    },
    // Loading states
    {
      type: 'observation',
      state: 'loading',
      class: {
        container: 'bg-blue-100 border-2 border-blue-300',
        loadingSpinner: 'border-blue-600 border-t-transparent'
      }
    },
    {
      type: 'meeting', 
      state: 'loading',
      class: {
        container: 'bg-green-100 border-2 border-green-300',
        loadingSpinner: 'border-green-600 border-t-transparent'
      }
    },
    // Success states
    {
      type: 'observation',
      state: 'success',
      class: {
        container: 'bg-blue-500 border-2 border-blue-500 text-white'
      }
    },
    {
      type: 'meeting',
      state: 'success', 
      class: {
        container: 'bg-green-500 border-2 border-green-500 text-white'
      }
    }
  ],
  defaultVariants: {
    size: 'md',
    type: 'observation',
    state: 'empty'
  }
})

export interface AccountabilityIconProps extends VariantProps<typeof accountabilityIcon> {
  /** Icon type - observation or meeting */
  type: 'observation' | 'meeting'
  /** Whether the icon is filled (active) or empty */
  filled: boolean
  /** Click handler */
  onClick?: () => void
  /** Accessible label */
  label?: string
  /** Additional CSS class */
  className?: string
  /** Loading state for async operations */
  loading?: boolean
  /** Visual feedback state */
  feedbackState?: 'idle' | 'loading' | 'success' | 'error'
}

/**
 * AccountabilityIcon - Binary state icon component for accountability tracking
 * 
 * Displays either:
 * - Empty circle (not completed)
 * - Filled icon with purpose-specific icon and color:
 *   - Pencil icon (blue) for observations
 *   - Speech bubble icon (green) for meetings
 * 
 * @example
 * ```tsx
 * <AccountabilityIcon 
 *   type="observation" 
 *   filled={hasObservation}
 *   onClick={() => toggleObservation(teacherId)}
 *   label="Observation status"
 * />
 * ```
 */
export function AccountabilityIcon({
  type,
  size,
  filled,
  onClick,
  label,
  className,
  loading = false,
  feedbackState = 'idle'
}: AccountabilityIconProps) {
  // Determine the state based on loading and feedbackState
  const currentState = loading ? 'loading' : feedbackState !== 'idle' ? feedbackState : (filled ? 'filled' : 'empty')
  
  const styles = accountabilityIcon({ 
    size, 
    type, 
    state: currentState as 'empty' | 'filled' | 'loading' | 'success' | 'error'
  })

  // Get appropriate icon component
  const IconComponent = type === 'observation' ? PencilIconSolid : ChatBubbleLeftIconSolid

  // Handle click with loading state consideration
  const handleClick = () => {
    if (loading) return // Prevent clicks during loading
    onClick?.()
  }

  return (
    <button
      className={cn(styles.container(), className)}
      onClick={handleClick}
      disabled={loading}
      aria-label={label || `${filled ? 'Remove' : 'Add'} ${type}`}
      title={label || `${filled ? 'Remove' : 'Add'} ${type}`}
    >
      {loading ? (
        <div className={styles.loadingOverlay()}>
          <div className={styles.loadingSpinner()} />
        </div>
      ) : (
        <IconComponent className={styles.icon()} />
      )}
    </button>
  )
}

export default AccountabilityIcon 