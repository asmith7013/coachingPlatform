import { Button, ButtonProps } from '@/components/core';
import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { Permission } from '@core-types/auth';

interface PermissionButtonProps extends ButtonProps {
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  hideWhenUnauthorized?: boolean;
  disabledTooltip?: string;
}

export function PermissionButton({
  requiredPermission,
  requiredPermissions = [],
  requireAllPermissions = true,
  hideWhenUnauthorized = false,
  disabledTooltip = 'You do not have permission to perform this action',
  disabled,
  children,
  ...props
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthenticatedUser();
  
  // Check permissions
  const hasRequiredPermission = (() => {
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    if (requiredPermissions.length > 0) {
      return requireAllPermissions
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }
    
    return true;
  })();
  
  if (!hasRequiredPermission && hideWhenUnauthorized) {
    return null;
  }
  
  return (
    <Button
      {...props}
      disabled={disabled || !hasRequiredPermission}
      title={!hasRequiredPermission ? disabledTooltip : props.title}
    >
      {children}
    </Button>
  );
} 