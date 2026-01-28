"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Spinner } from "@/components/core/feedback/Spinner";
import type { SectionConfigOption, UnitScheduleLocal } from "./types";

interface AddDayOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    date: string,
    name: string,
    shiftSchedule: boolean,
    targetSections: Array<{ school: string; classSection: string }>,
    hasMathClass: boolean
  ) => Promise<void>;
  saving: boolean;
  currentSection: SectionConfigOption;
  allSections: SectionConfigOption[];
  unitSchedules: UnitScheduleLocal[];
}

export function AddDayOffModal({
  isOpen,
  onClose,
  onSubmit,
  saving,
  currentSection,
  allSections,
  unitSchedules,
}: AddDayOffModalProps) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [shiftSchedule, setShiftSchedule] = useState(true);
  const [hasMathClass, setHasMathClass] = useState(false); // Default: no math class
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set([`${currentSection.school}|${currentSection.classSection}`])
  );

  // Check if the selected date falls within any scheduled range
  const dateInScheduledRange = useMemo(() => {
    if (!date) return false;
    for (const unit of unitSchedules) {
      for (const section of unit.sections) {
        if (section.startDate && section.endDate) {
          if (date >= section.startDate && date <= section.endDate) {
            return true;
          }
        }
      }
    }
    return false;
  }, [date, unitSchedules]);

  // Auto-set shift based on hasMathClass and date range
  // If hasMathClass is true, no shift needed (math happens, schedule continues)
  // If hasMathClass is false and in range, shift forward
  useEffect(() => {
    if (hasMathClass) {
      setShiftSchedule(false); // Math happens, no shift needed
    } else {
      setShiftSchedule(dateInScheduledRange); // No math, shift if in range
    }
  }, [hasMathClass, dateInScheduledRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return;

    const targets = Array.from(selectedSections).map(key => {
      const [school, classSection] = key.split('|');
      return { school, classSection };
    });

    await onSubmit(date, name, shiftSchedule, targets, hasMathClass);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <div>
          <span>Add Section Event</span>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Add an event for {currentSection.school} - {currentSection.classSection}
          </p>
        </div>
      }
      size="sm"
      padding="none"
    >
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Name of Event */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name of Event</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., State Testing, Pop Quiz, Assembly"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Math Class Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Does math class happen?</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                !hasMathClass ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="mathClass"
                  checked={!hasMathClass}
                  onChange={() => setHasMathClass(false)}
                  className="h-4 w-4 text-gray-600 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">No Math Class</div>
                  <div className="text-xs text-gray-500">Testing, assembly, no school</div>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                hasMathClass ? 'border-gray-600 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="mathClass"
                  checked={hasMathClass}
                  onChange={() => setHasMathClass(true)}
                  className="h-4 w-4 text-gray-600 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Math Class Happens</div>
                  <div className="text-xs text-gray-500">Pop quiz, special lesson</div>
                </div>
              </label>
            </div>
          </div>

          {/* Sections checkboxes */}
          {allSections.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Sections</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allSections.map((section) => {
                  const key = `${section.school}|${section.classSection}`;
                  const isChecked = selectedSections.has(key);
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newSet = new Set(selectedSections);
                          if (e.target.checked) {
                            newSet.add(key);
                          } else {
                            newSet.delete(key);
                          }
                          setSelectedSections(newSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        {section.school} - {section.classSection}
                        {section.teacher && <span className="text-gray-400"> ({section.teacher})</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shift schedule checkbox - only show if no math class */}
          {!hasMathClass && (
            <div className="pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftSchedule}
                  onChange={(e) => setShiftSchedule(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Shift schedule forward by 1 day</span>
              </label>
              {dateInScheduledRange && (
                <p className="text-xs text-amber-600 mt-1 ml-6">
                  This date falls within a scheduled unit section
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !date || !name || selectedSections.size === 0}
            className="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size="xs" variant="default" className="border-white border-t-amber-200" />
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Add Event
              </>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
