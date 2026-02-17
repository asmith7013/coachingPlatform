// src/hooks/auth/usePermissionFiltering.ts
import { useMemo } from "react";
import { useClerkContext } from "./useClerkContext";
import type { NavigationItem } from "@/components/composed/layouts/sidebar/NavigationSidebar";

export function usePermissionFiltering() {
  const { user, metadata, allPermissions } = useClerkContext();

  const userPermissions = useMemo(() => {
    if (!user) return { roles: [], permissions: [] };

    return { roles: metadata.roles, permissions: allPermissions };
  }, [user, metadata.roles, allPermissions]);

  const filterItemsByPermissions = useMemo(() => {
    return (items: NavigationItem[]) => {
      if (!user) return [];

      return filterNavigationByAuth(
        items,
        userPermissions.roles,
        userPermissions.permissions,
      );
    };
  }, [user, userPermissions]);

  return {
    userPermissions,
    filterItemsByPermissions,
    isAuthenticated: !!user,
  };
}

function filterNavigationByAuth(
  items: NavigationItem[],
  userRoles: string[],
  userPermissions: string[],
): NavigationItem[] {
  return items
    .filter((item) => {
      if (
        item.requiredRoles &&
        !item.requiredRoles.some((role) => userRoles.includes(role))
      ) {
        return false;
      }

      if (
        item.requiredPermissions &&
        !item.requiredPermissions.some((permission) =>
          userPermissions.includes(permission),
        )
      ) {
        return false;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterNavigationByAuth(item.children, userRoles, userPermissions)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}
