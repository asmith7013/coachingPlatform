"use server";

import { ActivityTypeConfigModel } from "@mongoose-schema/313/activity-type-config.model";
import { StudentModel } from "@mongoose-schema/313/student.model";
import { StudentActivityModel } from "@mongoose-schema/313/student-activity.model";
import { RoadmapUnitModel } from "@mongoose-schema/313/roadmap-unit.model";
import { ScopeAndSequenceModel } from "@mongoose-schema/313/scope-and-sequence.model";
import { RoadmapsSkillModel } from "@mongoose-schema/313/roadmap-skill.model";
import {
  ActivityTypeConfigInput,
} from "@zod-schema/313/activity-type-config";
import { StudentActivity } from "@zod-schema/313/student";
import { StudentActivityEventInput } from "@zod-schema/313/student-activity";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// =====================================
// ACTIVITY TYPE ACTIONS
// =====================================

/**
 * Fetch all activity types sorted by order
 */
export async function fetchActivityTypes() {
  return withDbConnection(async () => {
    try {
      const types = await ActivityTypeConfigModel.find({}).sort({ order: 1 });
      // Convert to JSON to ensure proper serialization
      const serializedTypes = types.map(t => JSON.parse(JSON.stringify(t.toJSON())));
      return { success: true, data: serializedTypes };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch activity types") };
    }
  });
}

/**
 * Create a new activity type
 */
export async function createActivityType(config: ActivityTypeConfigInput) {
  return withDbConnection(async () => {
    try {
      // Check for duplicate ID or label
      const existing = await ActivityTypeConfigModel.findOne({
        $or: [{ id: config.id }, { label: config.label }],
      });

      if (existing) {
        return {
          success: false,
          error: "Activity type with this ID or label already exists",
        };
      }

      // Check total count (max 10)
      const count = await ActivityTypeConfigModel.countDocuments();
      if (count >= 10) {
        return {
          success: false,
          error: "Maximum of 10 activity types allowed",
        };
      }

      const newType = await ActivityTypeConfigModel.create(config);
      return { success: true, data: newType.toJSON() };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to create activity type") };
    }
  });
}

/**
 * Update an existing activity type
 */
export async function updateActivityType(
  id: string,
  updates: Partial<ActivityTypeConfigInput>
) {
  return withDbConnection(async () => {
    try {
      const type = await ActivityTypeConfigModel.findOne({ id });

      if (!type) {
        return { success: false, error: "Activity type not found" };
      }

      if (type.isDefault) {
        return {
          success: false,
          error: "Cannot edit default activity types",
        };
      }

      // Check for duplicate label if updating label
      if (updates.label && updates.label !== type.label) {
        const existing = await ActivityTypeConfigModel.findOne({
          label: updates.label,
          id: { $ne: id },
        });

        if (existing) {
          return {
            success: false,
            error: "Activity type with this label already exists",
          };
        }
      }

      Object.assign(type, updates);
      await type.save();

      return { success: true, data: type.toJSON() };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to update activity type") };
    }
  });
}

/**
 * Delete an activity type
 */
export async function deleteActivityType(id: string) {
  return withDbConnection(async () => {
    try {
      const type = await ActivityTypeConfigModel.findOne({ id });

      if (!type) {
        return { success: false, error: "Activity type not found" };
      }

      if (type.isDefault) {
        return {
          success: false,
          error: "Cannot delete default activity types",
        };
      }

      await ActivityTypeConfigModel.deleteOne({ id });
      return { success: true, data: { id } };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to delete activity type") };
    }
  });
}

/**
 * Reorder activity types
 */
export async function reorderActivityTypes(orderedIds: string[]) {
  return withDbConnection(async () => {
    try {
      // Update order field for each type
      const updates = orderedIds.map((id, index) =>
        ActivityTypeConfigModel.updateOne({ id }, { order: index + 1 })
      );

      await Promise.all(updates);

      const types = await ActivityTypeConfigModel.find({}).sort({ order: 1 }).lean();
      return { success: true, data: types };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to reorder activity types") };
    }
  });
}

// =====================================
// STUDENT DATA ACTIONS
// =====================================

/**
 * Fetch students by grade and section
 */
export async function fetchStudentsBySection(section: string, grade: string = "8") {
  return withDbConnection(async () => {
    try {
      const students = await StudentModel.find({
        gradeLevel: grade,
        section,
        active: true,
      })
        .sort({ lastName: 1, firstName: 1 });

      // Convert to JSON to ensure proper serialization
      const serializedStudents = students.map(s => JSON.parse(JSON.stringify(s.toJSON())));
      return { success: true, data: serializedStudents };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch students") };
    }
  });
}

/**
 * Fetch units by grade
 */
export async function fetchUnitsByGrade(grade: string = "8") {
  return withDbConnection(async () => {
    try {
      const units = await RoadmapUnitModel.find({
        grade: { $regex: `${grade}th Grade`, $options: "i" },
      })
        .sort({ unitNumber: 1 });

      // Convert to JSON to ensure proper serialization
      const serializedUnits = units.map(u => JSON.parse(JSON.stringify(u.toJSON())));
      return { success: true, data: serializedUnits };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch units") };
    }
  });
}

/**
 * Fetch lessons for a unit from scope-and-sequence
 */
export async function fetchLessonsForUnit(grade: string, unitNumber: number) {
  return withDbConnection(async () => {
    try {
      const lessons = await ScopeAndSequenceModel.find({
        grade,
        unitNumber,
      })
        .sort({ lessonNumber: 1 });

      // Convert to JSON to ensure proper serialization
      const serializedLessons = lessons.map(l => JSON.parse(JSON.stringify(l.toJSON())));
      return { success: true, data: serializedLessons };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch lessons") };
    }
  });
}

