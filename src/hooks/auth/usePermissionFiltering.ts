// src/hooks/auth/usePermissionFiltering.ts
import { useMemo } from 'react'
import { useUser, useOrganization } from '@clerk/nextjs'
import type { NavigationItem } from '@composed-components/layouts/NavigationSidebar'

export function usePermissionFiltering() {
  const { user } = useUser()
  const { organization } = useOrganization()
  
  const userPermissions = useMemo(() => {
    if (!user) return { roles: [], permissions: [] }
    
    const userRoles = (user.publicMetadata.roles as string[]) || []
    const userPermissions = (user.publicMetadata.permissions as string[]) || []
    
    // Add organization-based permissions if user belongs to an organization
    if (organization) {
      const orgPermissions = (organization.publicMetadata.permissions as string[]) || []
      userPermissions.push(...orgPermissions)
    }
    
    return { roles: userRoles, permissions: userPermissions }
  }, [user, organization])
  
  const filterItemsByPermissions = useMemo(() => {
    return (items: NavigationItem[]) => {
      if (!user) return []
      
      return filterNavigationByAuth(
        items,
        userPermissions.roles,
        userPermissions.permissions
      )
    }
  }, [user, userPermissions])
  
  return {
    userPermissions,
    filterItemsByPermissions,
    isAuthenticated: !!user
  }
}

function filterNavigationByAuth(
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