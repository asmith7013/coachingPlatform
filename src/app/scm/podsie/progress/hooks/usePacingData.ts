import { useState, useEffect, useMemo } from "react";
import { fetchSectionUnitSchedules } from "@/app/actions/calendar/unit-schedule";
import type { UnitSchedule } from "@zod-schema/calendar";
import type { LessonConfig, ProgressData } from "../types";
import { getScopeTagForSection } from "../utils/sectionHelpers";

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
  currentSubsection?: number; // Subsection within the section (Part 1, Part 2, etc.)
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

export interface StudentLessonInfo {
  name: string; // Display name (e.g., "John D.")
  completedToday: number; // Number of lessons completed today
  completedYesterday: number; // Number of lessons completed yesterday
  smallGroupToday: boolean; // Was in small group today
  smallGroupYesterday: boolean; // Was in small group yesterday
  inquiryToday: boolean; // Was in inquiry today
  inquiryYesterday: boolean; // Was in inquiry yesterday
}

export interface LessonInfo {
  lessonId: string; // e.g., "3.1", "3.RU1"
  lessonNumber: number; // Numeric lesson number (for sorting)
  lessonName: string; // e.g., "Lesson 1", "RU1"
  studentCount: number; // Number of students currently on this lesson
  studentNames: string[]; // First names of students on this lesson
  students: StudentLessonInfo[]; // Student info with recent completion data
}

export interface UnitSectionInfo {
  sectionId: string;
  sectionName: string;
  subsection?: number; // Part 1, Part 2, etc.
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
  students: StudentLessonInfo[]; // Detailed info for each completed student
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
    farBehind: SectionLessonInfo | null; // 2+ sections behind
    behind: SectionLessonInfo | null; // previous section
    onTrack: SectionLessonInfo | null; // expected section
    ahead: SectionLessonInfo | null; // next section
    farAhead: SectionLessonInfo | null; // 2+ sections ahead
  };
  students: {
    farBehind: StudentPacingStatus[]; // 2+ sections behind (red)
    behind: StudentPacingStatus[]; // 1 section behind (yellow)
    onTrack: StudentPacingStatus[]; // on expected section (green)
    ahead: StudentPacingStatus[]; // 1 section ahead (light blue)
    farAhead: StudentPacingStatus[]; // 2+ sections ahead (dark blue)
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

const SECTION_ORDER = [
  "Ramp Ups",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "Unit Assessment",
];

// getSectionIndex removed - now using position-based calculation with orderedSectionSubsections

// Get sections that actually exist in the unit schedule
function getAvailableSections(
  unitSchedule: UnitSchedule | undefined,
): string[] {
  if (!unitSchedule?.sections) return [];
  return unitSchedule.sections
    .map((s) => normalizeSection(s.sectionId))
    .filter((s) => SECTION_ORDER.includes(s))
    .sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));
}

function getPreviousSectionInUnit(
  section: string,
  availableSections: string[],
): string | null {
  const normalized = normalizeSection(section);
  const idx = availableSections.indexOf(normalized);
  if (idx <= 0) return null;
  return availableSections[idx - 1];
}

function getNextSectionInUnit(
  section: string,
  availableSections: string[],
): string | null {
  const normalized = normalizeSection(section);
  const idx = availableSections.indexOf(normalized);
  if (idx < 0 || idx >= availableSections.length - 1) return null;
  return availableSections[idx + 1];
}

