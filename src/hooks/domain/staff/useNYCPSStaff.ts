import { createCrudHooks } from "@query/client/factories/crud-factory";
import { NYCPSStaffZodSchema, NYCPSStaff } from "@zod-schema/core/staff";
import { ZodSchema } from "zod";
import {
  fetchNYCPSStaff,
  fetchNYCPSStaffById,
  createNYCPSStaff,
  updateNYCPSStaff,
  deleteNYCPSStaff,
} from "@actions/staff/operations";

/**
 * Custom React Query hooks for NYCPSStaff entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const nycpsStaffHooks = createCrudHooks({
  entityType: "nycps-staff",
  schema: NYCPSStaffZodSchema as ZodSchema<NYCPSStaff>,
  serverActions: {
    fetch: fetchNYCPSStaff,
    fetchById: fetchNYCPSStaffById,
    create: createNYCPSStaff,
    update: updateNYCPSStaff,
    delete: deleteNYCPSStaff,
  },
  validSortFields: ["staffName", "email", "createdAt", "updatedAt"],
  relatedEntityTypes: ["schools"],
});

// Export with domain-specific names
const useNYCPSStaffList = nycpsStaffHooks.useList;
const useNYCPSStaffById = nycpsStaffHooks.useDetail;
const useNYCPSStaffMutations = nycpsStaffHooks.useMutations;
const useNYCPSStaff = nycpsStaffHooks.useManager;

// Export individual hooks
export {
  useNYCPSStaffList,
  useNYCPSStaffById,
  useNYCPSStaffMutations,
  useNYCPSStaff,
};

export default useNYCPSStaff;
