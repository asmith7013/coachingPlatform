
```markdown
<doc id="authentication">

# Authentication System

<section id="auth-overview">

## Overview

Our application implements a comprehensive authentication system using Clerk for identity management combined with a custom role-based permission system. This integration provides secure access control while maintaining flexibility for our coaching platform's specific requirements.

[RULE] All authentication flows should use Clerk as the identity provider with custom metadata for permissions.

</section>

<section id="auth-architecture">

## Authentication Architecture

The authentication system follows a layered approach:

1. **Identity Layer**: Clerk handles user authentication, sessions, and basic identity
2. **Metadata Layer**: User roles and permissions stored in Clerk's public metadata
3. **Permission Layer**: Custom permission system maps roles to specific actions
4. **Integration Layer**: Links Clerk users to our staff models (NYCPS/TeachingLab)

This architecture ensures:
- Secure authentication without managing passwords
- Flexible permission system that can evolve with requirements
- Clear separation between identity and authorization
- Easy integration with existing staff data models

[RULE] Always use Clerk metadata for storing user permissions and roles.

</section>

<section id="auth-types">

## Type System

Our authentication system uses a comprehensive type structure that integrates with existing schema enums:

```typescript
// Permission constants
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  SCHOOLS_VIEW: 'schools.view',
  STAFF_VIEW: 'staff.view',
  // ... other permissions
} as const;

// Role types use existing enums
export type Role = z.infer<typeof RolesNYCPSZod> | z.infer<typeof RolesTLZod> | 'super_admin';

// User metadata schema
export const UserMetadataSchema = z.object({
  staffId: z.string().optional(),
  staffType: z.enum(['nycps', 'teachinglab']).optional(),
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  // ... other metadata fields
});
```

The type system:
- Uses existing role enums from staff schemas
- Defines granular permissions for all actions
- Maps roles to permissions automatically
- Supports permission overrides for flexibility

[RULE] Use the existing RolesNYCPSZod and RolesTLZod enums for role definitions.

</section>

<section id="auth-hooks">

## Authentication Hooks

### useAuthenticatedUser

The primary authentication hook provides comprehensive user information and permission helpers:

```typescript
const {
  // User identity
  id,
  email,
  fullName,
  
  // Auth state
  isLoading,
  isSignedIn,
  
  // Metadata
  metadata,
  
  // Permissions
  permissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  
  // Role checking
  hasRole,
  hasAnyRole,
  
  // Access helpers
  canAccessSchool,
  canManageStaff
} = useAuthenticatedUser();
```

### useUserStaff

Connects the authenticated user to their staff record:

```typescript
const {
  staff,
  staffType,
  isNYCPSStaff,
  isTeachingLabStaff
} = useUserStaff();
```

This hook:
- Automatically fetches the correct staff record based on staffType
- Handles loading and error states using useSafeSWR
- Provides type-safe access to staff data

[RULE] Always use useUserStaff to connect authenticated users to staff records.

</section>

<section id="auth-components">

## Authentication Components

### AuthGuard

Protects pages and components based on permissions:

```typescript
<AuthGuard 
  requiredPermission={PERMISSIONS.SCHOOLS_VIEW}
  requiredRole="Principal"
  fallbackUrl="/unauthorized"
>
  {/* Protected content */}
</AuthGuard>
```

Features:
- Permission-based access control
- Role-based access control
- School-specific access checks
- Custom loading and fallback components

### PermissionButton

Conditionally renders buttons based on permissions:

```typescript
<PermissionButton
  requiredPermission={PERMISSIONS.SCHOOLS_CREATE}
  hideWhenUnauthorized={true}
  intent="primary"
>
  Create School
