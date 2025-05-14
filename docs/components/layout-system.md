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

The `IntegratedAppShell` is our primary application layout component, combining a responsive navigation sidebar, topbar, and content area with dynamic navigation based on the current route.

```typescript
import { AppShell } from '@/components/composed/layouts/AppShell'
import { teamItems } from './config'
import { useAuthorizedNavigation } from '@/hooks/ui/useAuthorizedNavigation'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { navigation, pageInfo } = useAuthorizedNavigation()
  
  return (
    <AppShell
      navigation={navigation}
      teams={teamItems}
      pageTitle={pageInfo.title}
      pageDescription={pageInfo.description}
      showTeams={true}
      logo={{
        src: '/logo.svg',
        alt: 'Coaching Platform'
      }}
    >
      {children}
    </AppShell>
  )
}
```

Key features:

Dynamic navigation that updates based on current route
Authorization-based filtering using Clerk
Automatic page titles and descriptions
Support for nested navigation items
Responsive design with mobile drawer and desktop fixed sidebar

[RULE] Use the authorized navigation hook to ensure navigation items respect user permissions.
</section>

<section id="layout-configuration">

## Configuration and Implementation

Create a central configuration file for navigation, teams, and page metadata:

```typescript
// src/app/dashboard/config.ts
import { 
  HomeIcon, 
  BuildingLibraryIcon,
  UserGroupIcon,
  // other icons 
} from '@heroicons/react/24/outline'

export const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    requiredPermissions: ['dashboard.view']
  },
  { 
    name: 'Schools', 
    href: '/dashboard/schoolList', 
    icon: BuildingLibraryIcon,
    requiredPermissions: ['schools.view']
  },
  { 
    name: 'Staff', 
    href: '/dashboard/staff', 
    icon: UserGroupIcon,
    requiredPermissions: ['staff.view'],
    children: [
      { 
        name: 'Teaching Lab', 
        href: '/dashboard/staff/teachingLab', 
        icon: UserGroupIcon,
        requiredPermissions: ['staff.teachinglab.view']
      },
      { 
        name: 'NYCPS Staff', 
        href: '/dashboard/staff/nycps', 
        icon: UserGroupIcon,
        requiredPermissions: ['staff.nycps.view']
      }
    ]
  }
]

export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your coaching activities'
  },
  '/dashboard/schoolList': {
    title: 'Schools',
    description: 'Manage and view all schools in your district'
  },
  // Additional page metadata...
}
```

Navigation State Management
Navigation state is automatically managed using hooks:

```typescript
// src/hooks/ui/useNavigation.ts
export function useNavigation() {
  const pathname = usePathname()
  
  const navigation = useMemo(() => {
    return updateNavigationState(navigationItems, pathname)
  }, [pathname])
  
  const pageInfo = useMemo(() => {
    return getPageInfo(pathname)
  }, [pathname])
  
  return { navigation, pageInfo }
}
```

Implementation Strategy

Define navigation structure in config.ts with required permissions
Use useAuthorizedNavigation() to filter based on user permissions
Navigation current states update automatically based on pathname
Dynamic page titles and descriptions from metadata

[RULE] Navigation configuration serves as the single source of truth for application structure.
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
