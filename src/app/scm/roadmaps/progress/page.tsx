"use client";

import React, { useState, useEffect } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getRoadmapCompletionsBySection, type SectionRoadmapData } from "@/app/actions/313/roadmap-completions";
import { getSectionColors } from "../../podsie/velocity/utils/colors";
import {
  SectionVisualizationLayout,
  SectionAccordion,
  type SectionOption,
  type AccordionItemConfig,
} from "@/components/composed/section-visualization";
import { RoadmapBarChart } from "./components/RoadmapBarChart";
import { SectionComparisonChart } from "./components/SectionComparisonChart";

export default function RoadmapCompletionsPage() {
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [roadmapData, setRoadmapData] = useState<Map<string, SectionRoadmapData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingSectionIds, setLoadingSectionIds] = useState<Set<string>>(new Set());
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());

  // Load section options on mount
  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const result = await getAllSectionConfigs();
        if (result.success && result.data) {
          const options: SectionOption[] = [];
          result.data.forEach((schoolGroup) => {
            schoolGroup.sections.forEach((section) => {
              options.push({
                id: section.id,
                school: schoolGroup.school,
                classSection: section.classSection,
                teacher: section.teacher,
                gradeLevel: section.gradeLevel,
                displayName: section.teacher
                  ? `${section.classSection} (${section.teacher})`
                  : section.classSection,
              });
            });
          });
          setSectionOptions(options);

          // Compute colors for all sections
          const colors = getSectionColors(options);
          setSectionColors(colors);
        }
      } catch (error) {
        console.error("Error loading sections:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  // Load roadmap data when sections change
  useEffect(() => {
    if (selectedSections.length === 0) {
      setRoadmapData(new Map());
      return;
    }

    const loadRoadmapData = async () => {
      // Find sections that need loading
      const sectionsToLoad = selectedSections.filter(
        (sectionId) => !roadmapData.has(sectionId)
      );

      if (sectionsToLoad.length === 0) return;

      // Mark sections as loading
      setLoadingSectionIds((prev) => {
        const next = new Set(prev);
        sectionsToLoad.forEach((id) => next.add(id));
        return next;
      });

      try {
        const result = await getRoadmapCompletionsBySection(sectionsToLoad);

        if (result.success && result.data) {
          setRoadmapData((prev) => {
            const next = new Map(prev);
            result.data.forEach((sectionData) => {
              next.set(sectionData.sectionId, sectionData);
            });
            return next;
          });
        }
      } catch (error) {
        console.error("Error loading roadmap data:", error);
      } finally {
        setLoadingSectionIds((prev) => {
          const next = new Set(prev);
          sectionsToLoad.forEach((id) => next.delete(id));
          return next;
        });
      }
    };

    loadRoadmapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSections]);

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
