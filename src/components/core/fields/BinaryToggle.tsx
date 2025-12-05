'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import {
  paddingX,
  paddingY,
  radii,
  textSize,
  weight,
  shadows,
  spaceBetween
} from '@/lib/tokens/tokens'
import {
  textColors,
  backgroundColors
} from '@/lib/tokens/colors'

const binaryToggle = tv({
  slots: {
    container: ['flex items-center', spaceBetween.x.xs, backgroundColors.light.muted, radii.lg, paddingX.xs],
    button: ['flex items-center', spaceBetween.x.sm, paddingX.lg, paddingY.sm, textSize.sm, weight.medium, radii.md, 'transition-colors', 'cursor-pointer']
  },
  variants: {
    active: {
      true: {
        button: [textColors.primary, backgroundColors.white, shadows.sm]
      },
      false: {
        button: [textColors.muted, `hover:${textColors.default}`, `hover:${backgroundColors.light.muted}`]
      }
    }
  }
})

export interface BinaryToggleProps extends VariantProps<typeof binaryToggle> {
  /** Current value (true or false) */
  value: boolean
  /** Handle value change */
  onChange: (value: boolean) => void
  /** Label for true state */
  trueLabel: string
  /** Label for false state */
  falseLabel: string
  /** Optional class name */
  className?: string
}

/**
 * BinaryToggle - A simple two-option toggle component
 *
 * @example
 * ```tsx
 * <BinaryToggle
 *   value={showDetails}
 *   onChange={setShowDetails}
 *   trueLabel="Show Details"
 *   falseLabel="Hide Details"
 * />
 * ```
 */
export function BinaryToggle({
  value,
  onChange,
  trueLabel,
  falseLabel,
  className
}: BinaryToggleProps) {
  const styles = binaryToggle()

  return (
    <div className={`${styles.container()} ${className || ''}`}>
      <button
        onClick={() => onChange(true)}
        className={styles.button({ active: value === true })}
        aria-pressed={value === true}
        type="button"
      >
        <span>{trueLabel}</span>
      </button>
      <button
        onClick={() => onChange(false)}
        className={styles.button({ active: value === false })}
        aria-pressed={value === false}
        type="button"
      >
        <span>{falseLabel}</span>
      </button>
    </div>
  )
}

export default BinaryToggle
