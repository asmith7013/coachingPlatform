import { useMemo } from 'react'
import { navigationItems } from '@/app/dashboard/config'
import { useNavigation } from './useNavigation'

// src/hooks/ui/useAuthorizedNavigation.ts - UPDATE to use auth hook
import { usePermissionFiltering } from '@hooks/auth/usePermissionFiltering'
import { updateNavigationState } from '@/lib/ui/utils/navigation-utils'

export function useAuthorizedNavigation() {
  const { filterItemsByPermissions } = usePermissionFiltering()
  const baseNavigation = useNavigation()
  
  const authorizedNavigationItems = useMemo(() => {
    return filterItemsByPermissions(navigationItems)
  }, [filterItemsByPermissions])
  
  const authorizedNavigation = useMemo(() => {
    return {
      ...baseNavigation,
      navigation: updateNavigationState(authorizedNavigationItems, baseNavigation.pathname)
    }
  }, [authorizedNavigationItems, baseNavigation])
  
  return authorizedNavigation
}
