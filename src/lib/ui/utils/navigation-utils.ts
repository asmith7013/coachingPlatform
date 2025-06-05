import type { NavigationItem } from '@composed-components/layouts/NavigationSidebar'

/**
 * Updates navigation state to reflect current active path
 */
export function updateNavigationState(
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

/**
 * Finds the currently active navigation item
 */
export function findCurrentPage(items: NavigationItem[]): NavigationItem | null {
  for (const item of items) {
    if (item.current) return item
    if (item.children) {
      const child = findCurrentPage(item.children)
      if (child) return child
    }
  }
  return null
}

/**
 * Finds a navigation item by its path
 */
export function findItemByPath(items: NavigationItem[], path: string): NavigationItem | null {
  for (const item of items) {
    if (item.href === path) return item
    if (item.children) {
      const child = findItemByPath(item.children, path)
      if (child) return child
    }
  }
  return null
}

/**
 * Formats URL segment names for display
 */
export function formatSegmentName(segment: string): string {
  const specialCases: Record<string, string> = {
    'schoolList': 'Schools',
    'classroomNotes': 'Classroom Notes',
    'lookForList': 'Look Fors',
    'coaching-action-plans': 'Coaching Plans',
    'teachingLab': 'Teaching Lab',
    'nycps': 'NYCPS'
  }
  
  return specialCases[segment] || 
    segment.charAt(0).toUpperCase() + segment.slice(1)
}

/**
 * Filters navigation items based on user authentication
 */
export function filterNavigationByAuth(
  items: NavigationItem[],
  userRoles: string[],
  userPermissions: string[]
): NavigationItem[] {
  return items
    .filter(item => {
      if (item.requiredRoles && !item.requiredRoles.some(role => userRoles.includes(role))) {
        return false
      }
      
      if (item.requiredPermissions && !item.requiredPermissions.some(permission => userPermissions.includes(permission))) {
        return false
      }
      
      return true
    })
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavigationByAuth(item.children, userRoles, userPermissions)
        : undefined
    }))
    .filter(item => !item.children || item.children.length > 0)
}