/**
 * Fetch unique sections for a unit (for inquiry dropdown generation)
 */
export async function fetchSectionsForUnit(grade: string, unitNumber: number) {
  return withDbConnection(async () => {
    try {
      const sections: string[] = await ScopeAndSequenceModel.distinct("section", {
        grade,
        unitNumber,
      }) as unknown as string[];

      // Sort alphabetically
      sections.sort();

      return { success: true, data: sections };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch sections") };
    }
  });
}

/**
 * Fetch skill details for given skill IDs
 */
export async function fetchSkillDetails(skillIds: string[]) {
  return withDbConnection(async () => {
    try {
      const skills = await RoadmapsSkillModel.find({
        skillNumber: { $in: skillIds },
      })
        .sort({ skillNumber: 1 });

      // Convert to JSON to ensure proper serialization
      const serializedSkills = skills.map((s) => JSON.parse(JSON.stringify(s.toJSON())));
      return { success: true, data: serializedSkills };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch skill details") };
    }
  });
}

/**
 * Fetch unit's additional support skills
 */
export async function fetchUnitSkills(unitId: string) {
  return withDbConnection(async () => {
    try {
      const unit = await RoadmapUnitModel.findById(unitId);

      if (!unit) {
        return { success: false, error: "Unit not found" };
      }

      // Get skill details for additionalSupportSkills
      const unitData = unit.toJSON();
      const skillIds = unitData.additionalSupportSkills || [];
      if (skillIds.length === 0) {
        return { success: true, data: [] };
      }

      const skills = await RoadmapsSkillModel.find({
        skillNumber: { $in: skillIds },
      })
        .sort({ skillNumber: 1 });

      // Convert to JSON to ensure proper serialization
      const serializedSkills = skills.map((s) => JSON.parse(JSON.stringify(s.toJSON())));
      return { success: true, data: serializedSkills };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch unit skills") };
    }
  });
}

// =====================================
// ACTIVITY SUBMISSION
// =====================================

/**
 * Submit activities for multiple students
 */
export interface StudentActivitySubmission {
  studentId: string;
  activities: Omit<StudentActivity, "createdAt">[];
}

export async function submitActivities(
  submissions: StudentActivitySubmission[],
  teacherName?: string
) {
  return withDbConnection(async () => {
    console.log("🔵 [submitActivities] Starting submission...");
    console.log("🔵 [submitActivities] Total submissions:", submissions.length);
    console.log("🔵 [submitActivities] Teacher:", teacherName);

    try {
      const results = [];
      const errors = [];
      const eventsToInsert: StudentActivityEventInput[] = [];

      for (let i = 0; i < submissions.length; i++) {
        const submission = submissions[i];
        console.log(`\n🔵 [submitActivities] Processing submission ${i + 1}/${submissions.length}`);
        console.log("🔵 [submitActivities] Student ID:", submission.studentId);
        console.log("🔵 [submitActivities] Activities count:", submission.activities.length);

        try {
          // Fetch student info for enrichment
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const student: any = await StudentModel.findById(submission.studentId).lean();

          if (!student) {
            console.error("❌ [submitActivities] Student not found:", submission.studentId);
            errors.push({
              studentId: submission.studentId,
              error: "Student not found in database",
            });
            continue;
          }

          console.log("✅ [submitActivities] Student found:", student.firstName, student.lastName);

          // Convert each activity to a standalone event
          for (const activity of submission.activities) {
            const event: StudentActivityEventInput = {
              studentId: submission.studentId,
              studentName: `${student.lastName}, ${student.firstName}`,
              section: student.section,
              gradeLevel: student.gradeLevel || "8",
              date: activity.date,
              activityType: activity.activityType,
              activityLabel: activity.activityLabel,
              unitId: activity.unitId,
              lessonId: activity.lessonId,
              skillId: activity.skillId,
              inquiryQuestion: activity.inquiryQuestion,
              customDetail: activity.customDetail,
              loggedBy: teacherName || "Unknown",
              loggedAt: new Date().toISOString(),
              ownerIds: [],
            };

            eventsToInsert.push(event);
          }

          results.push({
            studentId: submission.studentId,
            success: true,
            count: submission.activities.length,
          });

        } catch (err) {
          console.error("❌ [submitActivities] Error for student:", submission.studentId);
          console.error("❌ [submitActivities] Error details:", err);
          errors.push({
            studentId: submission.studentId,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      // Batch insert all events
      if (eventsToInsert.length > 0) {
        console.log(`\n🔵 [submitActivities] Inserting ${eventsToInsert.length} events...`);
        console.log("🔵 [submitActivities] Sample event:", JSON.stringify(eventsToInsert[0], null, 2));

        const insertResult = await StudentActivityModel.insertMany(eventsToInsert);
        console.log("✅ [submitActivities] Inserted events:", insertResult.length);
      }

      console.log("\n🔵 [submitActivities] Final results:");
      console.log("🔵 [submitActivities] Successful:", results.length);
      console.log("🔵 [submitActivities] Failed:", errors.length);

      if (errors.length > 0) {
        console.log("🔵 [submitActivities] Errors:", JSON.stringify(errors, null, 2));
      }

      return {
        success: errors.length === 0,
        data: {
          successful: results.length,
          failed: errors.length,
          results,
          errors,
        },
      };
    } catch (error) {
      console.error("❌ [submitActivities] Fatal error:", error);
      return { success: false, error: handleServerError(error, "Failed to submit activities") };
    }
  });
}
