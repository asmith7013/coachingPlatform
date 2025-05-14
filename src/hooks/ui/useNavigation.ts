import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { navigationItems, pageMetadata } from '@/app/dashboard/config'
import type { NavigationItem } from '@/components/composed/layouts/NavigationSidebar'

export function useNavigation() {
  const pathname = usePathname()
  
  const navigation = useMemo(() => {
    return updateNavigationState(navigationItems, pathname)
  }, [pathname])
  
  const currentPage = useMemo(() => {
    return findCurrentPage(navigation)
  }, [navigation])
  
  const pageInfo = useMemo(() => {
    return getPageInfo(pathname)
  }, [pathname])
  
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname, navigation)
  }, [pathname, navigation])
  
  return {
    navigation,
    currentPage,
    pageInfo,
    breadcrumbs,
    pathname
  }
}

function updateNavigationState(
  items: NavigationItem[], 
  pathname: string
): NavigationItem[] {
  return items.map(item => {
    const isActive = pathname === item.href || 
                   (pathname.startsWith(item.href) && item.href !== '/dashboard')
    
    const children = item.children 
      ? updateNavigationState(item.children, pathname)
      : undefined
    
    return {
      ...item,
      current: isActive,
      ...(children && { children })
    }
  })
}

function findCurrentPage(items: NavigationItem[]): NavigationItem | null {
  for (const item of items) {
    if (item.current) return item
    if (item.children) {
      const child = findCurrentPage(item.children)
      if (child) return child
    }
  }
  return null
}

function getPageInfo(pathname: string): { title: string; description: string } {
  // Handle dynamic routes
  if (pathname.match(/^\/dashboard\/schoolList\/[^/]+$/)) {
    return {
      title: 'School Details',
      description: 'View and manage school information'
    }
  }
  
  return pageMetadata[pathname] || {
    title: 'Page',
    description: 'Coaching platform'
  }
}

function generateBreadcrumbs(
  pathname: string, 
  navigation: NavigationItem[]
): Array<{ name: string; href: string; current: boolean }> {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; href: string; current: boolean }> = []
  
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i]
    const isLast = i === segments.length - 1
    
    // Find matching navigation item
    const navItem = findItemByPath(navigation, currentPath)
    
    breadcrumbs.push({
      name: navItem?.name || formatSegmentName(segments[i]),
      href: currentPath,
      current: isLast
    })
  }
  
  return breadcrumbs
}

function findItemByPath(items: NavigationItem[], path: string): NavigationItem | null {
  for (const item of items) {
    if (item.href === path) return item
    if (item.children) {
      const child = findItemByPath(item.children, path)
      if (child) return child
    }
  }
  return null
}

function formatSegmentName(segment: string): string {
  const specialCases: Record<string, string> = {
    'schoolList': 'Schools',
    'classroomNotes': 'Classroom Notes',
    'lookForList': 'Look Fors',
    'teachingLab': 'Teaching Lab',
    'nycps': 'NYCPS'
  }
  
  return specialCases[segment] || 
    segment.charAt(0).toUpperCase() + segment.slice(1)
} 