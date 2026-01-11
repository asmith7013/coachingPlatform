"use client";

import { useState, useMemo } from "react";
import { MultiSectionSelector } from "@/app/scm/podsie/bulk-sync/components";
import { LoadingState } from "../progress/components/EmptyStates";
import { useSectionOptions } from "@/hooks/scm";
import { getScopeTagForSection } from "../progress/utils/sectionHelpers";
import { SectionAssessmentAccordion } from "./components/SectionAssessmentAccordion";
import { ScopeSummaryTable } from "./components/ScopeSummaryTable";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

export default function AssessmentPage() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // Data hooks
  const {
    sectionOptions: rawSectionOptions,
    sectionColors,
    loading: loadingSections,
    error: sectionsError,
  } = useSectionOptions();

  // Transform section options to local type
  const sectionOptions: SectionOption[] = useMemo(() => {
    return rawSectionOptions.map((opt) => ({
      id: opt.id,
      school: opt.school,
      classSection: opt.classSection,
      displayName: opt.displayName,
    }));
  }, [rawSectionOptions]);

  // Toggle section selection (multi-select)
  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Get selected sections in display order (sorted by scope tag, then school, then section)
  const selectedSectionsData = useMemo(() => {
    return sectionOptions
      .filter((opt) => selectedSections.includes(opt.id))
      .sort((a, b) => {
        const scopeA = getScopeTagForSection(a.classSection);
        const scopeB = getScopeTagForSection(b.classSection);
        if (scopeA !== scopeB) return scopeA.localeCompare(scopeB);
        if (a.school !== b.school) return a.school.localeCompare(b.school);
        return a.classSection.localeCompare(b.classSection);
      });
  }, [sectionOptions, selectedSections]);

  // Group sections by scope tag for overview display
  const sectionsByScope = useMemo(() => {
    const groups = new Map<string, typeof selectedSectionsData>();
    selectedSectionsData.forEach((section) => {
      const scope = getScopeTagForSection(section.classSection);
      if (!groups.has(scope)) {
        groups.set(scope, []);
      }
      groups.get(scope)!.push(section);
    });
    return groups;
  }, [selectedSectionsData]);

  // Render: Loading
  if (loadingSections) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: "1600px" }}>
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Unit Assessments</h1>
          <p className="text-gray-600 text-sm mt-1">
            View and compare unit assessment scores across students
          </p>
        </div>

        {/* Section Selector */}
        <div className="mb-6">
          <MultiSectionSelector
            sections={sectionOptions}
            selectedSections={selectedSections}
            onToggle={handleToggleSection}
            sectionColors={sectionColors}
          />
        </div>

        {/* Error State */}
        {sectionsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{sectionsError}</p>
          </div>
        )}

        {/* No Sections Selected */}
        {selectedSections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Select sections above to view unit assessments</p>
          </div>
        )}

        {/* Overview Section with Summary Cards */}
        {selectedSectionsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-bold text-gray-700">Key:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  &lt;40%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  40-59%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  60-79%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  80%+
                </span>
              </div>
            </div>

            {/* Summary Tables - one per scope tag */}
            <div className="space-y-6">
              {Array.from(sectionsByScope.entries()).map(([scopeTag, sections]) => (
                <ScopeSummaryTable
                  key={scopeTag}
                  scopeTag={scopeTag}
                  sections={sections}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section Accordions */}
        {selectedSectionsData.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Progress</h2>
            {selectedSectionsData.map((sectionOpt) => (
              <SectionAssessmentAccordion
                key={sectionOpt.id}
                sectionId={sectionOpt.id}
                sectionName={sectionOpt.classSection}
                school={sectionOpt.school}
                color={sectionColors.get(sectionOpt.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
