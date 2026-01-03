import { useClerk } from '@clerk/nextjs';
import { useMemo, useCallback } from 'react';
import {
  AuthenticatedUser,
  ROLE_PERMISSIONS,
  Permission,
} from '@core-types/auth';
import { useClerkContext } from './useClerkContext';

export function useAuthenticatedUser(): AuthenticatedUser {
  const {
    user,
    isLoaded,
    isSignedIn,
    metadata,
    allPermissions,
    isSuperAdmin,
    isDirector,
    isSeniorDirector,
  } = useClerkContext();

  // Calculate effective permissions (role-based + user + org)
  const permissions = useMemo(() => {
    // Get permissions from roles
    const rolePermissions = metadata.roles.flatMap((role: string) =>
      ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []
    );

    // Combine role-based permissions with direct permissions (already includes org)
    const combinedPermissions = Array.from(new Set([...rolePermissions, ...allPermissions]));
    return combinedPermissions as Permission[];
  }, [metadata.roles, allPermissions]);
  
  // Permission checking functions
  const hasPermission = useCallback((permission: Permission) => {
    return permissions.includes(permission);
  }, [permissions]);
  
  const hasAnyPermission = useCallback((perms: Permission[]) => {
    return perms.some(perm => permissions.includes(perm));
  }, [permissions]);
  
  const hasAllPermissions = useCallback((perms: Permission[]) => {
    return perms.every(perm => permissions.includes(perm));
  }, [permissions]);
  
  // Role checking functions
  const hasRole = useCallback((role: string) => {
    return metadata.roles.includes(role);
  }, [metadata.roles]);
  
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some(role => metadata.roles.includes(role));
  }, [metadata.roles]);
  
  // School access checking
  const canAccessSchool = useCallback((schoolId: string) => {
    // Super admins and directors can access all schools
    if (isSuperAdmin || isDirector || isSeniorDirector) {
      return true;
    }

    // Check if user is assigned to this school
    return metadata.schoolIds.includes(schoolId) ||
           metadata.managedSchools.includes(schoolId);
  }, [metadata.schoolIds, metadata.managedSchools, isSuperAdmin, isDirector, isSeniorDirector]);
  
  // Staff management checking
  const canManageStaff = useCallback((staffId: string) => {
    // Can manage own profile
    if (metadata.staffId === staffId) return true;
    
    // Check permissions
    return hasPermission('staff.edit') || hasPermission('staff.delete');
  }, [metadata.staffId, hasPermission]);
  
  const authenticatedUser = useMemo<AuthenticatedUser>(() => {
    return {
      id: user?.id || null,
      email: user?.primaryEmailAddress?.emailAddress || null,
      fullName: user?.fullName || null,
      firstName: user?.firstName || null,
      lastName: user?.lastName || null,
      imageUrl: user?.imageUrl || null,
      isLoading: !isLoaded,
      isSignedIn: isSignedIn || false,
      metadata,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      canAccessSchool,
      canManageStaff,
    };
  }, [
    user, 
    isLoaded, 
    isSignedIn, 
    metadata, 
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessSchool,
    canManageStaff
  ]);
  
  return authenticatedUser;
}

// Export signOut separately for use in components
export function useSignOut() {
  const { signOut } = useClerk();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return handleSignOut;
} 