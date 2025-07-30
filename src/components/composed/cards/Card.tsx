// src/components/composed/cards/Card.tsx
"use client"
/**
 * Card component for displaying content in a contained, styled box.
 * Uses the compound component pattern for flexible layout.
 */

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { 
  paddingX, paddingY, radii, shadows
} from '@/lib/tokens/tokens'
import { 
  textColors, backgroundColors, borderColors
} from '@/lib/tokens/colors'
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
      none: { 
        root: [paddingX.none, paddingY.none], 
        header: [paddingX.none, paddingY.none], 
        body: [paddingX.none, paddingY.none], 
        footer: [paddingX.none, paddingY.none] 
      },
      xs: { 
        root: [paddingX.sm, paddingY.sm],        // p-2 → paddingX.sm + paddingY.sm
        header: [paddingX.sm, paddingY.xs],      // px-2 py-1 → paddingX.sm + paddingY.xs
        body: [paddingX.sm, paddingY.sm], 
        footer: [paddingX.sm, paddingY.xs] 
      },
      sm: { 
        root: [paddingX.lg, paddingY.lg],        // p-3 → paddingX.lg + paddingY.lg
        header: [paddingX.lg, paddingY.sm],      // px-3 py-2 → paddingX.lg + paddingY.sm
        body: [paddingX.lg, paddingY.lg], 
        footer: [paddingX.lg, paddingY.sm] 
      },
      md: { 
        root: [paddingX.md, paddingY.md],        // p-4 → paddingX.md + paddingY.md
        header: [paddingX.md, paddingY.lg],      // px-4 py-3 → paddingX.md + paddingY.lg
        body: [paddingX.md, paddingY.md], 
        footer: [paddingX.md, paddingY.lg] 
      },
      lg: { 
        root: [paddingX.lg, paddingY.lg],        // p-6 → paddingX.lg + paddingY.lg
        header: [paddingX.lg, paddingY.md],      // px-6 py-4 → paddingX.lg + paddingY.md
        body: [paddingX.lg, paddingY.lg], 
        footer: [paddingX.lg, paddingY.md] 
      },
      xl: { 
        root: [paddingX.xl, paddingY.xl],        // p-8 → paddingX.xl + paddingY.xl
        header: [paddingX.xl, paddingY.lg],      // px-8 py-6 → paddingX.xl + paddingY.lg
        body: [paddingX.xl, paddingY.xl], 
        footer: [paddingX.xl, paddingY.lg] 
      },
      '2xl': { 
        root: [paddingX['2xl'], paddingY['2xl']], // p-10 → paddingX['2xl'] + paddingY['2xl']
        header: [paddingX['2xl'], paddingY.xl],   // px-10 py-8 → paddingX['2xl'] + paddingY.xl
        body: [paddingX['2xl'], paddingY['2xl']], 
        footer: [paddingX['2xl'], paddingY.xl] 
      },
    },
    radius: {
      none: { 
        root: radii.none, header: radii.none, body: radii.none, footer: radii.none      // rounded-none → radii.none
      },
      sm: { 
        root: radii.sm, header: radii.sm, body: radii.sm, footer: radii.sm             // rounded-sm → radii.sm
      },
      md: { 
        root: radii.md, header: radii.md, body: radii.md, footer: radii.md             // rounded-md → radii.md
      },
      lg: { 
        root: radii.lg, header: radii.lg, body: radii.lg, footer: radii.lg             // rounded-lg → radii.lg
      },
      xl: { 
        root: radii.xl, header: radii.xl, body: radii.xl, footer: radii.xl             // rounded-xl → radii.xl
      },
      '2xl': { 
        root: radii['2xl'], header: radii['2xl'], body: radii['2xl'], footer: radii['2xl'] // rounded-2xl → radii['2xl']
      },
      full: { 
        root: radii.full, header: radii.full, body: radii.full, footer: radii.full     // rounded-full → radii.full
      },
    },
    shadow: {
      none: { 
        root: shadows.none, header: shadows.none, body: shadows.none, footer: shadows.none     // shadow-none → shadows.none
      },
      sm: { 
        root: shadows.sm, header: shadows.sm, body: shadows.sm, footer: shadows.sm             // shadow-sm → shadows.sm
      },
      md: { 
        root: shadows.md, header: shadows.md, body: shadows.md, footer: shadows.md             // shadow-md → shadows.md
      },
      lg: { 
        root: shadows.lg, header: shadows.lg, body: shadows.lg, footer: shadows.lg             // shadow-lg → shadows.lg
      },
      xl: { 
        root: shadows.xl, header: shadows.xl, body: shadows.xl, footer: shadows.xl             // shadow-xl → shadows.xl
      },
      '2xl': { 
        root: shadows['2xl'], header: shadows['2xl'], body: shadows['2xl'], footer: shadows['2xl'] // shadow-2xl → shadows['2xl']
      },
    },
    variant: {
      default: { root: backgroundColors.surface },        // bg-surface → backgroundColors.surface
      alt: { root: 'bg-alt' },                           // Keep as-is if no direct token
      white: { root: backgroundColors.white },            // bg-white → backgroundColors.white
      transparent: { root: 'bg-transparent' },            // Keep as-is (special case)
      muted: { root: backgroundColors.muted },            // bg-muted → backgroundColors.muted
      secondary: { root: backgroundColors.light.secondary }, // bg-secondary-100 → backgroundColors.light.secondary
    },
    border: {
      true: { root: ['border', borderColors.primary] },   // border border-primary → border + borderColors.primary
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

const CardContext = createContext<CardContextType | undefined>(undefined);

/**
 * Hook to use card context in subcomponents.
 * Ensures subcomponents are used within a Card parent component.
 * @returns The card context containing styles
 * @throws Error if used outside of a Card component
 */
const useCardContext = () => {
  const context = useContext(CardContext);
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
  children?: ReactNode;
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
  children?: ReactNode;
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
});

/**
 * Export the full Card component type for better TypeScript integration
 */
export type CardComponent = typeof Card;

