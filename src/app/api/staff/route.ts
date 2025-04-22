import { fetchNYCPSStaff } from "@/app/actions/staff/nycps";
import { createReferenceEndpoint } from "@/lib/apiHandler";
import type { NYCPSStaff } from "@/lib/zod-schema/core/staff";

// Define the minimal staff reference type for selects
type StaffReference = {
  _id: string;
  staffName: string;
};

export const GET = createReferenceEndpoint<NYCPSStaff, StaffReference>({
  fetchFunction: fetchNYCPSStaff,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  mapItem: (staff) => ({ 
    _id: staff._id, 
    staffName: staff.staffName 
  })
}); 