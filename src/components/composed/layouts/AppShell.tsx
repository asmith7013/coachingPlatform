'use client'

import { useState, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { cn } from '@ui/utils/formatters'
import { Topbar } from './Topbar'
import { NavigationSidebar, type NavigationItem, type TeamItem } from './NavigationSidebar'
import { 
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'


// Default navigation items
const defaultNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Team', href: '/team', icon: UsersIcon, current: false },
  { name: 'Projects', href: '/projects', icon: FolderIcon, current: false },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon, current: false },
  { name: 'Documents', href: '/documents', icon: DocumentDuplicateIcon, current: false },
  { name: 'Reports', href: '/reports', icon: ChartPieIcon, current: false },
]

// Default teams
const defaultTeams: TeamItem[] = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

interface IntegratedAppShellProps {
  children: ReactNode
  navigation?: NavigationItem[]
  teams?: TeamItem[]
  showTeams?: boolean
  pageTitle?: string
  pageDescription?: string
  breadcrumbs?: Array<{ name: string; href: string; current: boolean }>
  className?: string
}

// Create layout styles using tv from tailwind-variants
const appShell = tv({
  slots: {
    root: 'h-full bg-background',
    content: 'lg:pl-52',
    mainContent: 'py-4', // Reduced since topbar provides some spacing
    contentWrapper: 'mx-auto max-w-7xl px-3 sm:px-4 lg:px-6',
    pageHeader: 'mb-4',
  },
  variants: {
    padding: {
      none: { 
        mainContent: 'py-0',
        contentWrapper: 'px-0'
      },
      sm: { 
        mainContent: 'py-2',
        contentWrapper: 'px-2 sm:px-3 lg:px-4'
      },
      md: { 
        mainContent: 'py-4',
        contentWrapper: 'px-3 sm:px-4 lg:px-6'
      },
      lg: { 
        mainContent: 'py-6',
        contentWrapper: 'px-4 sm:px-6 lg:px-8'
      },
      xl: { 
        mainContent: 'py-8',
        contentWrapper: 'px-6 sm:px-8 lg:px-10'
      },
    }
  },
  defaultVariants: {
    padding: 'md'
  }
});

export function AppShell({
  children,
  navigation = defaultNavigation,
  teams = defaultTeams,
  showTeams = true,
  breadcrumbs = [],
  className,
}: IntegratedAppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const styles = appShell();

  return (
    <div className={cn(styles.root(), className)}>
      {/* Navigation sidebar */}
      <NavigationSidebar 
        navigation={navigation}
        teams={teams}
        showTeams={showTeams}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Content area */}
      <div className={styles.content()}>
        {/* Top navigation - now visible with breadcrumbs */}
        <Topbar breadcrumbs={breadcrumbs} />

        {/* Main content */}
        <main className={styles.mainContent()}>
          <div className={styles.contentWrapper()}>
            {/* Page content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}