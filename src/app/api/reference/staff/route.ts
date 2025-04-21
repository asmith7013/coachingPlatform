import { fetchNYCPSStaff } from "@/app/actions/staff/nycps";

export async function GET() {
  const staffResponse = await fetchNYCPSStaff({ 
    limit: 500,
    sortBy: "staffName",
    sortOrder: "asc"
  });
  
  const options = staffResponse.items.map(staff => ({
    value: staff._id,
    label: staff.staffName
  }));
  
  return Response.json(options);
} 