</PermissionButton>
```

Options:
- Show disabled state or hide completely
- Support multiple permissions with AND/OR logic
- Custom tooltip for disabled state

[RULE] Use AuthGuard for page-level protection and PermissionButton for UI elements.

</section>

<section id="auth-integration">

## Integration Patterns

### Navigation Integration

The navigation system automatically filters items based on permissions:

```typescript
export const navigationItems: NavigationItem[] = [
  { 
    name: 'Schools', 
    href: '/dashboard/schoolList', 
    icon: BuildingLibraryIcon,
    requiredPermissions: [PERMISSIONS.SCHOOLS_VIEW]
  },
  // ... other items
];
```

The `useAuthorizedNavigation` hook:
- Filters navigation items based on user permissions
- Handles nested navigation structures
- Updates current state dynamically

### Protected Pages

Pages use AuthGuard for protection:

```typescript
export default function SchoolsPage() {
  return (
    <AuthGuard requiredPermission={PERMISSIONS.SCHOOLS_VIEW}>
      <SchoolsContent />
    </AuthGuard>
  );
}
```

### API Integration

Server actions and API routes can access user context:

```typescript
import { currentUser } from '@clerk/nextjs/server';

export async function createSchool(data: unknown) {
  const user = await currentUser();
  
  // Check permissions server-side
  const metadata = user?.publicMetadata as UserMetadata;
  if (!metadata.permissions.includes(PERMISSIONS.SCHOOLS_CREATE)) {
    throw new Error('Unauthorized');
  }
  
  // Proceed with creation
}
```

[RULE] Always validate permissions server-side for sensitive operations.

</section>

<section id="auth-metadata">

## Metadata Management

User metadata is stored in Clerk's public metadata and includes:

- `staffId`: Links to our staff model
- `staffType`: Either 'nycps' or 'teachinglab'
- `roles`: Array of role strings matching our enums
- `permissions`: Direct permission overrides
- `schoolIds`: Schools the user can access
- `managedSchools`: Schools the user manages

Metadata updates should be done through Clerk's API:

```typescript
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    staffId: staff._id,
    staffType: 'nycps',
    roles: ['Coach'],
    schoolIds: [school._id]
  }
});
```

[RULE] Update user metadata through Clerk's API, not directly in the database.

</section>

<section id="auth-permissions">

## Permission System

Permissions follow a hierarchical naming convention:

- `resource.action` format (e.g., `schools.view`, `staff.create`)
- Grouped by resource type
- Mapped from roles automatically
- Support for direct permission grants

Role-permission mappings are defined in `ROLE_PERMISSIONS`:

```typescript
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [NYCPS_ROLES.Principal]: [
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.SCHOOLS_EDIT,
    PERMISSIONS.STAFF_VIEW,
    // ... other permissions
  ],
  // ... other role mappings
};
```

Permission precedence:
1. Direct permissions (highest priority)
2. Role-based permissions
3. Organization permissions
4. Default permissions (lowest priority)

[RULE] Follow the resource.action naming convention for all permissions.

</section>

<section id="auth-troubleshooting">

## Common Patterns and Troubleshooting

### Onboarding Flow

For new users without staff records:

```typescript
function OnboardingPage() {
  const { metadata } = useAuthenticatedUser();
  
  if (!metadata.staffId) {
    return <StaffLinkingForm />;
  }
  
  if (!metadata.onboardingCompleted) {
    return <OnboardingSteps />;
  }
  
  return <Navigate to="/dashboard" />;
}
```

### Permission Debugging

Use browser DevTools to inspect user metadata:

```typescript
// In a component
const user = useAuthenticatedUser();
console.log('User permissions:', user.permissions);
console.log('User roles:', user.metadata.roles);
```

### Common Issues

1. **Missing Permissions**: Check role mappings in ROLE_PERMISSIONS
2. **Staff Connection**: Ensure staffId and staffType are set in metadata
3. **Navigation Not Showing**: Verify requiredPermissions in navigation config
4. **Unauthorized Access**: Check AuthGuard implementation on protected pages

[RULE] Always check browser console for permission debugging information.

</section>

</doc>
```
