import { fetchNYCPSStaffForApi } from "@server/fetchers/staff";
import { createReferenceEndpoint } from "@api-handlers/reference-endpoint";
import type { NYCPSStaff } from "@domain-types/staff";
import type { StaffReference } from "@zod-schema/core/staff";
import { mapStaffToReference } from "@query/client/selectors/reference-selectors";

// Export GET handler directly - matches your school API pattern
export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaffForApi,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Staff API"
});