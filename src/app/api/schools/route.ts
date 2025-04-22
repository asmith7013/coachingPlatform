import { fetchSchools } from "@/app/actions/schools/schools";
import { createReferenceEndpoint } from "@/lib/apiHandler";
import type { School } from "@/lib/zod-schema/core/school";

// Define the minimal school reference type for selects
type SchoolReference = {
  _id: string;
  schoolName: string;
};

export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchools,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  mapItem: (school) => ({ 
    _id: school._id, 
    schoolName: school.schoolName 
  })
}); 