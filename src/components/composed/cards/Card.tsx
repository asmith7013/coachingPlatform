// src/components/ui/card.tsx

import React from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  shadowVariant,
} from '@ui-variants/shared-variants'
import { textColors } from '@ui-tokens/tokens'

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
    padding: {
      none: { root: 'p-0', header: 'p-0', content: 'p-0', footer: 'p-0' },
      xs: { root: 'p-2', header: 'px-2 py-1', content: 'p-2', footer: 'px-2 py-1' },
      sm: { root: 'p-3', header: 'px-3 py-2', content: 'p-3', footer: 'px-3 py-2' },
      md: { root: 'p-4', header: 'px-4 py-3', content: 'p-4', footer: 'px-4 py-3' },
      lg: { root: 'p-6', header: 'px-6 py-4', content: 'p-6', footer: 'px-6 py-4' },
      xl: { root: 'p-8', header: 'px-8 py-6', content: 'p-8', footer: 'px-8 py-6' },
    },
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