// src/components/ui/card.tsx

import React from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  shadowVariant,
  paddingVariant,
} from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

// 🎨 Card style variants
export const card = tv({
  slots: {
    root: [
      'divide-y divide-border',
    ],
    header: [
      textColors.default,
    ],
    content: [
      textColors.muted,
    ],
    footer: [
      textColors.muted,
    ],
  },
  variants: {
    ...paddingVariant.variants,
    ...radiusVariant.variants,
    ...shadowVariant.variants,
    variant: {
      default: { root: 'bg-surface' },
      alt: { root: 'bg-alt' },
      white: { root: 'bg-white' },
      transparent: { root: 'bg-transparent' },
    },
    border: {
      true: { root: 'border border-primary' },
      false: {},
    },
  },
  defaultVariants: {
    padding: 'md',
    radius: 'md',
    variant: 'default',
    shadow: 'sm',
    border: false,
  },
});

// ✅ Export for atomic style use elsewhere
export const cardStyles = card;

// ✅ Export type for variant props
export type CardVariants = VariantProps<typeof card>;

interface CardProps extends CardVariants {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}

export const Card = ({
  className,
  children,
  header,
  footer,
  padding = 'md',
  radius = 'md',
  border = false,
  variant = 'default',
  shadow = 'sm',
  contentClassName,
}: CardProps) => {
  const styles = card({ padding, radius, variant, shadow, border });

  return (
    <div className={cn(styles.root(), className)}>
      {header && (
        <div className={styles.header()}>
          {header}
        </div>
      )}
      {children && (
        <div className={cn(styles.content(), contentClassName)}>
          {children}
        </div>
      )}
      {footer && (
        <div className={styles.footer()}>
          {footer}
        </div>
      )}
    </div>
  )
}