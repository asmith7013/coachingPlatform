import { useState, useEffect, useMemo } from "react";
import { fetchSectionUnitSchedules } from "@/app/actions/calendar/unit-schedule";
import { fetchRampUpsByUnit } from "@/app/actions/313/scope-and-sequence";
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

export interface UnitSectionInfo {
  sectionId: string;
  sectionName: string;
  lessonCount: number;
  studentCount: number;
  isExpected: boolean;
  zone: "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead" | null;
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

function getPreviousSection(section: string): string | null {
  const normalized = normalizeSection(section);
  const idx = SECTION_ORDER.indexOf(normalized);
  if (idx <= 0) return null;
  return SECTION_ORDER[idx - 1];
}

function getNextSection(section: string): string | null {
  const normalized = normalizeSection(section);
  const idx = SECTION_ORDER.indexOf(normalized);
  if (idx < 0 || idx >= SECTION_ORDER.length - 1) return null;
  return SECTION_ORDER[idx + 1];
}

// Scope-and-sequence lesson type (minimal for counting)
interface ScopeAndSequenceLesson {
  section?: string;
  unitLessonId: string;
  lessonName: string;
}

export function usePacingData(
  selectedSection: string,
  selectedUnit: number | null,
  lessons: LessonConfig[],
  progressData: ProgressData[]
): PacingData {
  const [unitSchedules, setUnitSchedules] = useState<UnitSchedule[]>([]);
  const [scopeAndSequenceLessons, setScopeAndSequenceLessons] = useState<ScopeAndSequenceLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedSection || selectedUnit === null) {
        setUnitSchedules([]);
        setScopeAndSequenceLessons([]);
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

        // Fetch both unit schedules and scope-and-sequence lessons in parallel
        // Use scopeSequenceTag (curriculum identifier like "Algebra 1") instead of grade for the fetch
        const [scheduleResult, lessonsResult] = await Promise.all([
          fetchSectionUnitSchedules(SCHOOL_YEAR, scopeTag, school, selectedSection),
          fetchRampUpsByUnit(scopeTag, selectedUnit)
        ]);

        if (scheduleResult.success && scheduleResult.data) {
          setUnitSchedules(scheduleResult.data);
        } else {
          setError(scheduleResult.error || "Failed to load unit schedules");
        }

        if (lessonsResult.success && lessonsResult.data) {
          setScopeAndSequenceLessons(lessonsResult.data);
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

    const previousSection = getPreviousSection(expectedSection);
    const nextSection = getNextSection(expectedSection);

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

    // Get lessons for each zone's section
    const twoBefore = previousSection ? getPreviousSection(previousSection) : null;
    const twoAfter = nextSection ? getNextSection(nextSection) : null;

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
      let studentSectionLessons: LessonConfig[];
      let studentCurrentSection: string | undefined;
      if (sectionsAhead >= 2) {
        studentSectionLessons = lessonsInFarAhead.length > 0 ? lessonsInFarAhead : lessonsInAhead.length > 0 ? lessonsInAhead : lessonsInExpectedSection;
        studentCurrentSection = twoAfter || nextSection || expectedSection || undefined;
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
          const lessonNum = lesson.unitLessonId.split('.')[1] || lesson.unitLessonId;
          currentLesson = `Lesson ${lessonNum}`;
          currentLessonNumber = parseInt(lessonNum);
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

    // Build unit sections for visualization - use scope-and-sequence for lesson counts
    // Now that students are categorized, we can include student counts per section
    // Exclude Unit Assessment from the progress bar
    const unitSections: UnitSectionInfo[] = unitSchedule.sections
      .filter(scheduleSection => {
        const normalizedId = normalizeSection(scheduleSection.sectionId);
        return normalizedId !== "Unit Assessment";
      })
      .map(scheduleSection => {
        const normalizedSectionId = normalizeSection(scheduleSection.sectionId);
        // Count lessons from scope-and-sequence (not just what's in Podsie)
        const scopeLessonCount = scopeAndSequenceLessons.filter(
          l => normalizeSection(l.section) === normalizedSectionId
        ).length;

        // Determine zone and student count for this section
        let studentCount = 0;
        let zone: "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead" | null = null;

        if (normalizedSectionId === expectedSection) {
          studentCount = onTrack.length;
          zone = "on-track";
        } else if (normalizedSectionId === previousSection) {
          studentCount = behind.length;
          zone = "behind";
        } else if (normalizedSectionId === nextSection) {
          studentCount = ahead.length;
          zone = "ahead";
        } else if (twoBefore && normalizedSectionId === twoBefore) {
          studentCount = farBehind.length;
          zone = "far-behind";
        } else if (twoAfter && normalizedSectionId === twoAfter) {
          studentCount = farAhead.length;
          zone = "far-ahead";
        } else {
          // Sections outside the 5-zone range - determine if before or after expected
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

        return {
          sectionId: normalizedSectionId,
          sectionName: scheduleSection.name || normalizedSectionId,
          lessonCount: scopeLessonCount,
          studentCount,
          isExpected: normalizedSectionId === expectedSection,
          zone,
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
      sectionLessonCounts,
      students: { farBehind, behind, onTrack, ahead, farAhead },
      lessonsInExpectedSection,
      loading: false,
      error: null,
      noScheduleData: false,
    };
  }, [unitSchedules, scopeAndSequenceLessons, selectedUnit, lessons, progressData, loading, error]);

  return pacingData;
}
