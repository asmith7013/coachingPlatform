"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { type PipelineStage } from "mongoose";
import { StudentPerformanceModel } from "@mongoose-schema/scm/student/student-performance.model";
import { RoadmapsStudentDataModel } from "@mongoose-schema/scm/student/roadmaps-student-data.model";
import { StudentPerformanceInputZodSchema } from "@zod-schema/scm/student/student-performance";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CREATE STUDENT PERFORMANCE
// =====================================

export async function createStudentPerformance(data: unknown) {
  return withDbConnection(async () => {
    try {
      console.log("📊 Creating student performance record...");

      // Validate input data
      const validatedData = StudentPerformanceInputZodSchema.parse(data);

      // Check if performance record already exists for this student and date
      const existingPerformance = await StudentPerformanceModel.findOne({
        studentId: validatedData.studentId,
        assessmentDate: validatedData.assessmentDate,
      });

      if (existingPerformance) {
        console.log("⚠️ Performance record already exists, updating instead");
        return updateStudentPerformance(
          existingPerformance._id.toString(),
          validatedData,
        );
      }

      // Create new performance record
      const performance = new StudentPerformanceModel({
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedPerformance = await performance.save();
      console.log(
        "✅ Student performance created successfully:",
        savedPerformance._id,
      );

      // Revalidate relevant paths
      revalidatePath("/313/student-performance");
      revalidatePath(`/313/students/${validatedData.studentId}`);

      return {
        success: true,
        data: savedPerformance,
      };
    } catch (error) {
      console.error("💥 Error creating student performance:", error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
        };
      }
      return {
        success: false,
        error: handleServerError(error, "createStudentPerformance"),
      };
    }
  });
}

// =====================================
// GET STUDENT PERFORMANCE
// =====================================

export async function getStudentPerformance(studentId: string, latest = true) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 Fetching performance for student: ${studentId}`);

      const query = StudentPerformanceModel.find({ studentId });

      if (latest) {
        const performance = await query
          .sort({ assessmentDate: -1 })
          .limit(1)
          .exec();

        console.log(`✅ Found ${performance.length} performance record(s)`);
        return {
          success: true,
          data: performance[0] || null,
        };
      } else {
        const performances = await query.sort({ assessmentDate: -1 }).exec();

        console.log(`✅ Found ${performances.length} performance records`);
        return {
          success: true,
          data: performances,
        };
      }
    } catch (error) {
      console.error("💥 Error fetching student performance:", error);
      return {
        success: false,
        error: handleServerError(error, "getStudentPerformance"),
      };
    }
  });
}

// =====================================
// UPDATE STUDENT PERFORMANCE
// =====================================

export async function updateStudentPerformance(
  performanceId: string,
  updateData: unknown,
) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 Updating student performance: ${performanceId}`);

      // Validate update data
      const validatedData = StudentPerformanceInputZodSchema.parse(updateData);

      // Update the performance record
      const updatedPerformance =
        await StudentPerformanceModel.findByIdAndUpdate(
          performanceId,
          {
            ...validatedData,
            updatedAt: new Date().toISOString(),
          },
          { new: true },
        );

      if (!updatedPerformance) {
        return {
          success: false,
          error: "Student performance record not found",
        };
      }

      console.log("✅ Student performance updated successfully");

      // Revalidate relevant paths
      revalidatePath("/313/student-performance");
      revalidatePath(`/313/students/${validatedData.studentId}`);

      return {
        success: true,
        data: updatedPerformance,
      };
    } catch (error) {
      console.error("💥 Error updating student performance:", error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
        };
      }
      return {
        success: false,
        error: handleServerError(error, "updateStudentPerformance"),
      };
    }
  });
}

// =====================================
// UPDATE INDIVIDUAL SKILL PERFORMANCE
// =====================================

