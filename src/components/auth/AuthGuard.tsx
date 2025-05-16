import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AuthLoading } from './AuthLoading';
import { Permission } from '@core-types/auth';
import { cn } from '@/lib/ui/utils/formatters';
import { stack } from '@/lib/tokens/spacing';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAnyRole?: boolean;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  requiredSchoolId?: string;
  fallbackUrl?: string;
  loadingComponent?: ReactNode;
}

export function AuthGuard({ 
  children, 
  requiredRole,
  requiredRoles = [],
  requireAnyRole = false,
  requiredPermission,
  requiredPermissions = [],
  requireAllPermissions = true,
  requiredSchoolId,
  fallbackUrl = '/sign-in',
  loadingComponent
}: AuthGuardProps) {
  const { 
    isSignedIn, 
    isLoading, 
    hasRole, 
    hasAnyRole, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    canAccessSchool
  } = useAuthenticatedUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push(fallbackUrl);
      return;
    }
    
    if (!isLoading && isSignedIn) {
      // Check single role
      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/unauthorized');
        return;
      }
      
      // Check multiple roles
      if (requiredRoles.length > 0) {
        const hasRequiredRoles = requireAnyRole 
          ? hasAnyRole(requiredRoles)
          : requiredRoles.every(hasRole);
          
        if (!hasRequiredRoles) {
          router.push('/unauthorized');
          return;
        }
      }
      
      // Check single permission
      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
      
      // Check multiple permissions
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requireAllPermissions
          ? hasAllPermissions(requiredPermissions)
          : hasAnyPermission(requiredPermissions);
          
        if (!hasRequiredPermissions) {
          router.push('/unauthorized');
          return;
        }
      }
      
      // Check school access
      if (requiredSchoolId && !canAccessSchool(requiredSchoolId)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    isSignedIn, 
    isLoading, 
    requiredRole, 
    requiredRoles, 
    requireAnyRole,
    requiredPermission, 
    requiredPermissions, 
    requireAllPermissions,
    requiredSchoolId,
    router, 
    fallbackUrl,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessSchool
  ]);
  
  if (isLoading) {
    return loadingComponent || <AuthLoading />;
  }
  
  if (!isSignedIn) {
    return null;
  }
  
  return <>{children}</>;
} 