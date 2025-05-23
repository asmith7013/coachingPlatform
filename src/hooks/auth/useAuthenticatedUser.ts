import { useUser, useOrganization, useClerk } from '@clerk/nextjs';
import { useMemo, useCallback } from 'react';
import { 
  AuthenticatedUser, 
  UserMetadata, 
  UserMetadataSchema, 
  ROLE_PERMISSIONS, 
  Permission,
  Role
} from '@core-types/auth';
import { validateSafe } from '@/lib/data-utilities/transformers/core/schema-validators';

export function useAuthenticatedUser(): AuthenticatedUser {
  const { user, isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();
  
  // Parse and validate metadata
  const metadata = useMemo(() => {
    if (!user?.publicMetadata) {
      return UserMetadataSchema.parse({});
    }
    
    // Use existing safe parse utility
    const parsed = validateSafe(UserMetadataSchema, user.publicMetadata);
    return parsed || UserMetadataSchema.parse({});
  }, [user]);
  
  // Calculate effective permissions
  const permissions = useMemo(() => {
    // Get permissions from roles
    const rolePermissions = metadata.roles.flatMap((role: string) => 
      ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []
    );
    
    // Merge organization permissions
    const orgPermissions = organization?.publicMetadata?.permissions as string[] || [];
    
    // Combine all permissions
    const allPermissions = [...new Set([...rolePermissions, ...metadata.permissions, ...orgPermissions])];
    return allPermissions as Permission[];
  }, [metadata, organization]);
  
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
    if (hasRole('super_admin') || hasRole('Director') || hasRole('Senior Director')) {
      return true;
    }
    
    // Check if user is assigned to this school
    return metadata.schoolIds.includes(schoolId) || 
           metadata.managedSchools.includes(schoolId) ||
           metadata.schoolId === schoolId;
  }, [metadata, hasRole]);
  
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