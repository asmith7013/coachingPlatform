import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface SectionOption {
  id: string;
  school: string;
  displayName: string;
}

interface SectionSelectorProps {
  sections: SectionOption[];
  selectedSections: string[];
  onToggle: (sectionId: string) => void;
  sectionColors: Map<string, string>;
  onExportClick?: () => void;
}

export function SectionSelector({
  sections,
  selectedSections,
  onToggle,
  sectionColors,
  onExportClick,
}: SectionSelectorProps) {
  // Group sections by school
  const sectionsBySchool = sections.reduce(
    (acc, section) => {
      if (!acc[section.school]) {
        acc[section.school] = [];
      }
      acc[section.school].push(section);
      return acc;
    },
    {} as Record<string, SectionOption[]>,
  );

  // Handler for select all checkbox
  const handleSelectAll = (school: string, schoolSections: SectionOption[]) => {
    const schoolSectionIds = schoolSections.map((s) => s.id);
    const allSelected = schoolSectionIds.every((id) =>
      selectedSections.includes(id),
    );

    // If all are selected, deselect all. Otherwise, select all.
    schoolSectionIds.forEach((id) => {
      const isSelected = selectedSections.includes(id);
      if (allSelected && isSelected) {
        onToggle(id); // Deselect
      } else if (!allSelected && !isSelected) {
        onToggle(id); // Select
      }
    });
  };

  // Check if all sections in a school are selected
  const isAllSelected = (schoolSections: SectionOption[]) => {
    return schoolSections.every((s) => selectedSections.includes(s.id));
  };

  // Check if some (but not all) sections are selected
  const isSomeSelected = (schoolSections: SectionOption[]) => {
    const selectedCount = schoolSections.filter((s) =>
      selectedSections.includes(s.id),
    ).length;
    return selectedCount > 0 && selectedCount < schoolSections.length;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="sr-only">Select Sections</h2>
      <div className="flex gap-8 items-start">
        {/* School filter cards */}
        {Object.entries(sectionsBySchool).map(([school, schoolSections]) => (
          <div key={school} className="border border-gray-200 rounded-lg p-4">
            <fieldset>
              {/* School title and Select All checkbox on same row */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <legend className="text-sm font-medium text-gray-900">
                  {school}
                </legend>
                <div className="flex gap-2 items-center">
                  <div className="flex h-5 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        id={`select-all-${school}`}
                        type="checkbox"
                        checked={isAllSelected(schoolSections)}
                        ref={(input) => {
                          if (input) {
                            input.indeterminate =
                              isSomeSelected(schoolSections);
                          }
                        }}
                        onChange={() => handleSelectAll(school, schoolSections)}
                        className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-checked:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-indeterminate:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <label
                    htmlFor={`select-all-${school}`}
                    className="text-xs text-gray-600 cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                {schoolSections.map((section, optionIdx) => {
                  const sectionColor =
                    sectionColors.get(section.id) || "#6B7280";
                  return (
                    <div key={section.id} className="flex gap-3">
                      <div className="flex h-5 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id={`${school}-${optionIdx}`}
                            type="checkbox"
                            checked={selectedSections.includes(section.id)}
                            onChange={() => onToggle(section.id)}
                            className="col-start-1 row-start-1 appearance-none rounded-sm border-2 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer"
                            style={{
                              borderColor: sectionColor,
                              backgroundColor: selectedSections.includes(
                                section.id,
                              )
                                ? sectionColor
                                : "white",
                            }}
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <label
                        htmlFor={`${school}-${optionIdx}`}
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        {section.displayName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ))}

        {/* Export CSV button */}
        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 h-fit text-sm font-medium rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
