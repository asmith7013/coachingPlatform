import { SectionRadioGroup } from "@/components/core/inputs/SectionRadioGroup";
import { UnitOption } from "../types";

interface FiltersSectionProps {
  // Section filter
  selectedSection: string;
  sectionGroups: Array<{ school: string; sections: string[] }>;
  onSectionChange: (section: string) => void;

  // Unit filter
  selectedUnit: number | null;
  units: UnitOption[];
  loadingUnits: boolean;
  onUnitChange: (unit: number | null) => void;

  // Lesson section filter
  selectedLessonSection: string;
  sectionOptions: Array<{ id: string; name: string; count: number; inStock: boolean }>;
  loadingLessons: boolean;
  onLessonSectionChange: (section: string) => void;
}

export function FiltersSection({
  selectedSection,
  sectionGroups,
  onSectionChange,
  selectedUnit,
  units,
  loadingUnits,
  onUnitChange,
  selectedLessonSection,
  sectionOptions,
  loadingLessons,
  onLessonSectionChange,
}: FiltersSectionProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Class Section and Unit (50% each) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Class Section */}
        <div>
          <label
            htmlFor="section-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Class Section
          </label>
          <select
            id="section-filter"
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !selectedSection
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300"
            }`}
          >
            <option value="">Select Section</option>
            {sectionGroups.map((group) => (
              <optgroup key={group.school} label={group.school}>
                {group.sections.map((section) => (
                  <option key={`${group.school}-${section}`} value={section}>
                    {section}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label
            htmlFor="unit-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Unit
          </label>
          <select
            id="unit-filter"
            value={selectedUnit ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onUnitChange(val ? parseInt(val, 10) : null);
            }}
            disabled={!selectedSection || units.length === 0 || loadingUnits}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedSection && selectedUnit === null && units.length > 0
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300"
            } ${!selectedSection || units.length === 0 || loadingUnits ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {!selectedSection
                ? "Select section first"
                : loadingUnits
                ? "Loading units..."
                : units.length === 0
                ? "No units available"
                : "Select Unit"}
            </option>
            {/* For section 802, group by grade type */}
            {selectedSection === "802" ? (
              <>
                {/* Algebra 1 (Grade 8) Units */}
                {units.filter(u => u.grade === "8").length > 0 && (
                  <optgroup label="Algebra 1 (Grade 8)">
                    {units
                      .filter(u => u.grade === "8")
                      .map((unit) => (
                      <option key={`alg1-g8-${unit.unitNumber}`} value={unit.unitNumber}>
                        {unit.unitName}
                      </option>
                    ))}
                </optgroup>
              )}
              {/* Algebra 1 (Algebra Grade) Units */}
              {units.filter(u => u.grade !== "8").length > 0 && (
                <optgroup label="Algebra 1">
                  {units
                    .filter(u => u.grade !== "8")
                    .map((unit) => (
                      <option key={`alg1-galg1-${unit.unitNumber}`} value={unit.unitNumber}>
                        {unit.unitName}
                      </option>
                    ))}
                </optgroup>
              )}
            </>
          ) : (
            /* Regular units for other sections */
            units.map((unit) => (
              <option key={unit.unitNumber} value={unit.unitNumber}>
                {unit.unitName}
              </option>
            ))
          )}
        </select>
        </div>
      </div>

      {/* Row 2: Section of Unit (100% width, only show when section and unit are selected) */}
      {selectedSection && selectedUnit !== null && (
        <div>
          <SectionRadioGroup
            options={sectionOptions}
            value={selectedLessonSection}
            onChange={onLessonSectionChange}
            label="Section of Unit"
            disabled={loadingLessons}
            loading={loadingLessons}
          />
          {!loadingLessons && sectionOptions.length === 0 && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-2xl">ℹ️</div>
                <div>
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    No lessons found for Unit {selectedUnit}
                  </div>
                  <div className="text-sm text-blue-700">
                    This unit doesn&apos;t have any assigned lessons yet. Try selecting a different unit or check the section configuration.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
