import { fetchNYCPSStaffForApi } from "@/lib/api/fetchers/staff";
import { createReferenceEndpoint } from "@/lib/api/handlers/reference-endpoint";
import type { NYCPSStaff } from "@/lib/types/domain/staff";
import type { StaffReference } from "@/lib/types/core/reference";
import { mapStaffToReference } from "@/lib/data-utilities/transformers/reference-mappers";

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaffForApi,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Teacher API"
}); 