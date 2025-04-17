// src/components/ui/card.tsx

import React from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  radiusVariant,
  shadowVariant,
  type RadiusVariant,
  type ShadowVariant,
} from '@/lib/ui/variants'
import { gap } from '@/lib/ui/tokens'

interface CardProps extends RadiusVariant, ShadowVariant {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: keyof typeof gap;
  border?: boolean;
  variant?: 'default' | 'alt' | 'white' | 'transparent';
  contentClassName?: string;
}

// 🎨 Card style variants
export const card = tv({
  slots: {
    root: [
      'divide-y divide-border',
    ],
    header: [
      'text-primary',
    ],
    content: [
      'text-secondary',
    ],
    footer: [
      'text-muted',
    ],
  },
  variants: {
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
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
  compoundVariants: [
    {
      padding: 'md',
      class: {
        header: 'px-4 py-4 sm:px-6',
        content: 'px-4 py-4 sm:p-6',
        footer: 'px-4 py-2 sm:px-6',
      },
    },
  ],
  defaultVariants: {
    padding: 'md',
    rounded: 'md',
    variant: 'default',
    shadow: 'sm',
    border: false,
  },
});

// ✅ Export for atomic style use elsewhere
export const cardStyles = card;

// ✅ Export type for variant props
export type CardVariants = VariantProps<typeof card>;

export const Card = ({
  className,
  children,
  header,
  footer,
  padding = 'md',
  rounded = 'md',
  border = false,
  variant = 'default',
  shadow = 'sm',
  contentClassName,
}: CardProps) => {
  const styles = card({ padding, rounded, variant, shadow, border });

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