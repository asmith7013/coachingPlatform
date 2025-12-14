"use client";

import React, { useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import {
  SectionVisualizationLayout,
  SectionAccordion,
  type SectionOption,
  type AccordionItemConfig,
} from "@/components/composed/section-visualization";
import { RoadmapBarChart } from "./components/RoadmapBarChart";
import { SectionComparisonChart } from "./components/SectionComparisonChart";
import { useSectionOptions, useRoadmapData } from "./hooks";

export default function RoadmapCompletionsPage() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // Data fetching with React Query hooks
  const { sectionOptions, sectionColors, loading } = useSectionOptions();
  const { roadmapData, loadingSectionIds } = useRoadmapData(selectedSections);

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
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
        content: isLoading && !data ? (
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
