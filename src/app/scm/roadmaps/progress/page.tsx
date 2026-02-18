"use client";

import React, { useMemo } from "react";
import { ChartBarIcon, CalendarIcon } from "@heroicons/react/24/outline";
import {
  SectionVisualizationLayout,
  SectionAccordion,
  type SectionOption,
  type AccordionItemConfig,
} from "@/components/composed/section-visualization";
import { RoadmapBarChart } from "./components/RoadmapBarChart";
import { SectionComparisonChart } from "./components/SectionComparisonChart";
import { useSectionOptions, useRoadmapData } from "@/hooks/scm";
import type { DateRange } from "@/hooks/scm/roadmaps/useRoadmapData";
import { useUrlSyncedState } from "@/hooks/scm/useUrlSyncedState";

// Default date range: Sept 1, 2025 to today
const DEFAULT_START_DATE = "2025-09-01";
const getDefaultEndDate = () => new Date().toISOString().split("T")[0];

export default function RoadmapCompletionsPage() {
  const [sectionsParam, setSectionsParam] = useUrlSyncedState("sections", {
    storageKey: "scm-progress-sections",
  });
  const selectedSections = sectionsParam
    ? sectionsParam.split(",").filter(Boolean)
    : [];
  const [startDate, setStartDate] = useUrlSyncedState("start", {
    storageKey: "scm-progress-start",
  });
  const [endDate, setEndDate] = useUrlSyncedState("end", {
    storageKey: "scm-progress-end",
  });
  // Use defaults when URL/localStorage are empty
  const effectiveStartDate = startDate || DEFAULT_START_DATE;
  const effectiveEndDate = endDate || getDefaultEndDate();

  // Memoize date range to avoid unnecessary re-renders
  const dateRange: DateRange = useMemo(
    () => ({ startDate: effectiveStartDate, endDate: effectiveEndDate }),
    [effectiveStartDate, effectiveEndDate],
  );

  // Data fetching with React Query hooks
  const { sectionOptions, sectionColors, loading } = useSectionOptions();
  const { roadmapData, loadingSectionIds } = useRoadmapData(
    selectedSections,
    dateRange,
  );

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    const updated = selectedSections.includes(sectionId)
      ? selectedSections.filter((id) => id !== sectionId)
      : [...selectedSections, sectionId];
    setSectionsParam(updated.join(","));
  };

  // Render section content using the shared SectionAccordion
  const renderSectionContent = (sectionId: string, section: SectionOption) => {
    const data = roadmapData.get(sectionId);
    const isLoading = loadingSectionIds.has(sectionId);
    const color = sectionColors.get(sectionId) || "#6B7280";

    // Build accordion items
    const accordionItems: AccordionItemConfig[] = [
      {
        key: "bar-chart",
        title: "Skills Mastered Bar Chart",
        icon: <ChartBarIcon className="h-5 w-5 text-gray-400" />,
        content:
          isLoading && !data ? (
            <div className="animate-pulse h-64 bg-gray-100 rounded" />
          ) : data ? (
            <RoadmapBarChart
              sectionName={data.classSection}
              school={data.school}
              students={data.students}
              color={color}
              teacher={data.teacher}
              className="shadow-none mb-0"
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
        isLoading={isLoading && !data}
        items={accordionItems}
        defaultOpenItems={["bar-chart"]}
      />
    );
  };

  // Date range filter component
  const dateRangeFilter = (
    <div className="flex items-center gap-3">
      <CalendarIcon className="h-5 w-5 text-gray-400" />
      <div className="flex items-center gap-2">
        <label htmlFor="startDate" className="text-sm text-gray-600">
          From:
        </label>
        <input
          type="date"
          id="startDate"
          value={effectiveStartDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="endDate" className="text-sm text-gray-600">
          To:
        </label>
        <input
          type="date"
          id="endDate"
          value={effectiveEndDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  return (
    <SectionVisualizationLayout
      title="Roadmap Completions"
      subtitle="Skills mastered through practice (post-diagnostic)"
      sectionOptions={sectionOptions}
      selectedSections={selectedSections}
      onSectionToggle={handleSectionToggle}
      sectionColors={sectionColors}
      isLoading={loading}
      loadingSectionIds={loadingSectionIds}
      headerActions={dateRangeFilter}
      sharedVisualization={
        selectedSections.length > 0 && (
          <SectionComparisonChart
            sections={[...selectedSections]
              .sort((a, b) => {
                const indexA = sectionOptions.findIndex((s) => s.id === a);
                const indexB = sectionOptions.findIndex((s) => s.id === b);
                return indexA - indexB;
              })
              .map((sectionId) => {
                const section = sectionOptions.find((s) => s.id === sectionId);
                return {
                  sectionId,
                  sectionName: section?.classSection || sectionId,
                  data: roadmapData.get(sectionId),
                };
              })}
          />
        )
      }
      renderSectionContent={renderSectionContent}
      emptyStateMessage="No Sections Selected"
      emptyStateDescription="Select one or more sections above to view roadmap skill mastery for each student."
    />
  );
}
