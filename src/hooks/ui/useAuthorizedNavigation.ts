import { useMemo } from 'react'
import { useClerkContext } from '@/hooks/auth/useClerkContext'
import { navigationItems } from '@/app/dashboard/config'
import { useNavigation } from './useNavigation'
import type { NavigationItem } from '@/components/composed/layouts/sidebar/NavigationSidebar'

export function useAuthorizedNavigation() {
  const { user, metadata, allPermissions } = useClerkContext()
  const baseNavigation = useNavigation()

  const authorizedNavigationItems = useMemo(() => {
    if (!user) return []

    return filterNavigationByAuth(
      navigationItems,
      metadata.roles,
      allPermissions
    )
  }, [user, metadata.roles, allPermissions])
  
  // Recalculate navigation state with authorized items
  const authorizedNavigation = useMemo(() => {
    return {
      ...baseNavigation,
      navigation: updateNavigationState(authorizedNavigationItems, baseNavigation.pathname)
    }
  }, [authorizedNavigationItems, baseNavigation])
  
  return authorizedNavigation
}

function filterNavigationByAuth(
  items: NavigationItem[],
  userRoles: string[],
  userPermissions: string[]
): NavigationItem[] {
  return items
    .filter(item => {
      // Check roles
      if (item.requiredRoles && !item.requiredRoles.some(role => userRoles.includes(role))) {
        return false
      }
      
      // Check permissions
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
    .filter(item => !item.children || item.children.length > 0) // Remove empty parent items
}

// Re-export the updateNavigationState function from useNavigation
function updateNavigationState(items: NavigationItem[], pathname: string): NavigationItem[] {
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