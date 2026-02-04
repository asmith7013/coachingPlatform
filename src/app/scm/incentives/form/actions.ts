"use server";

import { ActivityTypeConfigModel } from "@mongoose-schema/scm/incentives/activity-type-config.model";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";
import { RoadmapUnitModel } from "@mongoose-schema/scm/roadmaps/roadmap-unit.model";
import { ScopeAndSequenceModel } from "@mongoose-schema/scm/scope-and-sequence/scope-and-sequence.model";
import { RoadmapsSkillModel } from "@mongoose-schema/scm/roadmaps/roadmap-skill.model";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import {
  ActivityTypeConfigInput,
} from "@zod-schema/scm/incentives/activity-type-config";
import { StudentActivity } from "@zod-schema/scm/student/student";
import { StudentActivityEventInput, StudentActivityInputZodSchema } from "@zod-schema/scm/student/student-activity";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { IncentiveEmailService } from "@/app/actions/scm/incentives/incentive-email";

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
      // Convert to JSON and map id to typeId for backward compatibility
      const serializedTypes = types.map(t => {
        const json = JSON.parse(JSON.stringify(t.toJSON()));
        // Map id to typeId if typeId doesn't exist
        if (!json.typeId && json.id) {
          json.typeId = json.id;
        }
        return json;
      });
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
      // Check for duplicate label
      const existing = await ActivityTypeConfigModel.findOne({
        label: config.label
      });

      if (existing) {
        return {
          success: false,
          error: "Activity type with this label already exists",
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
      const type = await ActivityTypeConfigModel.findById(id);

      if (!type) {
        return { success: false, error: "Activity type not found" };
      }

      // Check for duplicate label if updating label
      if (updates.label && updates.label !== type.label) {
        const existing = await ActivityTypeConfigModel.findOne({
          label: updates.label,
          _id: { $ne: id },
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
      const type = await ActivityTypeConfigModel.findById(id);

      if (!type) {
        return { success: false, error: "Activity type not found" };
      }

      if (type.isDefault) {
        return {
          success: false,
          error: "Cannot delete default activity types",
        };
      }

      await ActivityTypeConfigModel.deleteOne({ _id: id });
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
      // Update order field for each type by _id
      const updates = orderedIds.map((id, index) =>
        ActivityTypeConfigModel.updateOne({ _id: id }, { order: index + 1 })
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
        .sort({ firstName: 1, lastName: 1 });

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
 * Fetch section config to get scopeSequenceTag
 */
export async function fetchSectionConfig(classSection: string) {
  return withDbConnection(async () => {
    try {
      const config = await SectionConfigModel.findOne({ classSection });
      if (!config) {
        return { success: false, error: "Section config not found" };
      }
      // Serialize to JSON to get plain object with correct types
      const configJson = JSON.parse(JSON.stringify(config.toJSON())) as {
        scopeSequenceTag?: string;
        gradeLevel: string;
      };
      return {
        success: true,
        data: {
          scopeSequenceTag: configJson.scopeSequenceTag || "Grade 8",
          gradeLevel: configJson.gradeLevel
        }
      };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch section config") };
    }
  });
}

/**
 * Fetch lessons for a unit from scope-and-sequence
 * Optionally filter by scopeSequenceTag
 */
export async function fetchLessonsForUnit(grade: string, unitNumber: number, scopeSequenceTag?: string) {
  return withDbConnection(async () => {
    try {
      const query: Record<string, unknown> = {
        grade,
        unitNumber,
      };

      // Filter by scopeSequenceTag if provided
      if (scopeSequenceTag) {
        query.scopeSequenceTag = scopeSequenceTag;
      }

      const lessons = await ScopeAndSequenceModel.find(query)
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
export interface CategorizedSkill {
  _id: string;
  skillNumber: string;
  title: string;
  category: 'target' | 'essential' | 'helpful';
}

export async function fetchUnitSkills(unitId: string) {
  return withDbConnection(async () => {
    try {
      const unit = await RoadmapUnitModel.findById(unitId);

      if (!unit) {
        return { success: false, error: "Unit not found" };
      }

      const unitData = unit.toJSON();
      const categorizedSkills: CategorizedSkill[] = [];
      const seenSkillNumbers = new Set<string>();

      // 1. Get target skills
      const targetSkillNumbers = unitData.targetSkills || [];
      if (targetSkillNumbers.length > 0) {
        const targetSkills = await RoadmapsSkillModel.find({
          skillNumber: { $in: targetSkillNumbers },
        });

        for (const skill of targetSkills) {
          const skillData = skill.toJSON();
          if (!seenSkillNumbers.has(skillData.skillNumber)) {
            seenSkillNumbers.add(skillData.skillNumber);
            categorizedSkills.push({
              _id: skillData._id,
              skillNumber: skillData.skillNumber,
              title: skillData.title,
              category: 'target',
            });
          }

          // 2. Add essential skills from each target skill
          for (const essential of skillData.essentialSkills || []) {
            if (!seenSkillNumbers.has(essential.skillNumber)) {
              seenSkillNumbers.add(essential.skillNumber);
              categorizedSkills.push({
                _id: essential._id || essential.skillNumber,
                skillNumber: essential.skillNumber,
                title: essential.title,
                category: 'essential',
              });
            }
          }

          // 3. Add helpful skills from each target skill
          for (const helpful of skillData.helpfulSkills || []) {
            if (!seenSkillNumbers.has(helpful.skillNumber)) {
              seenSkillNumbers.add(helpful.skillNumber);
              categorizedSkills.push({
                _id: helpful._id || helpful.skillNumber,
                skillNumber: helpful.skillNumber,
                title: helpful.title,
                category: 'helpful',
              });
            }
          }
        }
      }

      // Sort within each category by skill number
      categorizedSkills.sort((a, b) => {
        const categoryOrder = { target: 0, essential: 1, helpful: 2 };
        if (categoryOrder[a.category] !== categoryOrder[b.category]) {
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return parseInt(a.skillNumber) - parseInt(b.skillNumber);
      });

      return { success: true, data: categorizedSkills };
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
            // Normalize date to YYYY-MM-DD format
            let normalizedDate = activity.date;
            if (activity.date && activity.date.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
              const parts = activity.date.split('/');
              const month = parts[0].padStart(2, '0');
              const day = parts[1].padStart(2, '0');
              let year = parts[2];
              // Convert 2-digit year to 4-digit year
              if (year.length === 2) {
                year = `20${year}`;
              }
              normalizedDate = `${year}-${month}-${day}`;
            }

            const eventData = {
              studentId: submission.studentId,
              studentName: `${student.lastName}, ${student.firstName}`,
              section: student.section,
              gradeLevel: student.gradeLevel || "8",
              date: normalizedDate,
              activityType: activity.activityType,
              activityLabel: activity.activityLabel,
              unitId: activity.unitId,
              lessonId: activity.lessonId,
              skillId: activity.skillId,
              smallGroupType: activity.smallGroupType,
              inquiryQuestion: activity.inquiryQuestion,
              customDetail: activity.customDetail,
              loggedBy: teacherName || "Unknown",
              loggedAt: new Date().toISOString(),
              ownerIds: [],
            };

            // Validate with Zod schema
            const validationResult = StudentActivityInputZodSchema.safeParse(eventData);

            if (!validationResult.success) {
              console.error("❌ [submitActivities] Validation error:", validationResult.error.format());
              const firstError = validationResult.error.issues[0];
              errors.push({
                studentId: submission.studentId,
                error: `Validation failed: ${firstError.path.join('.')}: ${firstError.message}`,
              });
              continue;
            }

            eventsToInsert.push(validationResult.data);
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

      // Batch insert all events into standalone collection
      if (eventsToInsert.length > 0) {
        console.log(`\n🔵 [submitActivities] Inserting ${eventsToInsert.length} events...`);
        console.log("🔵 [submitActivities] Sample event:", JSON.stringify(eventsToInsert[0], null, 2));

        const insertResult = await StudentActivityModel.insertMany(eventsToInsert);
        console.log("✅ [submitActivities] Inserted events:", insertResult.length);

        // Also update each student's classActivities array for denormalized access
        const eventsByStudent = new Map<string, StudentActivity[]>();
        for (const event of eventsToInsert) {
          const studentId = event.studentId as string;
          if (!eventsByStudent.has(studentId)) {
            eventsByStudent.set(studentId, []);
          }
          // Convert to StudentActivity format (embedded in student doc)
          eventsByStudent.get(studentId)!.push({
            date: event.date as string,
            activityType: event.activityType as string,
            activityLabel: event.activityLabel as string,
            unitId: event.unitId as string | undefined,
            lessonId: event.lessonId as string | undefined,
            skillId: event.skillId as string | undefined,
            smallGroupType: event.smallGroupType as "mastery" | "prerequisite" | undefined,
            inquiryQuestion: event.inquiryQuestion as string | undefined,
            customDetail: event.customDetail as string | undefined,
            loggedBy: event.loggedBy as string | undefined,
            createdAt: event.loggedAt as string | undefined,
          });
        }

        // Update each student's classActivities array
        for (const [studentId, activities] of eventsByStudent) {
          await StudentModel.updateOne(
            { _id: studentId },
            { $push: { classActivities: { $each: activities } } }
          );
        }
        console.log("✅ [submitActivities] Updated classActivities for", eventsByStudent.size, "students");
      }

      console.log("\n🔵 [submitActivities] Final results:");
      console.log("🔵 [submitActivities] Successful:", results.length);
      console.log("🔵 [submitActivities] Failed:", errors.length);

      if (errors.length > 0) {
        console.log("🔵 [submitActivities] Errors:", JSON.stringify(errors, null, 2));
      }

      // Send email notification on successful submission
      if (results.length > 0 && eventsToInsert.length > 0) {
        try {
          console.log("📧 [submitActivities] Sending email notification...");

          // Get unit info for email
          let unitTitle: string | undefined;
          const firstEvent = eventsToInsert[0];
          if (firstEvent.unitId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const unit: any = await RoadmapUnitModel.findById(firstEvent.unitId).lean();
            unitTitle = unit?.unitTitle;
          }

          // Calculate activity breakdown
          const activityCounts = new Map<string, number>();
          eventsToInsert.forEach(event => {
            const label = event.activityLabel as string;
            activityCounts.set(label, (activityCounts.get(label) || 0) + 1);
          });

          const activityBreakdown = Array.from(activityCounts.entries()).map(([label, count]) => ({
            label,
            count
          }));

          const emailService = new IncentiveEmailService();
          await emailService.sendSubmissionNotification({
            teacherName: teacherName || 'Unknown',
            section: eventsToInsert[0].section as string,
            unitTitle,
            date: eventsToInsert[0].date as string,
            studentCount: results.length,
            activityBreakdown
          });
        } catch (emailError) {
          // Log email error but don't fail the submission
          console.error("❌ [submitActivities] Email notification failed:", emailError);
        }
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

// =====================================
// NEXT LESSON SUGGESTION
// =====================================

/**
 * Section ordering for scope and sequence
 * Ramp Ups come first, then A-F, then Unit Assessment (excluded from suggestions)
 */
const SECTION_ORDER: Record<string, number> = {
  'Ramp Ups': 0,
  'A': 1,
  'B': 2,
  'C': 3,
  'D': 4,
  'E': 5,
  'F': 6,
  'Unit Assessment': 99, // Excluded from suggestions
};

function getSectionOrder(section: string | undefined): number {
  if (!section) return 50;
  return SECTION_ORDER[section] ?? 50;
}

/**
 * Sort lessons in the correct order: Ramp Ups → A → B → C → D → Unit Assessment
 */
function sortLessons<T extends { section?: string; lessonNumber: number; unitLessonId: string }>(lessons: T[]): T[] {
  return [...lessons].sort((a, b) => {
    const sectionA = getSectionOrder(a.section);
    const sectionB = getSectionOrder(b.section);
    if (sectionA !== sectionB) return sectionA - sectionB;

    // For ramp-ups, sort by the RU number in unitLessonId (e.g., "3.RU1" -> 1)
    if (a.section === 'Ramp Ups' && b.section === 'Ramp Ups') {
      const numA = parseInt(a.unitLessonId.replace(/.*RU/, '')) || 0;
      const numB = parseInt(b.unitLessonId.replace(/.*RU/, '')) || 0;
      return numA - numB;
    }

    return a.lessonNumber - b.lessonNumber;
  });
}

interface SuggestedLesson {
  lessonId: string;
  unitLessonId: string;
  lessonName: string;
  section?: string;
}

interface GetNextLessonResult {
  success: boolean;
  data?: SuggestedLesson | null;
  message?: string;
  error?: string;
}

/**
 * Get the suggested next lesson for a student based on their most recent mastery check
 *
 * Logic:
 * 1. Find mastery check completed on "yesterday" (formDate - 1 day)
 * 2. If none from yesterday, find most recent completed mastery check
 * 3. Look up that lesson in scope-and-sequence
 * 4. Find the next lesson in the unit (respecting section ordering)
 * 5. Return null if: no mastery check found, or current lesson is last in unit
 */
export async function getNextLessonForStudent(
  studentId: string,
  formDate: string, // YYYY-MM-DD format
  unitNumber: number,
  scopeSequenceTag: string
): Promise<GetNextLessonResult> {
  return withDbConnection(async () => {
    try {
      // Calculate yesterday based on form date
      const formDateObj = new Date(formDate + 'T12:00:00');
      const yesterdayObj = new Date(formDateObj);
      yesterdayObj.setDate(yesterdayObj.getDate() - 1);
      const yesterdayStart = new Date(yesterdayObj);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterdayObj);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Fetch student with podsieProgress
      interface LeanStudent {
        _id: { toString(): string };
        podsieProgress?: Array<{
          scopeAndSequenceId: string;
          activityType?: string;
          isFullyComplete?: boolean;
          fullyCompletedDate?: string;
          unitCode?: string;
          rampUpId?: string;
        }>;
      }

      const student = await StudentModel.findById(studentId)
        .select('podsieProgress')
        .lean() as unknown as LeanStudent | null;

      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      const podsieProgress = student.podsieProgress || [];

      // Filter to completed mastery checks
      const completedMasteryChecks = podsieProgress.filter(
        p => p.activityType === 'mastery-check' && p.isFullyComplete && p.fullyCompletedDate
      );

      if (completedMasteryChecks.length === 0) {
        return { success: true, data: null, message: 'No completed mastery checks found' };
      }

      // Try to find completions from yesterday first
      const yesterdayCompletions = completedMasteryChecks.filter(p => {
        if (!p.fullyCompletedDate) return false;
        const completedDate = new Date(p.fullyCompletedDate);
        return completedDate >= yesterdayStart && completedDate <= yesterdayEnd;
      });

      let targetMasteryCheck;

      if (yesterdayCompletions.length > 0) {
        // Sort by completion time descending to get the LATEST one from yesterday
        yesterdayCompletions.sort((a, b) => {
          const dateA = new Date(a.fullyCompletedDate || 0);
          const dateB = new Date(b.fullyCompletedDate || 0);
          return dateB.getTime() - dateA.getTime();
        });
        targetMasteryCheck = yesterdayCompletions[0];
      } else {
        // If none from yesterday, find most recent overall
        completedMasteryChecks.sort((a, b) => {
          const dateA = new Date(a.fullyCompletedDate || 0);
          const dateB = new Date(b.fullyCompletedDate || 0);
          return dateB.getTime() - dateA.getTime();
        });
        targetMasteryCheck = completedMasteryChecks[0];
      }

      if (!targetMasteryCheck?.scopeAndSequenceId) {
        return { success: true, data: null, message: 'No valid mastery check found' };
      }

      // Look up the mastered lesson
      interface LeanLesson {
        _id: { toString(): string };
        unitNumber: number;
        unitLessonId: string;
        lessonName: string;
        lessonNumber: number;
        section?: string;
        lessonType?: string;
        scopeSequenceTag?: string;
      }

      const masteredLesson = await ScopeAndSequenceModel.findById(targetMasteryCheck.scopeAndSequenceId)
        .lean() as unknown as LeanLesson | null;

      if (!masteredLesson) {
        return { success: true, data: null, message: 'Could not find mastered lesson in scope and sequence' };
      }

      // Check if the mastered lesson is in the same unit as the form's selected unit
      if (masteredLesson.unitNumber !== unitNumber) {
        return {
          success: true,
          data: null,
          message: `Mastered lesson (Unit ${masteredLesson.unitNumber}) is not in selected unit (${unitNumber})`
        };
      }

      // Get all lessons in the same unit
      const allLessonsInUnit = await ScopeAndSequenceModel.find({
        scopeSequenceTag,
        unitNumber,
        lessonType: { $ne: 'assessment' }, // Exclude unit assessments
      }).lean() as unknown as LeanLesson[];

      if (allLessonsInUnit.length === 0) {
        return { success: true, data: null, message: 'No lessons found in unit' };
      }

      // Sort lessons in correct order
      const sortedLessons = sortLessons(allLessonsInUnit);

      // Find the index of the mastered lesson
      const masteredIndex = sortedLessons.findIndex(
        l => l._id.toString() === masteredLesson._id.toString()
      );

      if (masteredIndex === -1) {
        return { success: true, data: null, message: 'Mastered lesson not found in sorted list' };
      }

      // Check if it's the last lesson in the unit
      if (masteredIndex === sortedLessons.length - 1) {
        return { success: true, data: null, message: 'Mastered lesson is the last in the unit' };
      }

      // Get the next lesson
      const nextLesson = sortedLessons[masteredIndex + 1];

      return {
        success: true,
        data: {
          lessonId: nextLesson._id.toString(),
          unitLessonId: nextLesson.unitLessonId,
          lessonName: nextLesson.lessonName,
          section: nextLesson.section,
        },
        message: `Suggesting next lesson after ${masteredLesson.unitLessonId}`,
      };
    } catch (error) {
      console.error('❌ [getNextLessonForStudent] Error:', error);
      return { success: false, error: handleServerError(error, 'Failed to get next lesson suggestion') };
    }
  });
}
