"use client";

import React, { useState, useEffect } from "react";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getSectionVelocityByDateRange, type DailyVelocityStats } from "@/app/actions/313/velocity/velocity";
import { getDaysOff } from "@/app/actions/calendar/school-calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import { VelocityGraph } from "./components/VelocityGraph";
import { SectionSelector } from "./components/SectionSelector";
import { MonthCalendar } from "./components/MonthCalendar";
import { VelocityLegend } from "./components/VelocityLegend";
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
}

export default function VelocityPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [velocityData, setVelocityData] = useState<Map<string, DailyVelocityStats[]>>(new Map());
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVelocity, setLoadingVelocity] = useState(false);
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());

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
      return;
    }

    const loadVelocityData = async () => {
      setLoadingVelocity(true);
      try {
        // Fetch data for entire school year (September to June)
        const schoolYearStart = new Date(2025, 8, 1); // September 1, 2025
        const schoolYearEnd = new Date(2026, 5, 30); // June 30, 2026

        const startDate = schoolYearStart.toISOString().split("T")[0];
        const endDate = schoolYearEnd.toISOString().split("T")[0];

        const newVelocityData = new Map<string, DailyVelocityStats[]>();

        // Fetch velocity data for each selected section
        await Promise.all(
          selectedSections.map(async (sectionId) => {
            const section = sectionOptions.find((s) => s.id === sectionId);
            if (!section) return;

            const result = await getSectionVelocityByDateRange(
              section.classSection,
              section.school,
              startDate,
              endDate
            );

            if (result.success && result.data) {
              newVelocityData.set(sectionId, result.data);
            }
          })
        );

        setVelocityData(newVelocityData);
      } catch (error) {
        console.error("Error loading velocity data:", error);
      } finally {
        setLoadingVelocity(false);
      }
    };

    loadVelocityData();
  }, [selectedSections, sectionOptions]);

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
              {loadingVelocity && <span className="ml-2 text-blue-600">Loading data...</span>}
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
            {selectedSections.length > 0 && (
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
                startDate={graphStartDate}
                endDate={graphEndDate}
                onStartDateChange={setGraphStartDate}
                onEndDateChange={setGraphEndDate}
                daysOff={daysOff}
              />
            )}

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow px-4 py-3">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-lg font-medium">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Calendars for each selected section */}
            {selectedSections.map((sectionId) => {
              const section = sectionOptions.find((s) => s.id === sectionId);

              return (
                <div key={sectionId} className="mb-8">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-bold text-gray-900">
                        {section?.classSection}
                      </h2>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                        {section?.school}
                      </span>
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
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <VelocityLegend />
          </>
        )}
      </div>
    </div>
  );
}
