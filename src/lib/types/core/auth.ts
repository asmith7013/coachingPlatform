import { z } from 'zod';
import { 
  UserMetadataZodSchema,
  ErrorContextBaseZodSchema,
  AuthenticatedUserBaseZodSchema
} from '@/lib/data-schema/zod-schema/core-types/auth';
import { RolesNYCPSZod, RolesTLZod } from '@enums';

// Keep permission constants as TypeScript (they're static constants)
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ADMIN: 'dashboard.admin',
  
  // Schools
  SCHOOLS_VIEW: 'schools.view',
  SCHOOLS_CREATE: 'schools.create',
  SCHOOLS_EDIT: 'schools.edit',
  SCHOOLS_DELETE: 'schools.delete',
  
  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_EDIT: 'staff.edit',
  STAFF_DELETE: 'staff.delete',
  STAFF_NYCPS_VIEW: 'staff.nycps.view',
  STAFF_TEACHINGLAB_VIEW: 'staff.teachinglab.view',
  
  // Visits
  VISIT_VIEW: 'visit.view',
  VISIT_CREATE: 'visit.create',
  VISIT_EDIT: 'visit.edit',
  VISIT_DELETE: 'visit.delete',
  
  // Coaching
  COACHING_LOG_VIEW: 'coaching.log.view',
  COACHING_LOG_CREATE: 'coaching.log.create',
  COACHING_LOG_EDIT: 'coaching.log.edit',
  
  // Schedules
  SCHEDULE_VIEW: 'schedule.view',
  SCHEDULE_CREATE: 'schedule.create',
  SCHEDULE_EDIT: 'schedule.edit',
  
  // Look Fors
  LOOKFORS_VIEW: 'lookfors.view',
  LOOKFORS_CREATE: 'lookfors.create',
  LOOKFORS_EDIT: 'lookfors.edit',
  
  // Classroom Notes
  NOTES_VIEW: 'notes.view',
  NOTES_CREATE: 'notes.create',
  NOTES_EDIT: 'notes.edit',
  
  // Scoring
  SCORING_VIEW: 'scoring.view',
  SCORING_CREATE: 'scoring.create',
  SCORING_EDIT: 'scoring.edit',
  
  // Integrations
  INTEGRATION_MONDAY: 'integration.monday',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  ANALYTICS_VIEW: 'analytics.view',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Map existing role enums to our auth system (keep as TypeScript)
export const NYCPS_ROLES = RolesNYCPSZod.enum;
export const TL_ROLES = RolesTLZod.enum;

// Combined roles type
export type Role = z.infer<typeof RolesNYCPSZod> | z.infer<typeof RolesTLZod> | 'super_admin';

// Role-permission mappings using existing enums (keep as TypeScript)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // NYCPS Roles
  [NYCPS_ROLES.Teacher]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.NOTES_VIEW,
  ],
  
  [NYCPS_ROLES.Principal]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.SCHOOLS_EDIT,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_NYCPS_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.LOOKFORS_VIEW,
    PERMISSIONS.SCORING_VIEW,
  ],
  
  [NYCPS_ROLES.AP]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_NYCPS_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.LOOKFORS_VIEW,
  ],
  
  [NYCPS_ROLES.Coach]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.VISIT_CREATE,
    PERMISSIONS.VISIT_EDIT,
    PERMISSIONS.COACHING_LOG_VIEW,
    PERMISSIONS.COACHING_LOG_CREATE,
    PERMISSIONS.COACHING_LOG_EDIT,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT,
    PERMISSIONS.LOOKFORS_VIEW,
    PERMISSIONS.SCORING_VIEW,
    PERMISSIONS.SCORING_CREATE,
    PERMISSIONS.SCORING_EDIT,
  ],
  
  [NYCPS_ROLES.Administrator]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_NYCPS_VIEW,
  ],
  
  // Teaching Lab Roles
  [TL_ROLES.Coach]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_TEACHINGLAB_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.VISIT_CREATE,
    PERMISSIONS.VISIT_EDIT,
    PERMISSIONS.COACHING_LOG_VIEW,
    PERMISSIONS.COACHING_LOG_CREATE,
    PERMISSIONS.COACHING_LOG_EDIT,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.INTEGRATION_MONDAY,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT,
    PERMISSIONS.LOOKFORS_VIEW,
    PERMISSIONS.SCORING_VIEW,
    PERMISSIONS.SCORING_CREATE,
    PERMISSIONS.SCORING_EDIT,
  ],
  
  [TL_ROLES.CPM]: [
    PERMISSIONS.DASHBOARD_ADMIN,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.SCHOOLS_EDIT,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_EDIT,
    PERMISSIONS.STAFF_TEACHINGLAB_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.VISIT_CREATE,
    PERMISSIONS.VISIT_EDIT,
    PERMISSIONS.COACHING_LOG_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.INTEGRATION_MONDAY,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.LOOKFORS_VIEW,
    PERMISSIONS.SCORING_VIEW,
  ],
  
  [TL_ROLES.Director]: [
    PERMISSIONS.DASHBOARD_ADMIN,
    PERMISSIONS.SCHOOLS_VIEW,
    PERMISSIONS.SCHOOLS_CREATE,
    PERMISSIONS.SCHOOLS_EDIT,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_EDIT,
    PERMISSIONS.STAFF_TEACHINGLAB_VIEW,
    PERMISSIONS.VISIT_VIEW,
    PERMISSIONS.VISIT_CREATE,
    PERMISSIONS.VISIT_EDIT,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.INTEGRATION_MONDAY,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.LOOKFORS_VIEW,
    PERMISSIONS.SCORING_VIEW,
  ],
  
  [TL_ROLES['Senior Director']]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
  
  'super_admin': [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
};

// Derive types from Zod schemas
export type UserMetadata = z.infer<typeof UserMetadataZodSchema>;
export type ErrorContextBase = z.infer<typeof ErrorContextBaseZodSchema>;

// Enhanced authenticated user interface (extends schema-derived base with methods)
export interface AuthenticatedUser extends z.infer<typeof AuthenticatedUserBaseZodSchema> {
  // Permission helper methods (can't be expressed in Zod)
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  canManageStaff: (staffId: string) => boolean;
} 