export async function updateSkillPerformance(
  studentId: string,
  skillCode: string,
  updates: { status?: string; score?: string },
) {
  return withDbConnection(async () => {
    try {
      console.log(`🎯 Updating skill ${skillCode} for student ${studentId}`);

      // Build update object
      const updateFields: Record<string, string | number | Date> = {
        "skillPerformances.$.lastUpdated": new Date().toISOString(),
      };

      if (updates.status) {
        updateFields["skillPerformances.$.status"] = updates.status;
      }

      if (updates.score !== undefined) {
        updateFields["skillPerformances.$.score"] = updates.score;
      }

      // Update the specific skill within the array
      const performance = await StudentPerformanceModel.findOneAndUpdate(
        {
          studentId,
          "skillPerformances.skillCode": skillCode,
        },
        {
          $set: updateFields,
        },
        { new: true },
      );

      if (!performance) {
        return {
          success: false,
          error: "Student performance record or skill not found",
        };
      }

      console.log("✅ Skill performance updated successfully");

      // Revalidate relevant paths
      revalidatePath("/313/student-performance");
      revalidatePath(`/313/students/${studentId}`);

      return {
        success: true,
        data: performance,
      };
    } catch (error) {
      console.error("💥 Error updating skill performance:", error);
      return {
        success: false,
        error: handleServerError(error, "updateSkillPerformance"),
      };
    }
  });
}

// =====================================
// GET SCHOOL PERFORMANCE SUMMARY
// =====================================

export async function getSchoolPerformanceSummary(schoolId: string) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 Generating performance summary for school: ${schoolId}`);

      const pipeline: PipelineStage[] = [
        { $match: { schoolId } },
        { $unwind: "$skillPerformances" },
        {
          $group: {
            _id: {
              skillGrade: "$skillPerformances.skillGrade",
              status: "$skillPerformances.status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.skillGrade",
            statusCounts: {
              $push: {
                status: "$_id.status",
                count: "$count",
              },
            },
            totalSkills: { $sum: "$count" },
          },
        },
        { $sort: { _id: 1 } },
      ];

      const summary = await StudentPerformanceModel.aggregate(pipeline);

      console.log(`✅ Generated summary for ${summary.length} grade levels`);

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error("💥 Error generating school performance summary:", error);
      return {
        success: false,
        error: handleServerError(error, "getSchoolPerformanceSummary"),
      };
    }
  });
}

// =====================================
// GET SKILL PERFORMANCE ANALYTICS
// =====================================

export async function getSkillPerformanceAnalytics(
  skillCode: string,
  schoolId?: string,
) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 Analyzing performance for skill: ${skillCode}`);

      const matchStage: any = { "skillPerformances.skillCode": skillCode }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (schoolId) {
        matchStage.schoolId = schoolId;
      }

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        { $unwind: "$skillPerformances" },
        { $match: { "skillPerformances.skillCode": skillCode } },
        {
          $group: {
            _id: "$skillPerformances.status",
            count: { $sum: 1 },
            students: {
              $push: {
                studentId: "$studentId",
                studentName: "$studentName",
                score: "$skillPerformances.score",
                lastUpdated: "$skillPerformances.lastUpdated",
              },
            },
          },
        },
      ];

      const analytics = await StudentPerformanceModel.aggregate(pipeline);

      console.log(
        `✅ Generated analytics for ${analytics.length} status groups`,
      );

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      console.error("💥 Error generating skill analytics:", error);
      return {
        success: false,
        error: handleServerError(error, "getSkillPerformanceAnalytics"),
      };
    }
  });
}

// =====================================
// BULK UPDATE STUDENT PERFORMANCES
// =====================================

