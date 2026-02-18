"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StaffModel } from "@mongoose-schema/core/staff.model";

export interface MockStaffData {
  staffId: string;
  staffName: string;
  email: string;
  roles: string[];
  schoolIds: string[];
}

const MOCK_USERS = {
  coach: { email: "alex.smith@teachinglab.org" },
  teacher: { email: "ccardona@schools.nyc.gov" },
} as const;

export async function getMockStaffData(): Promise<{
  success: boolean;
  data?: { coach: MockStaffData | null; teacher: MockStaffData | null };
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const coachDoc = (await StaffModel.findOne({
        email: MOCK_USERS.coach.email,
      })
        .select("staffName email roles schoolIds")
        .lean()) as Record<string, unknown> | null;

      const teacherDoc = (await StaffModel.findOne({
        email: MOCK_USERS.teacher.email,
      })
        .select("staffName email roles schoolIds")
        .lean()) as Record<string, unknown> | null;

      const coach: MockStaffData | null = coachDoc
        ? {
            staffId: String(coachDoc._id),
            staffName: coachDoc.staffName as string,
            email: MOCK_USERS.coach.email,
            roles: (coachDoc.roles as string[]) || ["Coach"],
            schoolIds: (coachDoc.schoolIds as string[]) || [],
          }
        : null;

      const teacher: MockStaffData | null = teacherDoc
        ? {
            staffId: String(teacherDoc._id),
            staffName: teacherDoc.staffName as string,
            email: MOCK_USERS.teacher.email,
            roles: (teacherDoc.roles as string[]) || ["Teacher"],
            schoolIds: (teacherDoc.schoolIds as string[]) || [],
          }
        : null;

      return { success: true, data: { coach, teacher } };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch mock staff data",
      };
    }
  });
}
