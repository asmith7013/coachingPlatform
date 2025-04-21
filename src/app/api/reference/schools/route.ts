import { fetchSchools } from "@/app/actions/schools/schools";

export async function GET() {
  const schoolsResponse = await fetchSchools({ 
    limit: 500,
    sortBy: "schoolName",
    sortOrder: "asc"
  });
  
  const options = schoolsResponse.items.map(school => ({
    value: school._id,
    label: school.schoolName
  }));
  
  return Response.json(options);
} 