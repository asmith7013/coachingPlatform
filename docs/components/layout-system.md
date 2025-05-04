```markdown
<doc id="layout-system">

# Application Layout System

<section id="layout-overview">

## Overview

Our application implements a layout system that provides a consistent UI structure across the application, following our atomic design principles and token-first styling methodology.

[RULE] Use the appropriate layout component for page organization rather than creating custom layouts.

</section>

<section id="integrated-app-shell">

## IntegratedAppShell

The `IntegratedAppShell` is our primary application layout component, combining a responsive navigation sidebar, topbar, and content area.

```typescript
import { IntegratedAppShell } from '@/components/core/layouts'
import { navigationItems, teamItems } from './config'

export default function DashboardLayout({ children }) {
  return (
    <IntegratedAppShell
      navigation={navigationItems}
      teams={teamItems}
      pageTitle="Dashboard"
      pageDescription="View and manage your coaching data"
    >
      {children}
    </IntegratedAppShell>
  )
}
```

Key features:
- Responsive design with mobile drawer and desktop fixed sidebar
- Configuration-based navigation
- Uses our design token system for consistent styling

[RULE] Provide navigation and team configurations from a central configuration file.

</section>

<section id="layout-configuration">

## Configuration and Implementation

Create a central configuration file for navigation and team items:

```typescript
// src/app/dashboard/config.ts
import { 
  HomeIcon, 
  BuildingLibraryIcon 
  // other icons 
} from '@heroicons/react/24/outline'

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Schools', href: '/dashboard/schoolList', icon: BuildingLibraryIcon, current: false },
  // other navigation items
]

export const teamItems = [
  { id: 'math-coaches', name: 'Math Coaches', href: '#', initial: 'M', current: false },
  // other team items
]
```

### Implementation Strategy

1. Start with a single route (e.g., `/dashboard`)
2. Check for duplicate page titles or headers 
3. Adjust any fixed margins or padding that might conflict with the layout
4. For dynamic "current" state, use `usePathname()` from Next.js

```typescript
'use client'

import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  
  const navigationItems = baseNavigationItems.map(item => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(`${item.href}/`)
  }))
  
  return (
    <IntegratedAppShell navigation={navigationItems}>
      {children}
    </IntegratedAppShell>
  )
}
```

[RULE] Update the "current" state of navigation items based on the active route.

</section>

<section id="layout-components">

## Component Structure

The layout system is composed of several specialized components:

- **IntegratedAppShell**: Main layout component combining all elements
- **NavigationSidebar**: Responsive sidebar with mobile and desktop modes
- **Topbar**: Top navigation with search, notifications, and user menu
- **DashboardPage**: Simpler layout with just title and description

Each component follows our token-first design approach for consistent styling and theming.

[RULE] Use NavigationSidebar and Topbar independently only when custom layouts are required.

</section>

<section id="theme-customization">

## Theme Customization

Customize the appearance through our token system:

```typescript
// In your token file (e.g., src/lib/ui/tokens/colors.ts)
export const navigationColors = {
  active: 'bg-blue-50 text-blue-600', // Change to match your brand color
  hover: 'hover:bg-gray-50 hover:text-blue-600',
  default: 'bg-transparent text-gray-700',
};
```

Then apply these tokens through the Tailwind Variants (tv) system.

[RULE] Use token variables for theme customization rather than hard-coding values.

</section>

</doc>
```
