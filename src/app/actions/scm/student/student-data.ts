"use server";

import { StudentDashboardService } from "@/lib/integrations/google-sheets/services/student-dashboard-service";
import { StudentDataZodSchema } from "@/lib/schema/zod-schema/scm/student/student-data";
import { handleServerError } from "@/lib/error/handlers/server";
import { withDbConnection } from "@/lib/server/db/ensure-connection";

/**
 * Server action to fetch student dashboard data
 */
export async function fetchStudentData(studentId: string) {
  return withDbConnection(async () => {
    try {
      console.log(
        `🔍 Server action: Fetching student data for ID: ${studentId}`,
      );

      const result =
        await StudentDashboardService.fetchStudentDataFromSheets(studentId);

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to fetch student data",
        };
      }

      // Additional validation with Zod schema
      const validated = StudentDataZodSchema.parse(result.data);

      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      console.error("Server action error - fetchStudentData:", error);
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}

/**
 * Server action to authenticate student with email
 */
export async function authenticateStudent(email: string, studentId: string) {
  return withDbConnection(async () => {
    try {
      console.log(
        `🔐 Server action: Authenticating student ${studentId} with email: ${email}`,
      );

      if (!email || !email.trim()) {
        return {
          success: false,
          error: "Email address is required",
        };
      }

      if (!studentId || !studentId.trim()) {
        return {
          success: false,
          error: "Student ID is required",
        };
      }

      const result = await StudentDashboardService.validateStudentEmail(
        email.trim(),
        studentId.trim(),
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Server action error - authenticateStudent:", error);
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}
