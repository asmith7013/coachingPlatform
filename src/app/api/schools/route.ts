import { fetchSchools } from "@actions/schools/schools";
import { createReferenceEndpoint } from "@api/handlers/reference-endpoint";
import type { School } from "@zod-schema/core/school";
import type { SchoolReference } from "@core-types/reference";
import { mapSchoolToReference } from "@data-utilities/transformers/reference-mappers";

export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchools,
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
}); 