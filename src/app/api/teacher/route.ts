import { fetchNYCPSStaffForApi } from "@server/fetchers/staff";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import type { NYCPSStaff } from "@domain-types/staff";
import type { StaffReference } from "@zod-schema/core/staff";
import { mapStaffToReference } from "@query/client/selectors/reference-selectors";
import { NYCPSStaffWithDates } from "@/hooks/domain/useNYCPSStaff";

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaffForApi as unknown as FetchFunction<NYCPSStaffWithDates>,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Teacher API"
}); 