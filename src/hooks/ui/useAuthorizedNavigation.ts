import { useMemo } from 'react'
import { useUser, useOrganization } from '@clerk/nextjs'
import { navigationItems } from '@/app/dashboard/config'
import { useNavigation } from './useNavigation'
import type { NavigationItem } from '@/components/composed/layouts/sidebar/NavigationSidebar'

export function useAuthorizedNavigation() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const baseNavigation = useNavigation()
  
  const authorizedNavigationItems = useMemo(() => {
    if (!user) return []
    
    // Get roles and permissions from Clerk public metadata
    const userRoles = (user.publicMetadata.roles as string[]) || []
    const userPermissions = (user.publicMetadata.permissions as string[]) || []
    
    // Add organization-based permissions if user belongs to an organization
    if (organization) {
      const orgPermissions = (organization.publicMetadata.permissions as string[]) || []
      userPermissions.push(...orgPermissions)
    }
    
    return filterNavigationByAuth(
      navigationItems,
      userRoles,
      userPermissions
    )
  }, [user, organization])
  
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