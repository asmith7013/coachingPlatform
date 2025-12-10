"use client";

import React, { useState, useEffect } from "react";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getSectionVelocityByDateRange, type DailyVelocityStats, type StudentDailyData } from "@/app/actions/313/velocity/velocity";
import { getDaysOff } from "@/app/actions/calendar/school-calendar";
import { fetchSectionUnitSchedules } from "@/app/actions/calendar/unit-schedule";
import type { UnitSchedule } from "@zod-schema/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import { VelocityGraph } from "./components/VelocityGraph";
import { StudentVelocityGraph } from "./components/StudentVelocityGraph";
import { SectionSelector } from "./components/SectionSelector";
import { MonthCalendar } from "./components/MonthCalendar";
import { SectionDetailTable } from "./components/SectionDetailTable";
import { ExportCsvModal } from "./components/ExportCsvModal";
import { SectionAccordion } from "./components/SectionAccordion";
import { getSectionColors } from "./utils/colors";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Section option type
interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  displayName: string;
  scopeSequenceTag?: string;
}

export default function VelocityPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [velocityData, setVelocityData] = useState<Map<string, DailyVelocityStats[]>>(new Map());
  const [detailData, setDetailData] = useState<Map<string, StudentDailyData[]>>(new Map());
  const [unitScheduleData, setUnitScheduleData] = useState<Map<string, UnitSchedule[]>>(new Map());
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSectionIds, setLoadingSectionIds] = useState<Set<string>>(new Set());
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());
  const [includeNotTracked, setIncludeNotTracked] = useState(true);
  const [showRampUps, setShowRampUps] = useState(true);
  const [showSidekicks, setShowSidekicks] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Graph date filters - default to 9/1/25 to today
  const [graphStartDate, setGraphStartDate] = useState("2025-09-01");
  const [graphEndDate, setGraphEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Current month for calendar navigation - default to current month
  // The displayed range will be: [currentMonth - 1, currentMonth]
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Load section options and days off
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [sectionsResult, daysOffResult] = await Promise.all([
          getAllSectionConfigs(),
          getDaysOff(schoolYear),
        ]);

        if (sectionsResult.success && sectionsResult.data) {
          const options: SectionOption[] = [];
          sectionsResult.data.forEach((schoolGroup) => {
            schoolGroup.sections.forEach((section) => {
              options.push({
                id: section.id,
                school: schoolGroup.school,
                classSection: section.classSection,
                teacher: section.teacher,
                gradeLevel: section.gradeLevel,
                scopeSequenceTag: section.scopeSequenceTag,
                // Display name without school for selector (school is already the group header)
                displayName: section.teacher ? `${section.classSection} (${section.teacher})` : section.classSection,
              });
            });
          });
          setSectionOptions(options);

          // Compute colors for all sections
          const colors = getSectionColors(options);
          setSectionColors(colors);
        }

        if (daysOffResult.success && daysOffResult.data) {
          setDaysOff(daysOffResult.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [schoolYear]);

  // Load velocity data when sections change
  useEffect(() => {
    if (selectedSections.length === 0) {
      setVelocityData(new Map());
      setDetailData(new Map());
      setUnitScheduleData(new Map());
      return;
    }

    const loadVelocityData = async () => {
      // Fetch data for entire school year (September to June)
      const schoolYearStart = new Date(2025, 8, 1); // September 1, 2025
      const schoolYearEnd = new Date(2026, 5, 30); // June 30, 2026

      const startDate = schoolYearStart.toISOString().split("T")[0];
      const endDate = schoolYearEnd.toISOString().split("T")[0];

      // Determine which sections need to be loaded
      // (newly selected or need refresh due to includeNotTracked change)
      const sectionsToLoad = selectedSections.filter(
        (sectionId) => !velocityData.has(sectionId)
      );

      // If includeNotTracked changed, reload all sections
      const needsFullReload = selectedSections.some(
        (sectionId) => velocityData.has(sectionId)
      ) && sectionsToLoad.length === 0;

      const sectionsToFetch = needsFullReload ? selectedSections : sectionsToLoad;

      if (sectionsToFetch.length === 0) return;

      // Mark sections as loading
      setLoadingSectionIds((prev) => {
        const next = new Set(prev);
        sectionsToFetch.forEach((id) => next.add(id));
        return next;
      });

      try {
        // Fetch velocity and detail data for each section that needs loading
        await Promise.all(
          sectionsToFetch.map(async (sectionId) => {
            const section = sectionOptions.find((s) => s.id === sectionId);
            if (!section) return;

            // Fetch velocity data with student details included
            const velocityResult = await getSectionVelocityByDateRange(
              section.classSection,
              section.school,
              startDate,
              endDate,
              includeNotTracked,
              true // includeStudentDetails
            );

            if (velocityResult.success && velocityResult.data) {
              // Update velocity data incrementally
              setVelocityData((prev) => {
                const next = new Map(prev);
                next.set(sectionId, velocityResult.data!);
                return next;
              });

              // Update detail data incrementally
              if (velocityResult.studentDetails) {
                setDetailData((prev) => {
                  const next = new Map(prev);
                  next.set(sectionId, velocityResult.studentDetails!);
                  return next;
                });
              }
            }

            // Fetch unit schedules for this section
            const unitResult = await fetchSectionUnitSchedules(
              schoolYear,
              section.gradeLevel,
              section.school,
              section.classSection
            );
            if (unitResult.success && unitResult.data) {
              setUnitScheduleData((prev) => {
                const next = new Map(prev);
                next.set(sectionId, unitResult.data!);
                return next;
              });
            }

            // Remove from loading set when done
            setLoadingSectionIds((prev) => {
              const next = new Set(prev);
              next.delete(sectionId);
              return next;
            });
          })
        );
      } catch (error) {
        console.error("Error loading velocity data:", error);
        // Clear loading state on error
        setLoadingSectionIds(new Set());
      }
    };

    loadVelocityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSections, sectionOptions]);

  // Reload all data when includeNotTracked changes
  useEffect(() => {
    if (selectedSections.length === 0) return;

    const reloadAllData = async () => {
      const schoolYearStart = new Date(2025, 8, 1);
      const schoolYearEnd = new Date(2026, 5, 30);
      const startDate = schoolYearStart.toISOString().split("T")[0];
      const endDate = schoolYearEnd.toISOString().split("T")[0];

      // Mark all sections as loading
      setLoadingSectionIds(new Set(selectedSections));

      try {
        await Promise.all(
          selectedSections.map(async (sectionId) => {
            const section = sectionOptions.find((s) => s.id === sectionId);
            if (!section) return;

            const velocityResult = await getSectionVelocityByDateRange(
              section.classSection,
              section.school,
              startDate,
              endDate,
              includeNotTracked,
              true
            );

            if (velocityResult.success && velocityResult.data) {
              setVelocityData((prev) => {
                const next = new Map(prev);
                next.set(sectionId, velocityResult.data!);
                return next;
              });

              if (velocityResult.studentDetails) {
                setDetailData((prev) => {
                  const next = new Map(prev);
                  next.set(sectionId, velocityResult.studentDetails!);
                  return next;
                });
              }
            }

            setLoadingSectionIds((prev) => {
              const next = new Set(prev);
              next.delete(sectionId);
              return next;
            });
          })
        );
      } catch (error) {
        console.error("Error reloading velocity data:", error);
        setLoadingSectionIds(new Set());
      }
    };

    reloadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeNotTracked]);

  // Handle section selection
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const isDayOff = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return daysOff.includes(dateStr);
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get velocity stats for a specific date and section
  const getVelocityForDate = (sectionId: string, dateStr: string): DailyVelocityStats | null => {
    const sectionData = velocityData.get(sectionId);
    if (!sectionData) return null;
    return sectionData.find((d) => d.date === dateStr) || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" variant="primary" />
          <p className="text-gray-500">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Velocity Tracker</h1>
            <p className="text-sm text-gray-500">
              {schoolYear} School Year
              {loadingSectionIds.size > 0 && <span className="ml-2 text-blue-600">Loading data...</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Section selector */}
        <SectionSelector
          sections={sectionOptions}
          selectedSections={selectedSections}
          onToggle={handleSectionToggle}
          sectionColors={sectionColors}
          onExportClick={() => setExportModalOpen(true)}
        />

        {/* Export CSV Modal */}
        <ExportCsvModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          sections={sectionOptions}
          selectedSections={selectedSections}
          velocityData={velocityData}
          detailData={detailData}
          startDate={graphStartDate}
          endDate={graphEndDate}
        />

        {selectedSections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Selected</h3>
              <p className="text-gray-500">
                Select one or more sections above to view velocity graphs, calendars, and track class progress over time.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Combined Velocity Graph for all selected sections */}
            {selectedSections.length > 0 && (() => {
              // Check if all selected sections share the same scopeSequenceTag and gradeLevel
              const selectedSectionDetails = selectedSections
                .map((id) => sectionOptions.find((s) => s.id === id))
                .filter((s): s is SectionOption => s !== undefined);

              const firstSection = selectedSectionDetails[0];
              const allSameScopeAndGrade = selectedSectionDetails.every(
                (s) => s.scopeSequenceTag === firstSection?.scopeSequenceTag &&
                       s.gradeLevel === firstSection?.gradeLevel &&
                       firstSection?.scopeSequenceTag // Must have a scopeSequenceTag
              );

              // If all sections share the same scope/grade, get the unit schedules from any of them
              const sharedUnitSchedules = allSameScopeAndGrade && selectedSections.length > 0
                ? unitScheduleData.get(selectedSections[0])
                : undefined;

              return (
              <VelocityGraph
                sections={selectedSections
                  .map((sectionId) => {
                    const section = sectionOptions.find((s) => s.id === sectionId);
                    const data = velocityData.get(sectionId);
                    if (!section || !data || data.length === 0) return null;
                    return {
                      id: sectionId,
                      name: `${section.school} - ${section.displayName}`,
                      shortName: section.classSection,
                      data,
                      color: sectionColors.get(sectionId) || '#6B7280',
                    };
                  })
                  .filter((s) => s !== null)}
                loadingSections={selectedSections
                  .filter((sectionId) => loadingSectionIds.has(sectionId))
                  .map((sectionId) => {
                    const section = sectionOptions.find((s) => s.id === sectionId);
                    return {
                      id: sectionId,
                      shortName: section?.classSection || sectionId,
                      color: sectionColors.get(sectionId) || '#6B7280',
                    };
                  })}
                startDate={graphStartDate}
                endDate={graphEndDate}
                onStartDateChange={setGraphStartDate}
                onEndDateChange={setGraphEndDate}
                daysOff={daysOff}
                includeNotTracked={includeNotTracked}
                onIncludeNotTrackedChange={setIncludeNotTracked}
                showRampUps={showRampUps}
                onShowRampUpsChange={setShowRampUps}
                showSidekicks={showSidekicks}
                onShowSidekicksChange={setShowSidekicks}
                unitSchedules={sharedUnitSchedules}
              />
              );
            })()}

            {/* Section Details with Accordions */}
            {[...selectedSections].sort((a, b) => {
              // Extract section number from ID (e.g., "IS313-601" -> 601)
              const numA = parseInt(a.split('-').pop() || '0', 10);
              const numB = parseInt(b.split('-').pop() || '0', 10);
              return numA - numB;
            }).map((sectionId) => {
              const section = sectionOptions.find((s) => s.id === sectionId);
              const isLoading = loadingSectionIds.has(sectionId);
              const hasData = velocityData.has(sectionId) && (velocityData.get(sectionId)?.length ?? 0) > 0;
              const students = detailData.get(sectionId);
              const sectionVelocityData = velocityData.get(sectionId);

              if (!section) return null;

              // Build block types map from velocity data
              const blockTypes = new Map<string, 'single' | 'double' | 'none'>();
              sectionVelocityData?.forEach((stat) => {
                blockTypes.set(stat.date, stat.blockType);
              });

              // Generate date range from graph start to graph end
              const dates: string[] = [];
              const current = new Date(graphStartDate);
              const end = new Date(graphEndDate);
              while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
              }

              // Get unit schedules for this section
              const sectionUnitSchedules = unitScheduleData.get(sectionId);

              // Student Graph Content
              const studentGraphContent = (isLoading && !students) ? (
                <div className="animate-pulse h-64 bg-gray-100 rounded" />
              ) : (students && sectionVelocityData) ? (
                <StudentVelocityGraph
                  sectionName={section.classSection}
                  school={section.school}
                  students={students}
                  velocityData={sectionVelocityData}
                  startDate={graphStartDate}
                  endDate={graphEndDate}
                  daysOff={daysOff}
                  showRampUps={showRampUps}
                  onShowRampUpsChange={setShowRampUps}
                  includeNotTracked={includeNotTracked}
                  onIncludeNotTrackedChange={setIncludeNotTracked}
                  embedded
                  unitSchedules={sectionUnitSchedules}
                />
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              );

              // Calendar Content with month navigation
              const calendarContent = (isLoading && !hasData) ? (
                <div>
                  {/* Month navigation skeleton */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-pulse h-8 w-48 bg-gray-200 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 35 }).map((_, j) => (
                            <div key={j} className="h-8 bg-gray-100 rounded"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Month navigation */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-medium min-w-[200px] text-center">
                      {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[-1, 0].map((offset) => {
                      const monthDate = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + offset,
                        1
                      );
                      return (
                        <MonthCalendar
                          key={monthDate.toISOString()}
                          monthDate={monthDate}
                          sectionId={sectionId}
                          getVelocityForDate={getVelocityForDate}
                          isDayOff={isDayOff}
                          isWeekend={isWeekend}
                          showRampUps={showRampUps}
                        />
                      );
                    })}
                  </div>
                </div>
              );

              // Student Table Content
              const studentTableContent = (isLoading && (!students || !sectionVelocityData)) ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-8 bg-gray-100 rounded w-32"></div>
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: 20 }).map((_, j) => (
                          <div key={j} className="h-8 w-8 bg-gray-100 rounded"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (students && sectionVelocityData) ? (
                <SectionDetailTable
                  sectionName={section.classSection}
                  school={section.school}
                  students={students}
                  dates={dates}
                  blockTypes={blockTypes}
                  daysOff={daysOff}
                  showRampUps={showRampUps}
                  embedded
                />
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              );

              return (
                <SectionAccordion
                  key={sectionId}
                  sectionName={section.classSection}
                  school={section.school}
                  color={sectionColors.get(sectionId)}
                  isLoading={isLoading}
                  studentGraphContent={studentGraphContent}
                  calendarContent={calendarContent}
                  studentTableContent={studentTableContent}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
