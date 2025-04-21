# Atomic Component System Migration Guide

## Overview

This document outlines the process for migrating existing components to the new atomic component system and token-based design system. The migration ensures consistent styling throughout the application, making it more maintainable and modular.

## Core Principles

1. **Atomic Components**: Small, reusable UI building blocks with well-defined props  
2. **Token-Based Design**: Use centralized design tokens (`/lib/ui/tokens`) to define colors, spacing, typography, shadows, etc.  
3. **Token-Driven Variants**: All component variants defined with `tv()` should import from the design token system rather than hardcoding Tailwind classes. Avoid class-level "token drift" by using `textColors.default` instead of `'text-gray-900'`, `radii.md` instead of `'rounded-md'`, etc.  
4. **Inline Variants (When Needed)**: When tokens don’t exist for a particular variant or are highly specific, define them inline — but strongly consider creating a new token instead.  
5. **Tailwind Variants**: Use the `tv()` function from `tailwind-variants` to define component variants, leveraging slots, compoundVariants, and booleanVariant helpers when appropriate.

## Atomic Component Pattern

The core pattern for atomic components uses the `tailwind-variants` library to define component variants:

```tsx
// Component structure pattern
const component = tv({
  base: 'common-classes-here',
  // OR for components with multiple parts:
  slots: {
    base: 'base-classes-here',
    header: 'header-classes-here',
    // other slots...
  },
  variants: {
    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
    // other variants...
  },
  defaultVariants: {
    size: 'md',
    // other defaults...
  },
});
```

## Migration Process

### Step 1: Identify Existing Token Usage

Before migrating a component, determine which tokens it currently imports and uses:

```tsx
// Before migration
import { typography } from '@/lib/ui/tokens';
import { textSize, weight, color } from '@/lib/ui/tokens/typography';

<div className={cn(typography.weight.bold, 'text-gray-900')}>
  Heading Text
</div>

### Step 2: Replace with Inline Variants

Convert any inline or hardcoded styles into token-driven variants. Import from /lib/ui/tokens whenever a relevant token exists.

// Recommended: using tokens instead of inline definitions
import { textSize, weight, color } from '@/lib/ui/tokens/typography'

const text = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize,
    weight,
    color,
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
  },
});

### Step 3: Use Atomic Components

Replace raw HTML elements or ad hoc styles with semantic atomic components.

// Before
<label className={cn(typography.weight.bold, 'text-text block mb-2')}>
  Label Text
</label>

// After
<Text as="label" weight="bold" className="block mb-2">
  Label Text
</Text>

Ensure variant props (e.g., textSize, weight, color, radius) map to defined tokens, not raw utility classes.

Step 4: Prevent Token Drift

After migrating a component:
	•	Confirm all tv() variant values come from token imports
	•	Search for any class strings like 'text-gray-600', 'rounded-md', or 'shadow-sm'
	•	Replace with semantic tokens (e.g., textColors.muted, radii.md, shadows.sm)
	•	If a new token is needed, add it in /lib/ui/tokens


## Example Migrations

### Example 1: Text Component Migration

```tsx
// Before migration
import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { textSize, weight, color } from '@/lib/ui/tokens/typography'

const text = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize,
    weight,
    color,
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
  },
});

// After migration
import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'

const text = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      default: 'text-gray-900',
      muted: 'text-gray-600',
      accent: 'text-indigo-600',
      danger: 'text-red-600',
    },
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
  },
});
```

### Example 2: Heading Component Migration

```tsx
// Before migration
import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { heading as headingLevels, color as textColors } from '@/lib/ui/tokens/typography'

const heading = tv({
  slots: {
    heading: 'font-heading tracking-tight',
    subheading: 'font-body text-sm mt-1',
  },
  variants: {
    level: {
      h1: { heading: headingLevels.h1 },
      h2: { heading: headingLevels.h2 },
      h3: { heading: headingLevels.h3 },
      h4: { heading: headingLevels.h4 },
      h5: { heading: headingLevels.h5 },
      h6: { heading: headingLevels.h6 },
    },
    color: {
      default: { heading: textColors.default, subheading: textColors.muted },
      muted: { heading: textColors.muted, subheading: textColors.muted },
      accent: { heading: textColors.accent, subheading: textColors.muted },
      danger: { heading: textColors.danger, subheading: textColors.muted },
    },
  },
  defaultVariants: {
    level: 'h3',
    color: 'default',
  },
});

// After migration
import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'

const heading = tv({
  slots: {
    heading: 'font-heading tracking-tight',
    subheading: 'font-body text-sm mt-1',
  },
  variants: {
    level: {
      h1: { heading: 'text-4xl md:text-5xl leading-tight' },
      h2: { heading: 'text-3xl md:text-4xl leading-tight' },
      h3: { heading: 'text-2xl md:text-3xl leading-snug' },
      h4: { heading: 'text-xl md:text-2xl leading-snug' },
      h5: { heading: 'text-lg md:text-xl leading-normal' },
      h6: { heading: 'text-base md:text-lg leading-normal' },
    },
    color: {
      default: { heading: 'text-gray-900', subheading: 'text-gray-600' },
      muted: { heading: 'text-gray-600', subheading: 'text-gray-600' },
      accent: { heading: 'text-indigo-600', subheading: 'text-gray-600' },
      danger: { heading: 'text-red-600', subheading: 'text-gray-600' },
    },
  },
  defaultVariants: {
    level: 'h3',
    color: 'default',
  },
});
```

### Example 3: Component Usage Migration

```tsx
// Before migration
<motion.label
  layout
  className={cn(typography.weight.bold, 'text-text block mb-2')}
>
  Filter All:
</motion.label>

// After migration
<motion.div layout>
  <Text as="label" weight="bold" className="block mb-2">
    Filter All:
  </Text>
</motion.div>
```

## Common Component Variants

### Text Component

```tsx
textSize: {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
},
weight: {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
},
color: {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  accent: 'text-indigo-600',
  danger: 'text-red-600',
}
```

### Button Component

```tsx
intent: {
  primary: '',
  secondary: '',
},
appearance: {
  solid: '',
  alt: '',
  outline: '',
},
textSize: {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
},
padding: {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-6 py-3',
},
radius: {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
}
```

### Card Component

```tsx
padding: {
  none: { body: 'p-0' },
  sm: { body: 'p-4' },
  md: { body: 'p-6' },
  lg: { body: 'p-8' },
},
radius: {
  none: { base: 'rounded-none' },
  sm: { base: 'rounded-sm' },
  md: { base: 'rounded-md' },
  lg: { base: 'rounded-lg' },
  xl: { base: 'rounded-xl' },
},
shadow: {
  none: { base: 'shadow-none' },
  sm: { base: 'shadow-sm' },
  md: { base: 'shadow' },
  lg: { base: 'shadow-lg' },
}
```

## Migration Progress Tracking

| Component | Status | Notes |
|-----------|--------|-------|
| Text | ✅ Complete | Both in core and ui directories |
| Heading | ✅ Complete | Both in core and ui directories |
| RoutineFilter | ✅ Complete | Uses Text component with proper props |
| Button | ✅ Complete | Already using inline variants |
| Card | 🔄 Pending | Example created in src/examples/CardExample.tsx |
| Form | 🔄 Pending | |
| Input | 🔄 Pending | |
| Select | 🔄 Pending | |
| Table Components | 🔄 Pending | |

## Next Steps

1. Complete migrating all core components
2. Migrate feature components 
3. Audit and remove redundant components
4. Clean up token files
5. Update documentation for new component usage