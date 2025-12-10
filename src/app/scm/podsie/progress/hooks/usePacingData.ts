import { useState, useEffect, useMemo } from "react";
import { fetchSectionUnitSchedules } from "@/app/actions/calendar/unit-schedule";
import type { UnitSchedule } from "@zod-schema/calendar";
import type { LessonConfig, ProgressData } from "../types";
import { getSchoolForSection, getScopeTagForSection } from "../utils/sectionHelpers";

const SCHOOL_YEAR = "2025-2026";

export interface StudentPacingStatus {
  studentId: string;
  studentName: string;
  status: "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead";
  currentLesson?: string;
  currentLessonNumber?: number;
  completedLessonsInSection: number;
  totalLessonsInSection: number;
  currentSection?: string; // For far-behind/far-ahead students to show which section they're on
}

export interface SectionTimeProgress {
  startDate: string;
  endDate: string;
  totalDays: number;
  elapsedDays: number;
  percentElapsed: number;
}

export interface SectionLessonInfo {
  sectionName: string;
  lessonCount: number;
}

export interface LessonInfo {
  lessonId: string; // e.g., "3.1", "3.RU1"
  lessonNumber: number; // Numeric lesson number (for sorting)
  lessonName: string; // e.g., "Lesson 1", "RU1"
  studentCount: number; // Number of students currently on this lesson
  studentNames: string[]; // First names of students on this lesson
}

export interface UnitSectionInfo {
  sectionId: string;
  sectionName: string;
  lessonCount: number;
  dayCount: number;
  startDate: string | null;
  endDate: string | null;
  studentCount: number;
  isExpected: boolean;
  zone: "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead" | null;
  lessons: LessonInfo[]; // Individual lessons in this section
}

export interface CompletedStudentInfo {
  count: number;
  studentNames: string[]; // First names of students who completed the unit
}

export interface PacingData {
  expectedSection: string | null;
  expectedSectionName: string | null;
  previousSection: string | null;
  nextSection: string | null;
  sectionTimeProgress: SectionTimeProgress | null;
  totalLessonsInSection: number;
  // All sections in the unit with lesson counts
  unitSections: UnitSectionInfo[];
  // Students who have completed the entire unit
  completedStudents: CompletedStudentInfo;
  // Lesson counts per zone's section
  sectionLessonCounts: {
    farBehind: SectionLessonInfo | null;    // 2+ sections behind
    behind: SectionLessonInfo | null;       // previous section
    onTrack: SectionLessonInfo | null;      // expected section
    ahead: SectionLessonInfo | null;        // next section
    farAhead: SectionLessonInfo | null;     // 2+ sections ahead
  };
  students: {
    farBehind: StudentPacingStatus[];  // 2+ sections behind (red)
    behind: StudentPacingStatus[];      // 1 section behind (yellow)
    onTrack: StudentPacingStatus[];     // on expected section (green)
    ahead: StudentPacingStatus[];       // 1 section ahead (light blue)
    farAhead: StudentPacingStatus[];    // 2+ sections ahead (dark blue)
  };
  lessonsInExpectedSection: LessonConfig[];
  loading: boolean;
  error: string | null;
  noScheduleData: boolean;
}

// Normalize section names between different sources
// Unit schedules may use "Ramp Up" while scope-and-sequence uses "Ramp Ups"
// Unit schedules may use "Unit Test" while scope-and-sequence uses "Unit Assessment"
function normalizeSection(section: string | undefined): string {
  if (!section) return "";
  if (section === "Ramp Up") return "Ramp Ups";
  if (section === "Unit Test") return "Unit Assessment";
  return section;
}

const SECTION_ORDER = ["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"];

function getSectionIndex(section: string | undefined): number {
  if (!section) return -1;
  return SECTION_ORDER.indexOf(normalizeSection(section));
}

// Get sections that actually exist in the unit schedule
function getAvailableSections(unitSchedule: UnitSchedule | undefined): string[] {
  if (!unitSchedule?.sections) return [];
  return unitSchedule.sections
    .map(s => normalizeSection(s.sectionId))
    .filter(s => SECTION_ORDER.includes(s))
    .sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));
}