export async function bulkUpdateStudentPerformances(
  updates: Array<{
    studentId: string;
    skillCode: string;
    status?: string;
    score?: string;
  }>,
) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 Bulk updating ${updates.length} skill performances`);

      const bulkOps = updates.map((update) => {
        const updateFields: Record<string, string | number | Date> = {
          "skillPerformances.$.lastUpdated": new Date().toISOString(),
        };

        if (update.status) {
          updateFields["skillPerformances.$.status"] = update.status;
        }

        if (update.score !== undefined) {
          updateFields["skillPerformances.$.score"] = update.score;
        }

        return {
          updateOne: {
            filter: {
              studentId: update.studentId,
              "skillPerformances.skillCode": update.skillCode,
            },
            update: {
              $set: updateFields,
            },
          },
        };
      });

      const result = await StudentPerformanceModel.bulkWrite(bulkOps);

      console.log(
        `✅ Bulk update completed: ${result.modifiedCount} records updated`,
      );

      // Revalidate relevant paths
      revalidatePath("/313/student-performance");

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("💥 Error in bulk update:", error);
      return {
        success: false,
        error: handleServerError(error, "bulkUpdateStudentPerformances"),
      };
    }
  });
}

// =====================================
// DELETE STUDENT PERFORMANCE
// =====================================

export async function deleteStudentPerformance(performanceId: string) {
  return withDbConnection(async () => {
    try {
      console.log(`🗑️ Deleting student performance: ${performanceId}`);

      const deletedPerformance =
        await StudentPerformanceModel.findByIdAndDelete(performanceId);

      if (!deletedPerformance) {
        return {
          success: false,
          error: "Student performance record not found",
        };
      }

      console.log("✅ Student performance deleted successfully");

      // Revalidate relevant paths
      revalidatePath("/313/student-performance");
      revalidatePath(`/313/students/${deletedPerformance.studentId}`);

      return {
        success: true,
        data: deletedPerformance,
      };
    } catch (error) {
      console.error("💥 Error deleting student performance:", error);
      return {
        success: false,
        error: handleServerError(error, "deleteStudentPerformance"),
      };
    }
  });
}

// =====================================
// GET STUDENTS BY SKILL STATUS
// =====================================

export async function getStudentsBySkillStatus(
  skillCode: string,
  status: "Mastered" | "Attempted But Not Mastered" | "Not Started",
  schoolId?: string,
) {
  return withDbConnection(async () => {
    try {
      console.log(
        `🔍 Finding students with skill ${skillCode} status: ${status}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchStage: any = {
        skillPerformances: {
          $elemMatch: {
            skillCode: skillCode,
            status: status,
          },
        },
      };

      if (schoolId) {
        matchStage.schoolId = schoolId;
      }

      const students = await StudentPerformanceModel.find(matchStage, {
        studentId: 1,
        studentName: 1,
        schoolId: 1,
        assessmentDate: 1,
        "skillPerformances.$": 1,
      }).sort({ studentName: 1 });

      console.log(
        `✅ Found ${students.length} students with status: ${status}`,
      );

      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error("💥 Error finding students by skill status:", error);
      return {
        success: false,
        error: handleServerError(error, "getStudentsBySkillStatus"),
      };
    }
  });
}

// =====================================
// GET ALL STUDENTS FROM ROADMAPS DATA (for dropdown)
// =====================================

export async function getAllRoadmapsStudents() {
  return withDbConnection(async () => {
    try {
      console.log("👥 Fetching all students from roadmaps-student-data...");

      const students = await RoadmapsStudentDataModel.find(
        {},
        {
          studentId: 1,
          studentName: 1,
          schoolId: 1,
          assessmentDate: 1,
        },
      ).sort({
        studentName: 1,
      });

      console.log(`✅ Found ${students.length} roadmaps students`);

      return {
        success: true,
        data: students.map((student) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          schoolId: student.schoolId,
          assessmentDate: student.assessmentDate,
          _id: student._id.toString(),
        })),
      };
    } catch (error) {
      console.error("💥 Error fetching roadmaps students:", error);
      return {
        success: false,
        error: handleServerError(error, "getAllRoadmapsStudents"),
      };
    }
  });
}

// =====================================
// GET STUDENT ROADMAPS PERFORMANCE DATA
// =====================================

export async function getRoadmapsStudentPerformance(studentId: string) {
  return withDbConnection(async () => {
    try {
      console.log(`👤 Fetching roadmaps performance data for: ${studentId}`);

      const studentData = await RoadmapsStudentDataModel.findOne({
        studentId: studentId,
      });

      if (!studentData) {
        return {
          success: false,
          error: "Student performance data not found",
        };
      }

      console.log(
        `✅ Retrieved student with ${studentData.skillPerformances?.length || 0} skill performances`,
      );

      // Convert to plain object to avoid circular references
      const plainStudentData = {
        studentId: studentData.studentId,
        studentName: studentData.studentName,
        schoolId: studentData.schoolId,
        assessmentDate: studentData.assessmentDate,
        skillPerformances: (studentData.skillPerformances || [])
          .slice(0, 500) // Limit to 500 skills to prevent stack overflow
          .map((skill) => ({
            skillCode: skill.skillCode || "",
            unit: skill.unit || "",
            skillName: skill.skillName || "",
            skillGrade: skill.skillGrade || "",
            standards: skill.standards || "",
            status: skill.status || "Not Started",
            score: skill.score || "",
            lastUpdated: skill.lastUpdated || "",
          })),
      };

      return {
        success: true,
        data: plainStudentData,
      };
    } catch (error) {
      console.error("💥 Error fetching roadmaps student performance:", error);
      return {
        success: false,
        error: handleServerError(error, "getRoadmapsStudentPerformance"),
      };
    }
  });
}
