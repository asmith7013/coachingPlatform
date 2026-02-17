import useBellSchedules from "@/hooks/domain/schedules/useBellSchedules";
import { useNYCPSStaffList } from "@/hooks/domain/staff/useNYCPSStaff";
import { useSchools } from "@/hooks/domain/useSchools";
import useTeacherSchedules from "@/hooks/domain/schedules/useTeacherSchedules";

// Simplest approach - follows your quality requirements
export function useScheduleDisplayData(schoolId: string, _date: string) {
  const school = useSchools.byId(schoolId);
  const staff = useNYCPSStaffList({
    filters: { schoolIds: [schoolId] },
    limit: 100,
  });
  const bellSchedules = useBellSchedules.list({ filters: { schoolId } });
  const teacherSchedules = useTeacherSchedules.list({ filters: { schoolId } });

  // Simple error handling - first error wins
  const error =
    school.error ||
    staff.error ||
    bellSchedules.error ||
    teacherSchedules.error;

  return {
    school: school.data,
    staff: staff.items || [],
    bellSchedule: bellSchedules.items?.[0] || null,
    teacherSchedules: teacherSchedules.items || [],
    isLoading: school.isLoading || staff.isLoading,
    error, // Let ErrorBoundary handle processing/display
  };
}
