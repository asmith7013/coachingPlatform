"use client";

import React, { useState } from "react";
import type { DailyVelocityStats } from "@/app/actions/scm/velocity/velocity";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { VelocityGraph } from "./components/VelocityGraph";
import { StudentVelocityGraph } from "./components/StudentVelocityGraph";
import { MonthCalendar } from "./components/MonthCalendar";
import { SectionDetailTable } from "./components/SectionDetailTable";
import { ExportCsvModal } from "./components/ExportCsvModal";
import { StudentGraphLegend, CalendarLegend, TableLegend } from "./components/VelocityLegend";
import {
  SectionVisualizationLayout,
  SectionAccordion,
  type SectionOption,
  type AccordionItemConfig,
} from "@/components/composed/section-visualization";
import { useSectionOptions, useDaysOff, useVelocityData } from "@/hooks/scm";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

export default function VelocityPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Data fetching with React Query hooks
  const {
    sectionOptions,
    sectionColors,
    loading: loadingSections,
  } = useSectionOptions();

  const { daysOff } = useDaysOff(schoolYear);

  const {
    velocityData,
    detailData,
    unitScheduleData,
    loadingSectionIds,
  } = useVelocityData(selectedSections, sectionOptions, schoolYear, includeNotTracked);

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

  // Build shared visualization (VelocityGraph) for all selected sections
  const buildSharedVisualization = () => {
    if (selectedSections.length === 0) return null;

    // Check if all selected sections share the same scopeSequenceTag and gradeLevel
    const selectedSectionDetails = selectedSections
      .map((id) => sectionOptions.find((s) => s.id === id))
      .filter((s): s is SectionOption => s !== undefined);

    const firstSection = selectedSectionDetails[0];
    const allSameScopeAndGrade = selectedSectionDetails.every(
      (s) => s.scopeSequenceTag === firstSection?.scopeSequenceTag &&
             s.gradeLevel === firstSection?.gradeLevel &&
             firstSection?.scopeSequenceTag
    );

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
  };

  // Render section content (accordion items)
  const renderSectionContent = (sectionId: string, section: SectionOption) => {
    const isLoading = loadingSectionIds.has(sectionId);
    const hasData = velocityData.has(sectionId) && (velocityData.get(sectionId)?.length ?? 0) > 0;
    const students = detailData.get(sectionId);
    const sectionVelocityData = velocityData.get(sectionId);
    const color = sectionColors.get(sectionId) || "#6B7280";

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

    // Build accordion items
    const accordionItems: AccordionItemConfig[] = [
      {
        key: "graph",
        title: "Student Velocity Rolling 3-Day Average",
        icon: <ChartBarIcon className="h-5 w-5 text-gray-400" />,
        legend: <StudentGraphLegend />,
        content: (isLoading && !students) ? (
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
        ),
      },
      {
        key: "calendar",
        title: "Calendar View",
        icon: <CalendarDaysIcon className="h-5 w-5 text-gray-400" />,
        legend: <CalendarLegend />,
        content: (isLoading && !hasData) ? (
          <div>
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
        ),
      },
      {
        key: "table",
        title: "Student Detail Table",
        icon: <TableCellsIcon className="h-5 w-5 text-gray-400" />,
        legend: <TableLegend />,
        content: (isLoading && (!students || !sectionVelocityData)) ? (
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
        ),
      },
    ];

    return (
      <SectionAccordion
        sectionName={section.classSection}
        school={section.school}
        color={color}
        isLoading={isLoading && !hasData}
        items={accordionItems}
      />
    );
  };

  return (
    <SectionVisualizationLayout
      title="Class Velocity Tracker"
      subtitle={`${schoolYear} School Year`}
      sectionOptions={sectionOptions}
      selectedSections={selectedSections}
      onSectionToggle={handleSectionToggle}
      sectionColors={sectionColors}
      isLoading={loadingSections}
      loadingSectionIds={loadingSectionIds}
      sharedVisualization={buildSharedVisualization()}
      renderSectionContent={renderSectionContent}
      selectorActions={
        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 h-fit text-sm font-medium rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export CSV
        </button>
      }
      afterSelector={
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
      }
      emptyStateMessage="No Sections Selected"
      emptyStateDescription="Select one or more sections above to view velocity graphs, calendars, and track class progress over time."
    />
  );
}
