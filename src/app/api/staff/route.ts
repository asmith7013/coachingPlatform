import { fetchNYCPSStaff } from "@actions/staff/staff";
import { createReferenceEndpoint } from "@api/handlers/reference-endpoint";
import type { NYCPSStaff } from "@domain-types/staff";
import type { StaffReference } from "@core-types/reference";
import { mapStaffToReference } from "@data-utilities/transformers/reference-mappers";

// Make sure createReferenceEndpoint returns a function, not an object
export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaff,
  mapItem: mapStaffToReference,
  defaultSearchField: "fullName",
  defaultLimit: 20,
  logPrefix: "Staff API"
});