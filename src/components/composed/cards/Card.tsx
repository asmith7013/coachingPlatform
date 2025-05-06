// src/components/composed/cards/Card.tsx
/**
 * Card component for displaying content in a contained, styled box.
 * Uses the compound component pattern for flexible layout.
 */

import React from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@/lib/tokens/tokens'
import {
  PaddingToken,
  RadiusToken,
  ShadowToken
} from '@/lib/tokens/types'
import type { CardStyleProps } from '@/lib/types/core/token'

/**
 * Card component styles using the Tailwind Variants pattern.
 * Provides consistent styling options for card layouts with configurable
 * sections (header, body, footer) following the compound component pattern.
 */
export const card = tv({
  slots: {
    root: [
      'divide-y divide-border',
    ],
    header: [
      textColors.default,
    ],
    body: [ // Changed from 'content' to 'body' for naming consistency
      textColors.muted,
    ],
    footer: [
      textColors.muted,
    ],
  },
  variants: {
    padding: {
      none: { root: 'p-0', header: 'p-0', body: 'p-0', footer: 'p-0' },
      xs: { root: 'p-2', header: 'px-2 py-1', body: 'p-2', footer: 'px-2 py-1' },
      sm: { root: 'p-3', header: 'px-3 py-2', body: 'p-3', footer: 'px-3 py-2' },
      md: { root: 'p-4', header: 'px-4 py-3', body: 'p-4', footer: 'px-4 py-3' },
      lg: { root: 'p-6', header: 'px-6 py-4', body: 'p-6', footer: 'px-6 py-4' },
      xl: { root: 'p-8', header: 'px-8 py-6', body: 'p-8', footer: 'px-8 py-6' },
      '2xl': { root: 'p-10', header: 'px-10 py-8', body: 'p-10', footer: 'px-10 py-8' },
    },
    radius: {
      none: { root: 'rounded-none', header: 'rounded-none', body: 'rounded-none', footer: 'rounded-none' },
      sm: { root: 'rounded-sm', header: 'rounded-sm', body: 'rounded-sm', footer: 'rounded-sm' },
      md: { root: 'rounded-md', header: 'rounded-md', body: 'rounded-md', footer: 'rounded-md' },
      lg: { root: 'rounded-lg', header: 'rounded-lg', body: 'rounded-lg', footer: 'rounded-lg' },
      xl: { root: 'rounded-xl', header: 'rounded-xl', body: 'rounded-xl', footer: 'rounded-xl' },
      '2xl': { root: 'rounded-2xl', header: 'rounded-2xl', body: 'rounded-2xl', footer: 'rounded-2xl' },
      full: { root: 'rounded-full', header: 'rounded-full', body: 'rounded-full', footer: 'rounded-full' },
    },
    shadow: {
      none: { root: 'shadow-none', header: 'shadow-none', body: 'shadow-none', footer: 'shadow-none' },
      sm: { root: 'shadow-sm', header: 'shadow-sm', body: 'shadow-sm', footer: 'shadow-sm' },
      md: { root: 'shadow-md', header: 'shadow-md', body: 'shadow-md', footer: 'shadow-md' },
      lg: { root: 'shadow-lg', header: 'shadow-lg', body: 'shadow-lg', footer: 'shadow-lg' },
      xl: { root: 'shadow-xl', header: 'shadow-xl', body: 'shadow-xl', footer: 'shadow-xl' },
      '2xl': { root: 'shadow-2xl', header: 'shadow-2xl', body: 'shadow-2xl', footer: 'shadow-2xl' },
    },
    variant: {
      default: { root: 'bg-surface' },
      alt: { root: 'bg-alt' },
      white: { root: 'bg-white' },
      transparent: { root: 'bg-transparent' },
      muted: { root: 'bg-muted' },
      secondary: { root: 'bg-secondary-100' },
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

// Create a React Context to pass styles to subcomponents
type CardContextType = {
  styles: ReturnType<typeof card>;
};

const CardContext = React.createContext<CardContextType | undefined>(undefined);

/**
 * Hook to use card context in subcomponents.
 * Ensures subcomponents are used within a Card parent component.
 * @returns The card context containing styles
 * @throws Error if used outside of a Card component
 */
const useCardContext = () => {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error("Card subcomponents must be used within a Card component. See documentation at [component-system][compound-component-pattern]");
  }
  return context;
};

/**
 * Main Card component props extending all available variant options
 */
interface CardRootProps extends Omit<CardStyleProps, 'variant'> {
  className?: string;
  children?: React.ReactNode;
  padding?: PaddingToken;
  radius?: RadiusToken;
  shadow?: ShadowToken;
  variant?: 'default' | 'alt' | 'white' | 'transparent' | 'muted' | 'secondary';
  border?: boolean;
}

/**
 * Card root component that provides the base container for card content.
 * Uses the compound component pattern with Header, Body, and Footer subcomponents.
 */
const CardRoot = ({
  className,
  children,
  padding = 'md',
  radius = 'md',
  border = false,
  variant = 'default',
  shadow = 'none',
}: CardRootProps) => {
  // Generate styles using Tailwind Variants
  const styles = card({ padding, radius, variant, shadow, border });
  
  return (
    <CardContext.Provider value={{ styles }}>
      <div className={cn(styles.root(), className)}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

// Card subcomponents
interface CardSubComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Card Header component for displaying title or heading content
 */
const Header = ({ className, children }: CardSubComponentProps) => {
  const { styles } = useCardContext();
  return (
    <div className={cn(styles.header(), className)}>
      {children}
    </div>
  );
};

/**
 * Card Body component for displaying the main content
 */
const Body = ({ className, children }: CardSubComponentProps) => {
  const { styles } = useCardContext();
  return (
    <div className={cn(styles.body(), className)}>
      {children}
    </div>
  );
};

/**
 * Card Footer component for displaying actions or supplementary content
 */
const Footer = ({ className, children }: CardSubComponentProps) => {
  const { styles } = useCardContext();
  return (
    <div className={cn(styles.footer(), className)}>
      {children}
    </div>
  );
};

/**
 * Legacy Card component interface for backward compatibility
 */
interface LegacyCardProps extends Omit<CardRootProps, 'children'> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  children?: React.ReactNode;
}

/**
 * Legacy Card implementation for backward compatibility
 * @deprecated Use the compound component pattern with Card.Header, Card.Body, and Card.Footer instead
 */
const LegacyCard = ({
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
}: LegacyCardProps) => {
  const styles = card({ padding, radius, variant, shadow, border });

  return (
    <div className={cn(styles.root(), className)}>
      {header && (
        <div className={styles.header()}>
          {header}
        </div>
      )}
      {children && (
        <div className={cn(styles.body(), contentClassName)}>
          {children}
        </div>
      )}
      {footer && (
        <div className={styles.footer()}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card component for displaying content in a contained, styled box.
 * Uses the compound component pattern for flexible layout.
 * 
 * @example
 * ```tsx
 * <Card variant="white" shadow="md">
 *   <Card.Header>Card Title</Card.Header>
 *   <Card.Body>Main content goes here</Card.Body>
 *   <Card.Footer>Footer actions</Card.Footer>
 * </Card>
 * ```
 */
export const Card = Object.assign(CardRoot, {
  Header,
  Body,
  Footer,
  Legacy: LegacyCard
});

/**
 * Export the full Card component type for better TypeScript integration
 */
export type CardComponent = typeof Card;

