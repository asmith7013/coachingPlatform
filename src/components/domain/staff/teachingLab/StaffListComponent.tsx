import { TeachingLabStaff } from "@zod-schema/core/staff";
import { StaffListItem } from "@/components/domain/staff/teachingLab/StaffListItem";
import { Spinner } from "@/components/core/feedback/Spinner";

interface StaffListComponentProps {
  staffMembers: TeachingLabStaff[];
  isLoading: boolean;
}

export function StaffListComponent({ staffMembers, isLoading }: StaffListComponentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!staffMembers.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-600 mb-2">No staff found</h3>
        <p className="text-gray-500">Try adjusting your search or add a new staff member.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staffMembers.map((staff) => (
        <StaffListItem 
          key={staff._id} 
          staff={staff} 
          staffType="tl"
          className="h-full"
        />
      ))}
    </div>
  );
} 