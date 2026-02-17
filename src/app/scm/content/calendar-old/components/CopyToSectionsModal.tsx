"use client";

import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Spinner } from "@/components/core/feedback/Spinner";
import type { SectionConfigOption, UnitScheduleLocal } from "./types";

interface CopyToSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (unitNumbers: number[]) => void;
  copying: boolean;
  sourceSection: SectionConfigOption;
  otherSections: SectionConfigOption[];
  copyTargets: Set<string>;
  setCopyTargets: React.Dispatch<React.SetStateAction<Set<string>>>;
  unitSchedules: UnitScheduleLocal[];
  selectedUnits: Set<number>;
  setSelectedUnits: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export function CopyToSectionsModal({
  isOpen,
  onClose,
  onCopy,
  copying,
  sourceSection,
  otherSections,
  copyTargets,
  setCopyTargets,
  unitSchedules,
  selectedUnits,
  setSelectedUnits,
}: CopyToSectionsModalProps) {
  // Filter to only units that have dates set
  const unitsWithDates = unitSchedules.filter(
    (u) =>
      u.startDate ||
      u.endDate ||
      u.sections.some((s) => s.startDate || s.endDate),
  );

  if (otherSections.length === 0) {
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        title="Copy Schedule To Other Sections"
        size="sm"
        padding="none"
      >
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 text-center py-4">
            No other sections available to copy to.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </Dialog>
    );
  }

  const allSectionsSelected = otherSections.every((s) =>
    copyTargets.has(`${s.school}|${s.classSection}`),
  );
  const allUnitsSelected =
    unitsWithDates.length > 0 &&
    unitsWithDates.every((u) => selectedUnits.has(u.unitNumber));

  const handleCopy = () => {
    onCopy(Array.from(selectedUnits));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <div>
          <span>Copy Schedule To Other Sections</span>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Copy from{" "}
            <span className="font-medium">
              {sourceSection.school} - {sourceSection.classSection}
            </span>
          </p>
        </div>
      }
      size="md"
      padding="none"
    >
      <div className="px-6 py-4 space-y-4">
        {/* Unit Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Select Units to Copy
          </h4>
          {unitsWithDates.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No units have dates set yet.
            </p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {/* Select All Units */}
              <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allUnitsSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUnits(
                        new Set(unitsWithDates.map((u) => u.unitNumber)),
                      );
                    } else {
                      setSelectedUnits(new Set());
                    }
                  }}
                  disabled={copying}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All Units
                </span>
              </label>
              <div className="border-t border-gray-100 my-1" />
              {unitsWithDates.map((unit) => (
                <label
                  key={unit.unitKey}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUnits.has(unit.unitNumber)}
                    onChange={(e) => {
                      const newUnits = new Set(selectedUnits);
                      if (e.target.checked) {
                        newUnits.add(unit.unitNumber);
                      } else {
                        newUnits.delete(unit.unitNumber);
                      }
                      setSelectedUnits(newUnits);
                    }}
                    disabled={copying}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    Unit {unit.unitNumber}: {unit.unitName}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Target Section Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Select Target Sections
          </h4>
          <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {/* Select All Sections */}
            <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={allSectionsSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCopyTargets(
                      new Set(
                        otherSections.map(
                          (s) => `${s.school}|${s.classSection}`,
                        ),
                      ),
                    );
                  } else {
                    setCopyTargets(new Set());
                  }
                }}
                disabled={copying}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All Sections
              </span>
            </label>
            <div className="border-t border-gray-100 my-1" />
            {otherSections.map((section) => {
              const key = `${section.school}|${section.classSection}`;
              const isChecked = copyTargets.has(key);

              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                    isChecked ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newTargets = new Set(copyTargets);
                      if (e.target.checked) {
                        newTargets.add(key);
                      } else {
                        newTargets.delete(key);
                      }
                      setCopyTargets(newTargets);
                    }}
                    disabled={copying}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-900">
                      {section.school} - {section.classSection}
                    </span>
                    {section.teacher && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({section.teacher})
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {selectedUnits.size} unit{selectedUnits.size !== 1 ? "s" : ""} →{" "}
          {copyTargets.size} section{copyTargets.size !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={copying}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={
              copying || copyTargets.size === 0 || selectedUnits.size === 0
            }
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {copying ? (
              <>
                <Spinner
                  size="xs"
                  variant="default"
                  className="border-white border-t-blue-200"
                />
                Copying...
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
