"use client";

import { useState, useEffect, useMemo } from "react";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { Spinner } from "@/components/core/feedback/Spinner";
import { MultiSectionSelector } from "@/app/scm/podsie/bulk-sync/components";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getCurrentUnitsForAllSections, type CurrentUnitInfo } from "@/app/actions/calendar/current-unit";
import { getSectionColors } from "@/app/scm/podsie/velocity/utils/colors";
import { SectionPacingCard, SectionSummaryCard } from "./components";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

const SCHOOL_YEAR = "2025-2026";

export default function PacePage() {
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [currentUnits, setCurrentUnits] = useState<CurrentUnitInfo[]>([]);
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStudentNames, setShowStudentNames] = useState(false);

  // Load sections and current units on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [sectionsResult, currentUnitsResult] = await Promise.all([
          getAllSectionConfigs(),
          getCurrentUnitsForAllSections(SCHOOL_YEAR),
        ]);

        if (sectionsResult.success && sectionsResult.data) {
          const options: SectionOption[] = [];
          sectionsResult.data.forEach((schoolGroup) => {
            schoolGroup.sections.forEach((section) => {
              options.push({
                id: section.id,
                school: schoolGroup.school,
                classSection: section.classSection,
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

        if (currentUnitsResult.success && currentUnitsResult.data) {
          setCurrentUnits(currentUnitsResult.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load sections");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        {/* Page Title with Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pace & Progress</h1>
            <p className="text-gray-600 text-sm mt-1">
              View pacing progress across multiple sections
            </p>
          </div>
          <ToggleSwitch
            checked={showStudentNames}
            onChange={setShowStudentNames}
            label="Show Student Names"
          />
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
            {/* Header row with title and legend */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-bold text-gray-700">Key:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Far Behind
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  Previous Section
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  On Pace
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Next Section
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedSectionsData.map((sectionOpt) => (
                <SectionSummaryCard
                  key={`summary-${sectionOpt.id}`}
                  section={sectionOpt.classSection}
                  school={sectionOpt.school}
                  currentUnitInfo={getCurrentUnitForSection(sectionOpt)}
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
                showStudentNames={showStudentNames}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
