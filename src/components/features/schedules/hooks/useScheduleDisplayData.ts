import useBellSchedules from "@/hooks/domain/schedules/useBellSchedules";
import { useNYCPSStaffList } from "@/hooks/domain/staff/useNYCPSStaff";
import { useSchools } from "@/hooks/domain/useSchools";
import useTeacherSchedules from "@/hooks/domain/schedules/useTeacherSchedules";
import { handleClientError } from "@/lib/error";
import { createScheduleComponentsDataErrorContext } from "../utils";

// Simplest approach - follows your quality requirements
export function useScheduleDisplayData(schoolId: string, date: string) {
  const school = useSchools.byId(schoolId);
  const staff = useNYCPSStaffList({
    filters: { schoolIds: [schoolId] },
    limit: 100,
  });
  const bellSchedules = useBellSchedules.list({ filters: { schoolId } });
  const teacherSchedules = useTeacherSchedules.list({ filters: { schoolId } });

  // Enhanced error handling with context
  const rawError =
    school.error ||
    staff.error ||
    bellSchedules.error ||
    teacherSchedules.error;
  const error = rawError
    ? handleClientError(
        rawError,
        createScheduleComponentsDataErrorContext("data-fetch", schoolId, date, {
          school: !!school.error,
          staff: !!staff.error,
          bellSchedules: !!bellSchedules.error,
          teacherSchedules: !!teacherSchedules.error,
        }),
      )
    : null;

  return {
    school: school.data,
    staff: staff.items || [],
    bellSchedule: bellSchedules.items?.[0] || null,
    teacherSchedules: teacherSchedules.items || [],
    isLoading: school.isLoading || staff.isLoading,
    error, // Let ErrorBoundary handle processing/display
  };
}
