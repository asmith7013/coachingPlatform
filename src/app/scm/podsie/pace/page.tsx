"use client";

import { useState, useMemo, useEffect } from "react";
import { Spinner } from "@/components/core/feedback/Spinner";
import { MultiSectionSelector } from "@/app/scm/podsie/bulk-sync/components";
import type { CurrentUnitInfo } from "@/app/actions/calendar/current-unit";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { SectionPacingCard, SectionSummaryCard } from "./components";
import { useSectionOptions, useCurrentUnits } from "@/hooks/scm";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
  specialPopulations?: string[];
}

const SCHOOL_YEAR = "2025-2026";

export default function PacePage() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [excludeRampUps, setExcludeRampUps] = useState(false);

  // Data fetching with React Query hooks
  const {
    sectionOptions: rawSectionOptions,
    sectionColors,
    loading: loadingSections,
    error: sectionsError,
  } = useSectionOptions();

  const { currentUnits, error: unitsError } = useCurrentUnits(SCHOOL_YEAR);

  // Transform section options to local type
  const sectionOptions: SectionOption[] = useMemo(() => {
    return rawSectionOptions.map((opt) => ({
      id: opt.id,
      school: opt.school,
      classSection: opt.classSection,
      displayName: opt.displayName,
      specialPopulations: (opt as { specialPopulations?: string[] }).specialPopulations,
    }));
  }, [rawSectionOptions]);

  const loading = loadingSections;
  const error = sectionsError || unitsError;

  // Toggle section selection
  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Get current unit info for a section
  const getCurrentUnitForSection = (sectionOpt: SectionOption): CurrentUnitInfo | null => {
    return (
      currentUnits.find(
        (cu) => cu.school === sectionOpt.school && cu.classSection === sectionOpt.classSection
      ) || null
    );
  };

  // Auto-set excludeRampUps when any selected section is past ramp ups
  useEffect(() => {
    if (selectedSections.length === 0 || currentUnits.length === 0) return;

    // Check if any selected section is past ramp ups (currentSection is not "Ramp Up")
    const anyPastRampUps = selectedSections.some((sectionId) => {
      const sectionOpt = sectionOptions.find((s) => s.id === sectionId);
      if (!sectionOpt) return false;

      const unitInfo = currentUnits.find(
        (cu) => cu.school === sectionOpt.school && cu.classSection === sectionOpt.classSection
      );

      // If currentSection exists and is not "Ramp Up", section is past ramp ups
      return unitInfo?.currentSection && unitInfo.currentSection !== "Ramp Up";
    });

    if (anyPastRampUps) {
      setExcludeRampUps(true);
    }
  }, [selectedSections, currentUnits, sectionOptions]);

  // Get selected sections in display order (sorted by school, then section number)
  const selectedSectionsData = useMemo(() => {
    return sectionOptions
      .filter((opt) => selectedSections.includes(opt.id))
      .sort((a, b) => {
        if (a.school !== b.school) return a.school.localeCompare(b.school);
        return a.classSection.localeCompare(b.classSection);
      });
  }, [sectionOptions, selectedSections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto" style={{ maxWidth: "1600px" }}>
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-2" />
            <p className="text-gray-600">Loading sections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: "1600px" }}>
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pace & Progress</h1>
          <p className="text-gray-600 text-sm mt-1">
            View pacing progress across multiple sections
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Sections Selected */}
        {selectedSections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              Select sections above to view pacing progress
            </p>
          </div>
        )}

        {/* Overview Card with Summary Cards */}
        {selectedSectionsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Header row with title, legend, and toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="font-bold text-gray-700">Key:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Far Behind
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    Behind
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    On Pace
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Ahead
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Far Ahead
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Complete
                  </span>
                </div>
                <ToggleSwitch
                  checked={excludeRampUps}
                  onChange={setExcludeRampUps}
                  label="Exclude Ramp Ups"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedSectionsData.map((sectionOpt) => (
                <SectionSummaryCard
                  key={`summary-${sectionOpt.id}`}
                  section={sectionOpt.classSection}
                  school={sectionOpt.school}
                  currentUnitInfo={getCurrentUnitForSection(sectionOpt)}
                  specialPopulations={sectionOpt.specialPopulations}
                  excludeRampUps={excludeRampUps}
                />
              ))}
            </div>
          </div>
        )}

        {/* Detailed Pacing Cards for Selected Sections */}
        {selectedSectionsData.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Progress</h2>
            {selectedSectionsData.map((sectionOpt) => (
              <SectionPacingCard
                key={sectionOpt.id}
                section={sectionOpt.classSection}
                school={sectionOpt.school}
                currentUnitInfo={getCurrentUnitForSection(sectionOpt)}
                specialPopulations={sectionOpt.specialPopulations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
