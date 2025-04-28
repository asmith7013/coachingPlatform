// src/app/api/schools/route.ts
import { fetchSchools } from "@actions/schools/schools";
import { createReferenceEndpoint } from "@api/handlers/reference-endpoint";
import { createTypeSafeFetch } from "@data-utilities/transformers/type-helper";
import type { School } from "@zod-schema/core/school";
import type { SchoolReference } from "@core-types/reference";
import { mapSchoolToReference } from "@data-utilities/transformers/reference-mappers";

// Create a type-safe wrapper for fetchSchools
const typeSafeSchoolFetch = createTypeSafeFetch<School>(fetchSchools);

export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: typeSafeSchoolFetch,
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});