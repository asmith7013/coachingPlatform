'use client'

import { cn } from '@/lib/utils'
import { spacing, typography, textColors, backgroundColors } from '@/lib/ui/tokens'
import { Topbar } from './topbar'

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface User {
  name: string
  email: string
  imageUrl: string
}

interface ShellLayoutProps {
  children: React.ReactNode
  className?: string
  padding?: keyof typeof spacing
  title?: string
  titleComponent?: React.ReactNode
  navigation?: NavigationItem[]
  user?: User
  topbarVariant?: 'solid' | 'transparent'
}

export function ShellLayout({
  children,
  className,
  padding = 'lg',
  title = 'Dashboard',
  titleComponent,
  navigation,
  user,
  topbarVariant = 'solid',
}: ShellLayoutProps) {
  // Extract token values into constants
  const paddingClass = spacing[padding]
  const headerPadding = spacing.lg
  const mainOffset = '-mt-32'
  const maxWidth = 'max-w-7xl'

  return (
    <div className={cn('min-h-full', backgroundColors.white, textColors.black)}>
      <div className={cn(backgroundColors.primary, 'pb-[128px]')}>
        <Topbar 
          navigation={navigation} 
          user={user} 
          variant={topbarVariant}
        />
        <header className={cn(headerPadding, paddingClass)}>
          {titleComponent || (
            <h1 className={cn(
              typography.weight.bold,
              typography.text.xl,
              textColors.primary,
              'tracking-tight'
            )}>
              {title}
            </h1>
          )}
        </header>
      </div>
      <main className={mainOffset}>
        <div className={cn('mx-auto', maxWidth, paddingClass, className)}>
          {children}
        </div>
      </main>
    </div>
  )
}
