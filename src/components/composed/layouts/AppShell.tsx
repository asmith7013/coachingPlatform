'use client'

import { useState, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { cn } from '@ui/utils/formatters'
import { Topbar } from './Topbar'
import { NavigationSidebar, type NavigationItem, type TeamItem } from './NavigationSidebar'
import { Heading } from '@/components/core/typography/Heading'
import { Text } from '@/components/core/typography/Text'
// import { paddingX, paddingY, textColors, textSize } from '@ui-tokens/tokens'
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

// Default user
const defaultUser = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

// Default user navigation
const defaultUserNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

interface IntegratedAppShellProps {
  children: ReactNode
  navigation?: NavigationItem[]
  teams?: TeamItem[]
  showTeams?: boolean
  user?: {
    name: string
    email: string
    imageUrl: string
  }
  userNavigation?: { name: string; href: string }[]
  logo?: {
    src: string
    alt: string
  }
  pageTitle?: string
  pageDescription?: string
  className?: string
}

// Create layout styles using tv from tailwind-variants
const appShell = tv({
  slots: {
    root: 'h-full bg-background',
    content: 'lg:pl-72',
    mainContent: 'py-10',
    contentWrapper: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    pageHeader: 'mb-6',
  },
  variants: {
    padding: {
      none: { 
        mainContent: 'py-0',
        contentWrapper: 'px-0'
      },
      sm: { 
        mainContent: 'py-4',
        contentWrapper: 'px-2 sm:px-3 lg:px-4'
      },
      md: { 
        mainContent: 'py-6',
        contentWrapper: 'px-4 sm:px-6 lg:px-8'
      },
      lg: { 
        mainContent: 'py-10',
        contentWrapper: 'px-6 sm:px-8 lg:px-10'
      },
      xl: { 
        mainContent: 'py-12',
        contentWrapper: 'px-8 sm:px-10 lg:px-12'
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
  user = defaultUser,
  userNavigation = defaultUserNavigation,
  logo = {
    src: 'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600',
    alt: 'Your Company'
  },
  pageTitle,
  pageDescription,
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
        logo={logo}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Content area */}
      <div className={styles.content()}>
        {/* Top navigation */}
        <Topbar
          onSidebarToggle={() => setSidebarOpen(true)}
          user={user}
          userNavigation={userNavigation}
        />

        {/* Main content */}
        <main className={styles.mainContent()}>
          <div className={styles.contentWrapper()}>
            {/* Page header with title and description */}
            {(pageTitle || pageDescription) && (
              <div className={styles.pageHeader()}>
                {pageTitle && (
                  <Heading 
                    level="h1" 
                    color="default"
                    className="mb-2"
                  >
                    {pageTitle}
                  </Heading>
                )}
                {pageDescription && (
                  <Text
                    textSize="lg"
                    color="muted"
                  >
                    {pageDescription}
                  </Text>
                )}
              </div>
            )}
            
            {/* Page content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}