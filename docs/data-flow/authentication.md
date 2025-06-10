# Authentication System

## Overview

Our application uses Clerk for identity management with a custom role-based permission system. This provides secure access control while maintaining flexibility for platform requirements.

**[RULE]** All authentication flows use Clerk as the identity provider with custom metadata for permissions.

## Architecture

The system follows a layered approach:

1. **Identity**: Clerk handles authentication and sessions
2. **Metadata**: Roles and permissions in Clerk's public metadata
3. **Permissions**: Custom system maps roles to actions
4. **Integration**: Links Clerk users to staff models
5. **Synchronization**: Webhooks maintain data consistency

**[RULE]** Use Clerk metadata for storing user permissions and roles.

## Core Implementation

### useAuthenticatedUser Hook

```typescript
const { 
  id, 
  email, 
  metadata, 
  permissions, 
  hasPermission, 
  hasRole 
} = useAuthenticatedUser();
```

### Protection Components

```typescript
// Page protection
<AuthGuard requiredPermission={PERMISSIONS.SCHOOLS_VIEW}>
  <PageContent />
</AuthGuard>

// UI elements
<PermissionButton requiredPermission={PERMISSIONS.SCHOOLS_CREATE}>
  Create School
</PermissionButton>
```

### Navigation Integration

```typescript
export const navigationItems: NavigationItem[] = [
  { 
    name: 'Schools',
    href: '/dashboard/schoolList',
    requiredPermissions: [PERMISSIONS.SCHOOLS_VIEW]
  }
];
```

**[RULE]** Use AuthGuard for pages and PermissionButton for UI elements.

## Permission System

Uses `resource.action` format with role mappings:

```typescript
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [NYCPS_ROLES.Principal]: [
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.SCHOOLS_EDIT,
    // ... other permissions
  ]
};

// Permission checking
if (hasPermission('schools.create')) {
  // User can create schools
}

if (hasRole('Coach')) {
  // User has coach role
}
```

**Permission Priority**: Direct permissions > Role permissions > Org permissions > Defaults

**[RULE]** Follow resource.action naming convention for permissions.

## Coach-Specific Hooks

### useCoachData Hook

```typescript
export interface CoachData {
  isCoach: boolean;
  coachId: string | null;
  canCreateVisits: boolean;
  canScheduleVisits: boolean;
  assignedSchools: string[];
  staffType: 'nycps' | 'teachinglab' | null;
  hasStaffConnection: boolean;
}

export function useCoachData(): CoachData {
  const { metadata, hasPermission, hasRole } = useAuthenticatedUser();
  
  return {
    isCoach: hasRole('Coach') || hasPermission('visit.create'),
    coachId: metadata.staffId || null,
    canCreateVisits: hasPermission('visit.create'),
    canScheduleVisits: hasPermission('schedule.create'),
    assignedSchools: metadata.schoolIds || [],
    staffType: metadata.staffType || null,
    hasStaffConnection: !!(metadata.staffId && metadata.staffType)
  };
}
```

### useCoachId Convenience Hook

```typescript
export function useCoachId(): string | null {
  const { metadata } = useAuthenticatedUser();
  return metadata.staffId || null;
}
```

**[RULE]** Use `useCoachData` for coach-specific functionality and `useCoachId` when only the ID is needed.

## Integration Patterns

### Staff Connection Validation

```typescript
function CoachDashboard() {
  const { hasStaffConnection, staffType, coachId } = useCoachData();
  
  if (!hasStaffConnection) {
    return <StaffConnectionRequired />;
  }
  
  return <Dashboard staffType={staffType} coachId={coachId} />;
}
```

### Navigation Filtering

Navigation items are automatically filtered based on user permissions:

```typescript
// Only users with required permissions see these items
const filteredNavigation = navigationItems.filter(item => 
  !item.requiredPermissions || 
  item.requiredPermissions.some(permission => hasPermission(permission))
);
```

## Webhook Integration

Maintains real-time sync between Clerk and our database through three layers:

1. **Validation** (`/lib/api/validation/clerk-webhook`)
2. **Business Logic** (`/lib/api/handlers/clerk-webhook`)  
3. **Route Handler** (`/api/webhook/clerk`)

**Supported Events:**
- `user.created/updated`: Syncs with staff records
- `organization.created/updated`: Updates org settings
- `user.deleted`: Handles deletions

**[RULE]** Webhook handlers always return 200 OK.
**[RULE]** Business logic separated from route handlers in lib/api.

## Development & Troubleshooting

### Common Patterns

```typescript
// Check permissions before rendering
if (!hasPermission('schools.create')) {
  return <PermissionDenied />;
}

// Debug permissions in development
console.log('User permissions:', permissions);
console.log('User roles:', metadata.roles);
```

### Common Issues

1. **Missing Permissions**: Check ROLE_PERMISSIONS mapping
2. **Staff Connection**: Verify staffId in user metadata
3. **Navigation**: Ensure requiredPermissions are configured
4. **Webhooks**: Check signature validation and error logs

**[RULE]** Check browser console for permission debugging information.
```
