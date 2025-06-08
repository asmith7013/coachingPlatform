import { createCrudHooks } from '@query/client/factories/crud-factory';
import { 
  TeachingLabStaff, 
  TeachingLabStaffZodSchema,
} from '@zod-schema/core/staff';
import { ZodSchema } from 'zod';
import { 
  fetchTeachingLabStaff, 
  fetchTeachingLabStaffById, 
  createTeachingLabStaff, 
  updateTeachingLabStaff, 
  deleteTeachingLabStaff 
} from '@actions/staff/operations';

/**
 * Simplified TeachingLabStaff entity hooks using direct CRUD factory
 * 
 * These hooks handle fetching, creating, updating, and deleting Teaching Lab staff members
 * without complex date transformations - using direct server actions for simplicity
 */
const teachingLabStaffHooks = createCrudHooks({
  entityType: 'teaching-lab-staff',
  schema: TeachingLabStaffZodSchema as ZodSchema<TeachingLabStaff>,
  serverActions: {
    fetch: fetchTeachingLabStaff,
    fetchById: fetchTeachingLabStaffById,
    create: createTeachingLabStaff,
    update: updateTeachingLabStaff,
    delete: deleteTeachingLabStaff
  },
  validSortFields: ['staffName', 'email', 'adminLevel', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools']
});

// Export with domain-specific names
const useTeachingLabStaffList = teachingLabStaffHooks.useList;
const useTeachingLabStaffById = teachingLabStaffHooks.useDetail;
const useTeachingLabStaffMutations = teachingLabStaffHooks.useMutations;
const useTeachingLabStaff = teachingLabStaffHooks.useManager;

// Export individual hooks
export { useTeachingLabStaffList, useTeachingLabStaffById, useTeachingLabStaffMutations, useTeachingLabStaff };

// Default export
export default useTeachingLabStaff; 