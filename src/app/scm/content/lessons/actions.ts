"use server";

import { ScopeAndSequenceModel } from "@mongoose-schema/scm/scope-and-sequence/scope-and-sequence.model";
import { ScopeSequenceUnitOrderModel } from "@mongoose-schema/scm/scope-sequence-unit-order/scope-sequence-unit-order.model";
import { RoadmapsSkillModel } from "@mongoose-schema/scm/roadmaps/roadmap-skill.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import type { ScopeSequenceTag } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

// =====================================
// LEAN QUERY TYPES
// =====================================

// Interface for unit order lean query results
interface UnitOrderDoc {
  _id: unknown;
  scopeSequenceTag: string;
  units: Array<{
    order: number;
    unitNumber: number;
    unitName: string;
    grade: string;
  }>;
}

// Interface for lesson lean query results
interface LessonDoc {
  _id: unknown;
  unitLessonId: string;
  lessonNumber: number;
  lessonName: string;
  lessonTitle?: string;
  lessonType?: string;
  section?: string;
  standards?: Array<{
    code: string;
    text: string;
    context?: string;
  }>;
  learningTargets?: string[];
  roadmapSkills?: string[];
  unitNumber: number;
  grade: string;
}

// Interface for skill lean query results
interface SkillDoc {
  skillNumber: string;
  title: string;
}

// =====================================
// EXPORTED TYPES
// =====================================

export interface LessonStandard {
  code: string;
  text: string;
  context?: "current" | "buildingOn" | "buildingTowards";
}

export interface LessonData {
  _id: string;
  unitLessonId: string;
  lessonNumber: number;
  lessonName: string;
  lessonTitle?: string;
  lessonType?: "lesson" | "rampUp" | "assessment";
  section?: string;
  standards: LessonStandard[];
  learningTargets: string[];
  roadmapSkills: string[];
}

export interface UnitWithLessons {
  order: number;
  unitNumber: number;
  unitName: string;
  grade: string;
  lessons: LessonData[];
}

export interface SkillInfo {
  skillNumber: string;
  title: string;
}

// =====================================
// ACTIONS
// =====================================

/**
 * Fetch all lessons organized by unit order for a given scope sequence tag
 */
export async function fetchLessonsWithUnitOrder(scopeSequenceTag: ScopeSequenceTag): Promise<{
  success: boolean;
  data?: {
    units: UnitWithLessons[];
    skillMap: Record<string, string>;
  };
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      // 1. Fetch unit order for this scope sequence tag
      const unitOrderDoc = await ScopeSequenceUnitOrderModel.findOne({ scopeSequenceTag }).lean<UnitOrderDoc>();

      if (!unitOrderDoc) {
        return {
          success: false,
          error: `No unit order found for ${scopeSequenceTag}`
        };
      }

      const unitOrder = unitOrderDoc.units.sort((a, b) => a.order - b.order);

      // 2. Build query conditions for all units
      // For Algebra 1, we need to query by both unitNumber AND grade
      // For other curricula, just scopeSequenceTag is enough
      const unitConditions = unitOrder.map(unit => ({
        scopeSequenceTag,
        unitNumber: unit.unitNumber,
        grade: unit.grade,
      }));

      // 3. Fetch all lessons for all units in one query
      const lessons = await ScopeAndSequenceModel
        .find({
          $or: unitConditions
        })
        .select('_id unitLessonId lessonNumber lessonName lessonTitle lessonType section standards learningTargets roadmapSkills unitNumber grade')
        .lean<LessonDoc[]>();

      // 4. Group lessons by unit (using unitNumber + grade as key)
      const lessonsByUnit = new Map<string, LessonData[]>();
      const allSkillNumbers = new Set<string>();

      for (const lesson of lessons) {
        const key = `${lesson.unitNumber}-${lesson.grade}`;

        if (!lessonsByUnit.has(key)) {
          lessonsByUnit.set(key, []);
        }

        // Collect skill numbers for batch lookup
        const roadmapSkills = lesson.roadmapSkills || [];
        roadmapSkills.forEach(skill => allSkillNumbers.add(skill));

        lessonsByUnit.get(key)!.push({
          _id: String(lesson._id),
          unitLessonId: lesson.unitLessonId,
          lessonNumber: lesson.lessonNumber,
          lessonName: lesson.lessonName,
          lessonTitle: lesson.lessonTitle,
          lessonType: lesson.lessonType as LessonData['lessonType'],
          section: lesson.section,
          standards: (lesson.standards || []) as LessonStandard[],
          learningTargets: lesson.learningTargets || [],
          roadmapSkills,
        });
      }

      // 5. Sort lessons within each unit by section order, then lesson number
      const sectionOrder: Record<string, number> = {
        'Ramp Ups': 0,
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'E': 5,
        'F': 6,
        'Unit Assessment': 7,
      };

      for (const [, unitLessons] of lessonsByUnit) {
        unitLessons.sort((a, b) => {
          const sectionA = sectionOrder[a.section || ''] ?? 99;
          const sectionB = sectionOrder[b.section || ''] ?? 99;
          if (sectionA !== sectionB) return sectionA - sectionB;
          return a.lessonNumber - b.lessonNumber;
        });
      }

      // 6. Batch fetch skill titles
      const skillMap: Record<string, string> = {};
      if (allSkillNumbers.size > 0) {
        const skills = await RoadmapsSkillModel
          .find({ skillNumber: { $in: Array.from(allSkillNumbers) } })
          .select('skillNumber title')
          .lean<SkillDoc[]>();

        for (const skill of skills) {
          skillMap[skill.skillNumber] = skill.title;
        }
      }

      // 7. Build final response with units in order
      const units: UnitWithLessons[] = unitOrder.map(unit => ({
        order: unit.order,
        unitNumber: unit.unitNumber,
        unitName: unit.unitName,
        grade: unit.grade,
        lessons: lessonsByUnit.get(`${unit.unitNumber}-${unit.grade}`) || [],
      }));

      return {
        success: true,
        data: {
          units,
          skillMap,
        }
      };
    } catch (error) {
      console.error('Error fetching lessons with unit order:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchLessonsWithUnitOrder')
      };
    }
  });
}

/**
 * Get available scope sequence tags (curricula) that have unit order defined
 */
export async function getAvailableScopeTags(): Promise<{
  success: boolean;
  data?: ScopeSequenceTag[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const tags = await ScopeSequenceUnitOrderModel.distinct('scopeSequenceTag') as unknown as string[];
      return {
        success: true,
        data: tags.sort() as ScopeSequenceTag[]
      };
    } catch (error) {
      console.error('Error fetching available scope tags:', error);
      return {
        success: false,
        error: handleServerError(error, 'getAvailableScopeTags')
      };
    }
  });
}