function getPreviousSectionInUnit(section: string, availableSections: string[]): string | null {
  const normalized = normalizeSection(section);
  const idx = availableSections.indexOf(normalized);
  if (idx <= 0) return null;
  return availableSections[idx - 1];
}

function getNextSectionInUnit(section: string, availableSections: string[]): string | null {
  const normalized = normalizeSection(section);
  const idx = availableSections.indexOf(normalized);
  if (idx < 0 || idx >= availableSections.length - 1) return null;
  return availableSections[idx + 1];
}

export function usePacingData(
  selectedSection: string,
  selectedUnit: number | null,
  lessons: LessonConfig[],
  progressData: ProgressData[]
): PacingData {
  const [unitSchedules, setUnitSchedules] = useState<UnitSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedSection || selectedUnit === null) {
        setUnitSchedules([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const school = getSchoolForSection(selectedSection);
        const scopeTag = getScopeTagForSection(selectedSection);

        if (school === "Unknown") {
          setError("Unknown school for section");
          return;
        }

        // Fetch unit schedules for the selected section
        const scheduleResult = await fetchSectionUnitSchedules(SCHOOL_YEAR, scopeTag, school, selectedSection);

        if (scheduleResult.success && scheduleResult.data) {
          setUnitSchedules(scheduleResult.data);
        } else {
          setError(scheduleResult.error || "Failed to load unit schedules");
        }
      } catch (err) {
        console.error("Error loading pacing data:", err);
        setError("Failed to load pacing data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSection, selectedUnit]);

  const pacingData = useMemo((): PacingData => {
    const emptyResult: PacingData = {
      expectedSection: null,
      expectedSectionName: null,
      previousSection: null,
      nextSection: null,
      sectionTimeProgress: null,
      totalLessonsInSection: 0,
      unitSections: [],
      completedStudents: { count: 0, studentNames: [] },
      sectionLessonCounts: { farBehind: null, behind: null, onTrack: null, ahead: null, farAhead: null },
      students: { farBehind: [], behind: [], onTrack: [], ahead: [], farAhead: [] },
      lessonsInExpectedSection: [],
      loading,
      error,
      noScheduleData: false,
    };

    if (loading || !selectedUnit || lessons.length === 0) {
      return { ...emptyResult, loading };
    }

    const unitSchedule = unitSchedules.find(s => s.unitNumber === selectedUnit);
    if (!unitSchedule || !unitSchedule.sections || unitSchedule.sections.length === 0) {
      return { ...emptyResult, noScheduleData: true };
    }

    // Find expected section for today
    const today = new Date().toISOString().split("T")[0];
    let expectedSection: string | null = null;
    let expectedSectionName: string | null = null;

    for (const section of unitSchedule.sections) {
      if (section.startDate && section.endDate && today >= section.startDate && today <= section.endDate) {
        // Normalize the section ID from unit schedule to match scope-and-sequence
        expectedSection = normalizeSection(section.sectionId);
        expectedSectionName = section.name;
        break;
      }
    }

    if (!expectedSection) {
      const lastSection = unitSchedule.sections[unitSchedule.sections.length - 1];
      if (lastSection?.endDate && today > lastSection.endDate) {
        expectedSection = normalizeSection(lastSection.sectionId);
        expectedSectionName = lastSection.name;
      } else {
        return { ...emptyResult, noScheduleData: true };
      }
    }

    // Get sections that actually exist in this unit
    const availableSections = getAvailableSections(unitSchedule);

    const previousSection = getPreviousSectionInUnit(expectedSection, availableSections);
    const nextSection = getNextSectionInUnit(expectedSection, availableSections);

    // Calculate section time progress
    let sectionTimeProgress: SectionTimeProgress | null = null;
    const currentScheduleSection = unitSchedule.sections.find(
      s => normalizeSection(s.sectionId) === expectedSection
    );
    if (currentScheduleSection?.startDate && currentScheduleSection?.endDate) {
      const startDate = new Date(currentScheduleSection.startDate + "T00:00:00");
      const endDate = new Date(currentScheduleSection.endDate + "T00:00:00");
      const todayDate = new Date(today + "T00:00:00");

      // Calculate total days (inclusive)
      const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      // Calculate elapsed days (how many days into the section we are, 1-indexed)
      const elapsedDays = Math.max(1, Math.round((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const percentElapsed = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

      sectionTimeProgress = {
        startDate: currentScheduleSection.startDate,
        endDate: currentScheduleSection.endDate,
        totalDays,
        elapsedDays,
        percentElapsed,
      };
    }

    // Helper to get lessons for a section (mastery-checks preferred, fallback to sidekicks)
    const getLessonsForSection = (sectionId: string | null): LessonConfig[] => {
      if (!sectionId) return [];
      const masteryChecks = lessons.filter(
        l => normalizeSection(l.section) === sectionId && l.activityType === "mastery-check"
      );
      if (masteryChecks.length > 0) return masteryChecks;
      // Fallback to sidekicks (e.g., Ramp Ups)
      return lessons.filter(
        l => normalizeSection(l.section) === sectionId && l.activityType === "sidekick"
      );
    };

    // Get lessons for each zone's section (only sections that exist in this unit)
    const twoBefore = previousSection ? getPreviousSectionInUnit(previousSection, availableSections) : null;
    const twoAfter = nextSection ? getNextSectionInUnit(nextSection, availableSections) : null;

    const lessonsInFarBehind = getLessonsForSection(twoBefore);
    const lessonsInBehind = getLessonsForSection(previousSection);
    const lessonsInExpectedSection = getLessonsForSection(expectedSection);
    const lessonsInAhead = getLessonsForSection(nextSection);
    const lessonsInFarAhead = getLessonsForSection(twoAfter);

    // Section lesson info
    const sectionLessonCounts = {
      farBehind: twoBefore ? { sectionName: twoBefore, lessonCount: lessonsInFarBehind.length } : null,
      behind: previousSection ? { sectionName: previousSection, lessonCount: lessonsInBehind.length } : null,
      onTrack: expectedSection ? { sectionName: expectedSection, lessonCount: lessonsInExpectedSection.length } : null,
      ahead: nextSection ? { sectionName: nextSection, lessonCount: lessonsInAhead.length } : null,
      farAhead: twoAfter ? { sectionName: twoAfter, lessonCount: lessonsInFarAhead.length } : null,
    };

    // Get all unique students
    const studentMap = new Map<string, { id: string; name: string }>();
    for (const p of progressData) {
      if (!studentMap.has(p.studentId)) {
        studentMap.set(p.studentId, { id: p.studentId, name: p.studentName });
      }
    }

    const farBehind: StudentPacingStatus[] = [];
    const behind: StudentPacingStatus[] = [];
    const onTrack: StudentPacingStatus[] = [];
    const ahead: StudentPacingStatus[] = [];
    const farAhead: StudentPacingStatus[] = [];

    for (const [studentId, student] of studentMap) {
      const completedSections = new Set<string>();

      // Check which sections are fully complete for this student
      // Group lessons by normalized section name - check BOTH mastery-checks AND sidekicks
      // For sections with mastery-checks, use those. For sections with only sidekicks (like Ramp Ups), use sidekicks.
      const sectionGroups = new Map<string, { masteryChecks: LessonConfig[], sidekicks: LessonConfig[] }>();
      for (const lesson of lessons) {
        if (lesson.section) {
          const normalizedSection = normalizeSection(lesson.section);
          if (!sectionGroups.has(normalizedSection)) {
            sectionGroups.set(normalizedSection, { masteryChecks: [], sidekicks: [] });
          }
          const group = sectionGroups.get(normalizedSection)!;
          if (lesson.activityType === "mastery-check") {
            group.masteryChecks.push(lesson);
          } else if (lesson.activityType === "sidekick") {
            group.sidekicks.push(lesson);
          }
        }
      }

      for (const [section, { masteryChecks, sidekicks }] of sectionGroups) {
        // Use mastery-checks if available, otherwise use sidekicks
        const lessonsToCheck = masteryChecks.length > 0 ? masteryChecks : sidekicks;

        if (lessonsToCheck.length === 0) {
          // No activities to check - consider section complete
          completedSections.add(section);
          continue;
        }

        const allComplete = lessonsToCheck.every(lesson => {
          const progressEntry = progressData.find(
            p => p.studentId === studentId && p.podsieAssignmentId === lesson.podsieAssignmentId
          );
          return progressEntry?.isFullyComplete ?? false;
        });

        if (allComplete) {
          completedSections.add(section);
        }
      }

      // Determine student's pacing status based on which sections they've completed
      const hasCompletedExpected = completedSections.has(expectedSection);
      const hasCompletedPrevious = previousSection ? completedSections.has(previousSection) : true; // No previous = consider it done
      const hasCompletedNext = nextSection ? completedSections.has(nextSection) : false;

      // Check how many sections ahead they are
      let sectionsAhead = 0;
      if (hasCompletedExpected) {
        sectionsAhead = 1;
        if (hasCompletedNext) {
          sectionsAhead = 2;
        } else if (nextSection) {
          // Check if they've completed all lessons in the next section
          // (might not be in completedSections if section name doesn't match exactly)
          const nextSectionLessons = getLessonsForSection(nextSection);
          if (nextSectionLessons.length > 0) {
            const completedInNext = nextSectionLessons.filter(l =>
              progressData.some(
                p => p.studentId === studentId && p.podsieAssignmentId === l.podsieAssignmentId && p.isFullyComplete
              )
            ).length;
            if (completedInNext === nextSectionLessons.length) {
              sectionsAhead = 2;
            }
          }
        }
      }

      // Check how many sections behind they are
      let sectionsBehind = 0;
      if (!hasCompletedPrevious && previousSection) {
        sectionsBehind = 1;
        // Check if they're 2+ sections behind (haven't completed the section before previous)
        if (twoBefore && !completedSections.has(twoBefore) && getSectionIndex(twoBefore) >= 0) {
          sectionsBehind = 2;
        }
      }

      // Determine which section this student is actually working in
      let studentSectionLessons: LessonConfig[] = lessonsInExpectedSection;
      let studentCurrentSection: string | undefined = expectedSection || undefined;
      if (sectionsAhead >= 2) {
        // Far ahead: find the student's actual furthest section by checking sections that exist in this unit
        // Start from the last available section and work backwards to find where they have progress
        const expectedIdx = availableSections.indexOf(expectedSection);
        let foundSection = false;

        for (let i = availableSections.length - 1; i > expectedIdx + 1; i--) {
          const sectionName = availableSections[i];
          const sectionLessons = getLessonsForSection(sectionName);
          if (sectionLessons.length === 0) continue;

          // Check if student has any progress in this section
          const hasAnyProgress = sectionLessons.some(l =>
            progressData.some(
              p => p.studentId === studentId && p.podsieAssignmentId === l.podsieAssignmentId && p.isFullyComplete
            )
          );

          if (hasAnyProgress) {
            // This is the furthest section they've reached
            studentSectionLessons = sectionLessons;
            studentCurrentSection = sectionName;
            foundSection = true;
            break;
          }
        }

        if (!foundSection) {
          // Fall back to twoAfter if available, otherwise use nextSection or expected
          if (twoAfter && lessonsInFarAhead.length > 0) {
            studentSectionLessons = lessonsInFarAhead;
            studentCurrentSection = twoAfter;
          } else if (nextSection && lessonsInAhead.length > 0) {
            studentSectionLessons = lessonsInAhead;
            studentCurrentSection = nextSection;
          } else {
            // Student is fully complete - use expected section but they're done
            studentSectionLessons = lessonsInExpectedSection;
            studentCurrentSection = expectedSection || undefined;
          }
        }
      } else if (sectionsAhead >= 1) {
        studentSectionLessons = lessonsInAhead.length > 0 ? lessonsInAhead : lessonsInExpectedSection;
        studentCurrentSection = nextSection || expectedSection || undefined;
      } else if (sectionsBehind >= 2) {
        studentSectionLessons = lessonsInFarBehind.length > 0 ? lessonsInFarBehind : lessonsInBehind.length > 0 ? lessonsInBehind : lessonsInExpectedSection;
        studentCurrentSection = twoBefore || previousSection || expectedSection || undefined;
      } else if (sectionsBehind >= 1) {
        studentSectionLessons = lessonsInBehind.length > 0 ? lessonsInBehind : lessonsInExpectedSection;
        studentCurrentSection = previousSection || expectedSection || undefined;
      } else {
        studentSectionLessons = lessonsInExpectedSection;
        studentCurrentSection = expectedSection || undefined;
      }

      // Count completed lessons in student's actual section
      const completedInStudentSection = studentSectionLessons.filter(l =>
        progressData.some(
          p => p.studentId === studentId && p.podsieAssignmentId === l.podsieAssignmentId && p.isFullyComplete
        )
      ).length;

      // Find current lesson in student's actual section
      let currentLesson: string | undefined;
      let currentLessonNumber: number | undefined;

      const sortedLessons = [...studentSectionLessons].sort((a, b) => {
        const aNum = parseInt(a.unitLessonId.split('.')[1] || '0');
        const bNum = parseInt(b.unitLessonId.split('.')[1] || '0');
        return aNum - bNum;
      });

      for (const lesson of sortedLessons) {
        const isComplete = progressData.some(
          p => p.studentId === studentId && p.podsieAssignmentId === lesson.podsieAssignmentId && p.isFullyComplete
        );
        if (!isComplete) {
          const lessonPart = lesson.unitLessonId.split('.')[1] || lesson.unitLessonId;
          const isRampUp = lessonPart.toUpperCase().startsWith('RU');
          // Extract number from lessonPart - for ramp-ups like "RU1", extract the 1
          const lessonNum = isRampUp
            ? parseInt(lessonPart.substring(2)) || 0
            : parseInt(lessonPart) || 0;
          currentLesson = `Lesson ${lessonPart}`;
          currentLessonNumber = lessonNum;
          break;
        }
      }

      const status: StudentPacingStatus = {
        studentId,
        studentName: student.name,
        status: "on-track",
        currentLesson,
        currentLessonNumber,
        completedLessonsInSection: completedInStudentSection,
        totalLessonsInSection: studentSectionLessons.length,
        currentSection: studentCurrentSection,
      };

      // Categorize the student
      if (sectionsAhead >= 2) {
        status.status = "far-ahead";
        farAhead.push(status);
      } else if (sectionsAhead >= 1) {
        status.status = "ahead";
        ahead.push(status);
      } else if (sectionsBehind >= 2) {
        status.status = "far-behind";
        farBehind.push(status);
      } else if (sectionsBehind >= 1) {
        status.status = "behind";
        behind.push(status);
      } else {
        status.status = "on-track";
        onTrack.push(status);
      }
    }

    // Sort on-track by lesson number
    onTrack.sort((a, b) => (a.currentLessonNumber || 0) - (b.currentLessonNumber || 0));

    // Build maps of student counts and names per section and per lesson
    const allStudents = [...farBehind, ...behind, ...onTrack, ...ahead, ...farAhead];
    const studentCountBySection = new Map<string, number>();
    const studentCountByLesson = new Map<string, number>(); // key: "sectionId:lessonNumber"
    const studentNamesByLesson = new Map<string, string[]>(); // key: "sectionId:lessonNumber"

    // Track students who completed the entire unit (no currentLessonNumber means they finished all lessons)
    const completedStudentNames: string[] = [];

    for (const student of allStudents) {
      if (student.currentSection) {
        const normalizedSection = normalizeSection(student.currentSection);
        studentCountBySection.set(
          normalizedSection,
          (studentCountBySection.get(normalizedSection) || 0) + 1
        );
        // Track per-lesson counts and names
        if (student.currentLessonNumber !== undefined) {
          const lessonKey = `${normalizedSection}:${student.currentLessonNumber}`;
          studentCountByLesson.set(
            lessonKey,
            (studentCountByLesson.get(lessonKey) || 0) + 1
          );
          // Extract first name and first letter of last name (e.g., "John D.")
          const nameParts = student.studentName.split(' ');
          const displayName = nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
          const existingNames = studentNamesByLesson.get(lessonKey) || [];
          existingNames.push(displayName);
          studentNamesByLesson.set(lessonKey, existingNames);
        } else {
          // Student has no current lesson - they completed the unit
          const nameParts = student.studentName.split(' ');
          const displayName = nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
          completedStudentNames.push(displayName);
        }
      }
    }

    const completedStudents: CompletedStudentInfo = {
      count: completedStudentNames.length,
      studentNames: completedStudentNames,
    };

    // Build unit sections for visualization - use lessons prop (same as PacingZoneCard)
    // Now that students are categorized, we can include student counts per section
    // Exclude Unit Assessment from the progress bar
    const unitSections: UnitSectionInfo[] = unitSchedule.sections
      .filter(scheduleSection => {
        const normalizedId = normalizeSection(scheduleSection.sectionId);
        return normalizedId !== "Unit Assessment";
      })
      .map(scheduleSection => {
        const normalizedSectionId = normalizeSection(scheduleSection.sectionId);
        // Get lessons from lessons prop using getLessonsForSection (same as PacingZoneCard)
        // This prefers mastery-checks but falls back to sidekicks (for Ramp Ups)
        const lessonsForSection = getLessonsForSection(normalizedSectionId);
        const sectionLessons = lessonsForSection
          .map(l => {
            // Parse lesson number from unitLessonId (e.g., "3.15" -> 15, "3.RU1" -> 1)
            const parts = l.unitLessonId.split('.');
            const lessonPart = parts[1] || parts[0];
            const isRampUp = lessonPart.toUpperCase().startsWith('RU');
            const lessonNum = isRampUp
              ? parseInt(lessonPart.substring(2)) || 0
              : parseInt(lessonPart) || 0;

            // Get student count and names for this specific lesson
            const lessonKey = `${normalizedSectionId}:${lessonNum}`;
            const lessonStudentCount = studentCountByLesson.get(lessonKey) || 0;
            const lessonStudentNames = studentNamesByLesson.get(lessonKey) || [];

            return {
              lessonId: l.unitLessonId,
              lessonNumber: lessonNum,
              lessonName: isRampUp ? `RU ${lessonNum}` : `Lesson ${lessonNum}`,
              studentCount: lessonStudentCount,
              studentNames: lessonStudentNames,
            };
          })
          .sort((a, b) => a.lessonNumber - b.lessonNumber);

        // Get student count from the map (based on actual student sections)
        const studentCount = studentCountBySection.get(normalizedSectionId) || 0;

        // Determine zone for this section
        let zone: "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead" | null = null;

        if (normalizedSectionId === expectedSection) {
          zone = "on-track";
        } else if (normalizedSectionId === previousSection) {
          zone = "behind";
        } else if (normalizedSectionId === nextSection) {
          zone = "ahead";
        } else {
          // Sections outside the 3 main zones - determine if far-behind or far-ahead
          const sectionIdx = getSectionIndex(normalizedSectionId);
          const expectedIdx = getSectionIndex(expectedSection);
          if (sectionIdx >= 0 && expectedIdx >= 0) {
            if (sectionIdx < expectedIdx - 1) {
              zone = "far-behind";
            } else if (sectionIdx > expectedIdx + 1) {
              zone = "far-ahead";
            }
          }
        }

        // Use plannedDays from the schedule (not calculated from dates)
        const dayCount = scheduleSection.plannedDays || 0;

        return {
          sectionId: normalizedSectionId,
          sectionName: scheduleSection.name || normalizedSectionId,
          lessonCount: sectionLessons.length,
          dayCount,
          startDate: scheduleSection.startDate || null,
          endDate: scheduleSection.endDate || null,
          studentCount,
          isExpected: normalizedSectionId === expectedSection,
          zone,
          lessons: sectionLessons,
        };
      });

    return {
      expectedSection,
      expectedSectionName,
      previousSection,
      nextSection,
      sectionTimeProgress,
      totalLessonsInSection: lessonsInExpectedSection.length,
      unitSections,
      completedStudents,
      sectionLessonCounts,
      students: { farBehind, behind, onTrack, ahead, farAhead },
      lessonsInExpectedSection,
      loading: false,
      error: null,
      noScheduleData: false,
    };
  }, [unitSchedules, selectedUnit, lessons, progressData, loading, error]);

  return pacingData;
}
