import { fetchNYCPSStaffForApi } from "@api-fetchers/staff";
import { createReferenceEndpoint } from "@api-handlers/reference-endpoint";
import type { NYCPSStaff } from "@domain-types/staff";
import type { StaffReference } from "@core-types/reference";
import { mapStaffToReference } from "@data-utilities/transformers/reference-mappers";

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaffForApi,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Teacher API"
}); 