export function usePacingData(
  selectedSection: string,
  selectedUnit: number | null,
  lessons: LessonConfig[],
  progressData: ProgressData[],
  excludeRampUps: boolean = false,
  /** Optional date to use for pacing calculations (defaults to today) */
  pacingDate?: string,
  /** Hide far-behind sections that have no students (reduces visual clutter) */
  hideEmptySections: boolean = true,
  /** School for the selected section (required for sections that exist in multiple schools) */
  school?: string,
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

        const scopeTag = getScopeTagForSection(selectedSection);

        if (!school) {
          setError("School is required for pacing data");
          return;
        }

        // Fetch unit schedules for the selected section
        const scheduleResult = await fetchSectionUnitSchedules(
          SCHOOL_YEAR,
          scopeTag,
          school,
          selectedSection,
        );

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
  }, [selectedSection, selectedUnit, school]);

  const pacingData = useMemo((): PacingData => {
    const emptyResult: PacingData = {
      expectedSection: null,
      expectedSectionName: null,
      previousSection: null,
      nextSection: null,
      sectionTimeProgress: null,
      totalLessonsInSection: 0,
      unitSections: [],
      completedStudents: { count: 0, studentNames: [], students: [] },
      sectionLessonCounts: {
        farBehind: null,
        behind: null,
        onTrack: null,
        ahead: null,
        farAhead: null,
      },
      students: {
        farBehind: [],
        behind: [],
        onTrack: [],
        ahead: [],
        farAhead: [],
      },
      lessonsInExpectedSection: [],
      loading,
      error,
      noScheduleData: false,
    };

    if (loading || !selectedUnit || lessons.length === 0) {
      return { ...emptyResult, loading };
    }

    const unitSchedule = unitSchedules.find(
      (s) => s.unitNumber === selectedUnit,
    );
    if (
      !unitSchedule ||
      !unitSchedule.sections ||
      unitSchedule.sections.length === 0
    ) {
      return { ...emptyResult, noScheduleData: true };
    }

    // Find expected section AND subsection for the reference date (pacingDate or today)
    const today = pacingDate || new Date().toISOString().split("T")[0];
    let expectedSection: string | null = null;
    let expectedSectionName: string | null = null;
    let expectedSubsection: number | undefined = undefined;

    for (const section of unitSchedule.sections) {
      if (
        section.startDate &&
        section.endDate &&
        today >= section.startDate &&
        today <= section.endDate
      ) {
        // Normalize the section ID from unit schedule to match scope-and-sequence
        expectedSection = normalizeSection(section.sectionId);
        expectedSectionName = section.name;
        expectedSubsection = section.subsection;
        break;
      }
    }

    if (!expectedSection) {
      const lastSection =
        unitSchedule.sections[unitSchedule.sections.length - 1];
      if (lastSection?.endDate && today > lastSection.endDate) {
        expectedSection = normalizeSection(lastSection.sectionId);
        expectedSectionName = lastSection.name;
        expectedSubsection = lastSection.subsection;
      } else {
        return { ...emptyResult, noScheduleData: true };
      }
    }

    // Build ordered list of section/subsections for granular zone calculation
    // Each subsection is treated as its own "unit" for ahead/behind math
    type SectionSubsectionEntry = {
      sectionId: string;
      subsection?: number;
      key: string;
    };
    const orderedSectionSubsections: SectionSubsectionEntry[] =
      unitSchedule.sections
        .filter((s) => {
          const normalizedId = normalizeSection(s.sectionId);
          if (normalizedId === "Unit Assessment") return false;
          if (excludeRampUps && normalizedId === "Ramp Ups") return false;
          return true;
        })
        .map((s) => {
          const normalizedId = normalizeSection(s.sectionId);
          const key =
            s.subsection !== undefined
              ? `${normalizedId}:${s.subsection}`
              : normalizedId;
          return { sectionId: normalizedId, subsection: s.subsection, key };
        });

    // Find position of expected section/subsection in the ordered list
    const expectedKey =
      expectedSubsection !== undefined
        ? `${expectedSection}:${expectedSubsection}`
        : expectedSection;
    const expectedIndex = orderedSectionSubsections.findIndex(
      (s) => s.key === expectedKey,
    );

    // Helper to get zone based on position difference from expected
    const getZoneForPosition = (
      index: number,
    ): "far-behind" | "behind" | "on-track" | "ahead" | "far-ahead" | null => {
      if (index < 0 || expectedIndex < 0) return null;
      const diff = index - expectedIndex;
      if (diff === 0) return "on-track";
      if (diff === 1) return "ahead";
      if (diff === -1) return "behind";
      if (diff >= 2) return "far-ahead";
      if (diff <= -2) return "far-behind";
      return null;
    };

    // Helper to get lessons for a specific section AND subsection
    // Falls back to ALL lessons in section if no subsection-specific lessons exist
    const getLessonsForSectionSubsection = (
      sectionId: string | null,
      subsection: number | undefined,
    ): LessonConfig[] => {
      if (!sectionId) return [];
      if (excludeRampUps && sectionId === "Ramp Ups") return [];

      // Get all lessons in this section
      const sectionLessons = lessons.filter(
        (l) => normalizeSection(l.section) === sectionId,
      );

      // Filter by subsection if specified
      let matchingLessons: LessonConfig[];
      if (subsection !== undefined) {
        // Try to find lessons with this specific subsection
        matchingLessons = sectionLessons.filter(
          (l) => l.subsection === subsection,
        );

        // FALLBACK: If no lessons have subsection assignments yet, use ALL lessons in the section
        // This handles the case where schedule has subsections but lessons haven't been split
        if (matchingLessons.length === 0) {
          matchingLessons = sectionLessons.filter(
            (l) => l.subsection === undefined,
          );
        }
      } else {
        // No subsection specified - get lessons without subsection assignment
        matchingLessons = sectionLessons.filter(
          (l) => l.subsection === undefined,
        );
      }

      // Prefer mastery-checks, fallback to sidekicks
      const masteryChecks = matchingLessons.filter(
        (l) => l.activityType === "mastery-check",
      );
      if (masteryChecks.length > 0) return masteryChecks;
      return matchingLessons.filter((l) => l.activityType === "sidekick");
    };

    // Get sections that actually exist in this unit
    let availableSections = getAvailableSections(unitSchedule);

    // Filter out Ramp Ups if excludeRampUps is true
    if (excludeRampUps) {
      availableSections = availableSections.filter((s) => s !== "Ramp Ups");
    }

    const previousSection = getPreviousSectionInUnit(
      expectedSection,
      availableSections,
    );
    const nextSection = getNextSectionInUnit(
      expectedSection,
      availableSections,
    );

    // Calculate section time progress
    let sectionTimeProgress: SectionTimeProgress | null = null;
    const currentScheduleSection = unitSchedule.sections.find(
      (s) => normalizeSection(s.sectionId) === expectedSection,
    );
    if (currentScheduleSection?.startDate && currentScheduleSection?.endDate) {
      const startDate = new Date(
        currentScheduleSection.startDate + "T00:00:00",
      );
      const endDate = new Date(currentScheduleSection.endDate + "T00:00:00");
      const todayDate = new Date(today + "T00:00:00");

      // Calculate total days (inclusive)
      const totalDays =
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      // Calculate elapsed days (how many days into the section we are, 1-indexed)
      const elapsedDays = Math.max(
        1,
        Math.round(
          (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1,
      );
      const percentElapsed = Math.min(
        100,
        Math.round((elapsedDays / totalDays) * 100),
      );

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
      // Skip Ramp Ups section if excludeRampUps is true
      if (excludeRampUps && sectionId === "Ramp Ups") return [];
      const masteryChecks = lessons.filter(
        (l) =>
          normalizeSection(l.section) === sectionId &&
          l.activityType === "mastery-check",
      );
      if (masteryChecks.length > 0) return masteryChecks;
      // Fallback to sidekicks (e.g., Ramp Ups)
      return lessons.filter(
        (l) =>
          normalizeSection(l.section) === sectionId &&
          l.activityType === "sidekick",
      );
    };

    // Get lessons for each zone's section (only sections that exist in this unit)
    const twoBefore = previousSection
      ? getPreviousSectionInUnit(previousSection, availableSections)
      : null;
    const twoAfter = nextSection
      ? getNextSectionInUnit(nextSection, availableSections)
      : null;

    const lessonsInFarBehind = getLessonsForSection(twoBefore);
    const lessonsInBehind = getLessonsForSection(previousSection);
    const lessonsInExpectedSection = getLessonsForSection(expectedSection);
    const lessonsInAhead = getLessonsForSection(nextSection);
    const lessonsInFarAhead = getLessonsForSection(twoAfter);

    // Section lesson info
    const sectionLessonCounts = {
      farBehind: twoBefore
        ? { sectionName: twoBefore, lessonCount: lessonsInFarBehind.length }
        : null,
      behind: previousSection
        ? { sectionName: previousSection, lessonCount: lessonsInBehind.length }
        : null,
      onTrack: expectedSection
        ? {
            sectionName: expectedSection,
            lessonCount: lessonsInExpectedSection.length,
          }
        : null,
      ahead: nextSection
        ? { sectionName: nextSection, lessonCount: lessonsInAhead.length }
        : null,
      farAhead: twoAfter
        ? { sectionName: twoAfter, lessonCount: lessonsInFarAhead.length }
        : null,
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
    const completedStudentNames: string[] = []; // Track students who completed the entire unit
    const completedStudentIds: string[] = []; // Track student IDs for activity lookup

    for (const [studentId, student] of studentMap) {
      // Track completed section/subsections (using keys like "B:1", "B:2", "C")
      const completedSectionSubsections = new Set<string>();

      // Group lessons by section:subsection key
      const sectionSubsectionGroups = new Map<
        string,
        { masteryChecks: LessonConfig[]; sidekicks: LessonConfig[] }
      >();
      for (const lesson of lessons) {
        if (lesson.section) {
          const normalizedSection = normalizeSection(lesson.section);
          if (excludeRampUps && normalizedSection === "Ramp Ups") continue;
          // Build key that includes subsection if present
          const key =
            lesson.subsection !== undefined
              ? `${normalizedSection}:${lesson.subsection}`
              : normalizedSection;
          if (!sectionSubsectionGroups.has(key)) {
            sectionSubsectionGroups.set(key, {
              masteryChecks: [],
              sidekicks: [],
            });
          }
          const group = sectionSubsectionGroups.get(key)!;
          if (lesson.activityType === "mastery-check") {
            group.masteryChecks.push(lesson);
          } else if (lesson.activityType === "sidekick") {
            group.sidekicks.push(lesson);
          }
        }
      }

      for (const [
        sectionSubsectionKey,
        { masteryChecks, sidekicks },
      ] of sectionSubsectionGroups) {
        // Use mastery-checks if available, otherwise use sidekicks
        const lessonsToCheck =
          masteryChecks.length > 0 ? masteryChecks : sidekicks;

        if (lessonsToCheck.length === 0) {
          completedSectionSubsections.add(sectionSubsectionKey);
          continue;
        }

        const allComplete = lessonsToCheck.every((lesson) => {
          const progressEntry = progressData.find(
            (p) =>
              p.studentId === studentId &&
              p.podsieAssignmentId === lesson.podsieAssignmentId,
          );
          return progressEntry?.isFullyComplete ?? false;
        });

        if (allComplete) {
          completedSectionSubsections.add(sectionSubsectionKey);
        }
      }

      // Find the student's current working position in the ordered list
      // This is the first section/subsection they haven't completed
      let studentPositionIndex = -1;
      let studentCurrentSectionSubsection: SectionSubsectionEntry | undefined;

      for (let i = 0; i < orderedSectionSubsections.length; i++) {
        const entry = orderedSectionSubsections[i];
        if (!completedSectionSubsections.has(entry.key)) {
          // This is where the student is currently working
          studentPositionIndex = i;
          studentCurrentSectionSubsection = entry;
          break;
        }
      }

      // If they've completed everything, they're past the last entry
      if (studentPositionIndex === -1) {
        studentPositionIndex = orderedSectionSubsections.length; // Past the end = fully complete
      }

      // Calculate position difference from expected
      const positionDiff = studentPositionIndex - expectedIndex;

      // Determine zone based on position difference
      // Each subsection counts as one "unit"
      const unitsAheadOrBehind = positionDiff;

      // Determine which section/subsection this student is working in
      let studentSectionLessons: LessonConfig[] = lessonsInExpectedSection;
      let studentCurrentSection: string | undefined =
        expectedSection || undefined;
      let studentCurrentSubsection: number | undefined = expectedSubsection;

      if (studentCurrentSectionSubsection) {
        // Get lessons for the student's current section/subsection
        studentSectionLessons = getLessonsForSectionSubsection(
          studentCurrentSectionSubsection.sectionId,
          studentCurrentSectionSubsection.subsection,
        );
        studentCurrentSection = studentCurrentSectionSubsection.sectionId;
        studentCurrentSubsection = studentCurrentSectionSubsection.subsection;
      } else {
        // Student has completed everything - use expected section
        studentSectionLessons = lessonsInExpectedSection;
        studentCurrentSection = expectedSection || undefined;
        studentCurrentSubsection = expectedSubsection;
      }

      // Count completed lessons in student's actual section
      const completedInStudentSection = studentSectionLessons.filter((l) =>
        progressData.some(
          (p) =>
            p.studentId === studentId &&
            p.podsieAssignmentId === l.podsieAssignmentId &&
            p.isFullyComplete,
        ),
      ).length;

      // Find current lesson in student's actual section
      let currentLesson: string | undefined;
      let currentLessonNumber: number | undefined;

      const sortedLessons = [...studentSectionLessons].sort((a, b) => {
        const aNum = parseInt(a.unitLessonId.split(".")[1] || "0");
        const bNum = parseInt(b.unitLessonId.split(".")[1] || "0");
        return aNum - bNum;
      });

      for (const lesson of sortedLessons) {
        const isComplete = progressData.some(
          (p) =>
            p.studentId === studentId &&
            p.podsieAssignmentId === lesson.podsieAssignmentId &&
            p.isFullyComplete,
        );
        if (!isComplete) {
          const lessonPart =
            lesson.unitLessonId.split(".")[1] || lesson.unitLessonId;
          const isRampUp = lessonPart.toUpperCase().startsWith("RU");
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
        currentSubsection: studentCurrentSubsection,
      };

      // If student has no currentLessonNumber, they've completed the unit entirely
      // Don't add them to any zone - add to completedStudentNames instead
      if (currentLessonNumber === undefined) {
        const nameParts = student.name.split(" ");
        const displayName =
          nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
        completedStudentNames.push(displayName);
        completedStudentIds.push(studentId);
        continue;
      }

      // Categorize the student based on position difference from expected
      // unitsAheadOrBehind: positive = ahead, negative = behind
      if (unitsAheadOrBehind >= 2) {
        status.status = "far-ahead";
        farAhead.push(status);
      } else if (unitsAheadOrBehind === 1) {
        status.status = "ahead";
        ahead.push(status);
      } else if (unitsAheadOrBehind <= -2) {
        status.status = "far-behind";
        farBehind.push(status);
      } else if (unitsAheadOrBehind === -1) {
        status.status = "behind";
        behind.push(status);
      } else {
        status.status = "on-track";
        onTrack.push(status);
      }
    }

    // Sort on-track by lesson number
    onTrack.sort(
      (a, b) => (a.currentLessonNumber || 0) - (b.currentLessonNumber || 0),
    );

    // Build maps of student counts and names per section and per lesson
    // Note: completed students are already in completedStudentNames and NOT in these arrays
    const allStudents = [
      ...farBehind,
      ...behind,
      ...onTrack,
      ...ahead,
      ...farAhead,
    ];
    const studentCountBySection = new Map<string, number>();
    const studentCountByLesson = new Map<string, number>(); // key: "sectionId:lessonNumber"
    const studentNamesByLesson = new Map<string, string[]>(); // key: "sectionId:lessonNumber"
    const studentInfoByLesson = new Map<string, StudentLessonInfo[]>(); // key: "sectionId:lessonNumber"

    // Calculate today and yesterday dates for completion tracking (local timezone)
    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;

    // Pre-calculate completions and activity per student (today/yesterday)
    // IMPORTANT: Only count questions from mastery-check assignments, not sidekicks
    interface StudentActivityData {
      completedToday: number;
      completedYesterday: number;
      smallGroupToday: boolean;
      smallGroupYesterday: boolean;
      inquiryToday: boolean;
      inquiryYesterday: boolean;
    }

    // Build a set of mastery-check assignment IDs for filtering
    const masteryCheckAssignmentIds = new Set(
      lessons
        .filter((l) => l.activityType === "mastery-check")
        .map((l) => l.podsieAssignmentId)
        .filter(Boolean),
    );

    const studentCompletions = new Map<string, StudentActivityData>();
    for (const student of allStudents) {
      const studentProgress = progressData.filter(
        (p) => p.studentId === student.studentId,
      );
      let completedToday = 0;
      let completedYesterday = 0;
      let smallGroupToday = false;
      let smallGroupYesterday = false;
      let inquiryToday = false;
      let inquiryYesterday = false;

      for (const progress of studentProgress) {
        // Get activity data from progress (comes from classActivities in student doc)
        if (progress.smallGroupToday) smallGroupToday = true;
        if (progress.smallGroupYesterday) smallGroupYesterday = true;
        if (progress.inquiryToday) inquiryToday = true;
        if (progress.inquiryYesterday) inquiryYesterday = true;

        // Only count questions from mastery-check assignments
        if (
          !progress.podsieAssignmentId ||
          !masteryCheckAssignmentIds.has(progress.podsieAssignmentId)
        )
          continue;

        for (const q of progress.questions) {
          if (q.completed && q.completedAt) {
            const completedDate = q.completedAt.split("T")[0];
            if (completedDate === todayStr) {
              completedToday++;
            } else if (completedDate === yesterdayStr) {
              completedYesterday++;
            }
          }
        }
      }
      studentCompletions.set(student.studentId, {
        completedToday,
        completedYesterday,
        smallGroupToday,
        smallGroupYesterday,
        inquiryToday,
        inquiryYesterday,
      });
    }

    for (const student of allStudents) {
      if (student.currentSection && student.currentLessonNumber !== undefined) {
        const normalizedSection = normalizeSection(student.currentSection);
        // Build section:subsection key for accurate counting
        const sectionSubsectionKey =
          student.currentSubsection !== undefined
            ? `${normalizedSection}:${student.currentSubsection}`
            : normalizedSection;
        // Count students in their section/subsection
        studentCountBySection.set(
          sectionSubsectionKey,
          (studentCountBySection.get(sectionSubsectionKey) || 0) + 1,
        );
        const lessonKey = `${normalizedSection}:${student.currentLessonNumber}`;
        studentCountByLesson.set(
          lessonKey,
          (studentCountByLesson.get(lessonKey) || 0) + 1,
        );
        // Extract first name and first letter of last name (e.g., "John D.")
        const nameParts = student.studentName.split(" ");
        const displayName =
          nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
        const existingNames = studentNamesByLesson.get(lessonKey) || [];
        existingNames.push(displayName);
        studentNamesByLesson.set(lessonKey, existingNames);

        // Add student info with completion and activity data
        const activityData = studentCompletions.get(student.studentId) || {
          completedToday: 0,
          completedYesterday: 0,
          smallGroupToday: false,
          smallGroupYesterday: false,
          inquiryToday: false,
          inquiryYesterday: false,
        };
        const existingStudentInfo = studentInfoByLesson.get(lessonKey) || [];
        existingStudentInfo.push({
          name: displayName,
          completedToday: activityData.completedToday,
          completedYesterday: activityData.completedYesterday,
          smallGroupToday: activityData.smallGroupToday,
          smallGroupYesterday: activityData.smallGroupYesterday,
          inquiryToday: activityData.inquiryToday,
          inquiryYesterday: activityData.inquiryYesterday,
        });
        studentInfoByLesson.set(lessonKey, existingStudentInfo);
      }
    }

    // Build activity data for completed students
    // Only count questions from mastery-check assignments (same as active students)
    const completedStudentInfos: StudentLessonInfo[] = completedStudentIds.map(
      (studentId, index) => {
        const studentProgress = progressData.filter(
          (p) => p.studentId === studentId,
        );
        let completedToday = 0;
        let completedYesterday = 0;
        let smallGroupToday = false;
        let smallGroupYesterday = false;
        let inquiryToday = false;
        let inquiryYesterday = false;

        for (const progress of studentProgress) {
          if (progress.smallGroupToday) smallGroupToday = true;
          if (progress.smallGroupYesterday) smallGroupYesterday = true;
          if (progress.inquiryToday) inquiryToday = true;
          if (progress.inquiryYesterday) inquiryYesterday = true;

          // Only count questions from mastery-check assignments
          if (
            !progress.podsieAssignmentId ||
            !masteryCheckAssignmentIds.has(progress.podsieAssignmentId)
          )
            continue;

          for (const q of progress.questions) {
            if (q.completed && q.completedAt) {
              const completedDate = q.completedAt.split("T")[0];
              if (completedDate === todayStr) {
                completedToday++;
              } else if (completedDate === yesterdayStr) {
                completedYesterday++;
              }
            }
          }
        }

        return {
          name: completedStudentNames[index],
          completedToday,
          completedYesterday,
          smallGroupToday,
          smallGroupYesterday,
          inquiryToday,
          inquiryYesterday,
        };
      },
    );

    const completedStudents: CompletedStudentInfo = {
      count: completedStudentNames.length,
      studentNames: completedStudentNames,
      students: completedStudentInfos,
    };

    // Build unit sections for visualization - use lessons prop (same as PacingZoneCard)
    // Now that students are categorized, we can include student counts per section
    // Exclude Unit Assessment from the progress bar, and Ramp Ups if excludeRampUps is true
    const unitSections: UnitSectionInfo[] = unitSchedule.sections
      .filter((scheduleSection) => {
        const normalizedId = normalizeSection(scheduleSection.sectionId);
        if (normalizedId === "Unit Assessment") return false;
        if (excludeRampUps && normalizedId === "Ramp Ups") return false;
        return true;
      })
      .map((scheduleSection) => {
        const normalizedSectionId = normalizeSection(scheduleSection.sectionId);
        // Get lessons for this specific section AND subsection
        const lessonsForSection = getLessonsForSectionSubsection(
          normalizedSectionId,
          scheduleSection.subsection,
        );
        const sectionLessons = lessonsForSection
          .map((l) => {
            // Parse lesson number from unitLessonId (e.g., "3.15" -> 15, "3.RU1" -> 1)
            const parts = l.unitLessonId.split(".");
            const lessonPart = parts[1] || parts[0];
            const isRampUp = lessonPart.toUpperCase().startsWith("RU");
            const lessonNum = isRampUp
              ? parseInt(lessonPart.substring(2)) || 0
              : parseInt(lessonPart) || 0;

            // Get student count and names for this specific lesson
            const lessonKey = `${normalizedSectionId}:${lessonNum}`;
            const lessonStudentCount = studentCountByLesson.get(lessonKey) || 0;
            const lessonStudentNames =
              studentNamesByLesson.get(lessonKey) || [];
            const lessonStudents = studentInfoByLesson.get(lessonKey) || [];

            return {
              lessonId: l.unitLessonId,
              lessonNumber: lessonNum,
              lessonName: isRampUp ? `RU ${lessonNum}` : `Lesson ${lessonNum}`,
              studentCount: lessonStudentCount,
              studentNames: lessonStudentNames,
              students: lessonStudents,
            };
          })
          .sort((a, b) => a.lessonNumber - b.lessonNumber);

        // Determine zone for this section/subsection using position-based calculation
        // Each subsection is treated as its own unit for ahead/behind math
        const sectionSubsectionKey =
          scheduleSection.subsection !== undefined
            ? `${normalizedSectionId}:${scheduleSection.subsection}`
            : normalizedSectionId;

        // Get student count from the map using section:subsection key
        const studentCount =
          studentCountBySection.get(sectionSubsectionKey) || 0;
        const sectionIndex = orderedSectionSubsections.findIndex(
          (s) => s.key === sectionSubsectionKey,
        );
        const zone = getZoneForPosition(sectionIndex);

        // Use plannedDays from the schedule (not calculated from dates)
        const dayCount = scheduleSection.plannedDays || 0;

        // Check if this is the expected section/subsection (both must match)
        const isThisExpected =
          normalizedSectionId === expectedSection &&
          scheduleSection.subsection === expectedSubsection;

        return {
          sectionId: normalizedSectionId,
          sectionName: scheduleSection.name || normalizedSectionId,
          subsection: scheduleSection.subsection,
          lessonCount: sectionLessons.length,
          dayCount,
          startDate: scheduleSection.startDate || null,
          endDate: scheduleSection.endDate || null,
          studentCount,
          isExpected: isThisExpected,
          zone,
          lessons: sectionLessons,
        };
      })
      // Filter out empty subsections (subsections with no lessons assigned)
      // Optionally hide far-behind sections with no students (to reduce visual clutter)
      .filter((section) => {
        if (section.lessonCount === 0) return false;
        if (
          hideEmptySections &&
          section.zone === "far-behind" &&
          section.studentCount === 0
        )
          return false;
        return true;
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
  }, [
    unitSchedules,
    selectedUnit,
    lessons,
    progressData,
    loading,
    error,
    excludeRampUps,
    pacingDate,
    hideEmptySections,
  ]);

  return pacingData;
}
