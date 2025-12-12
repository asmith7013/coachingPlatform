"use client";

import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Spinner } from "@/components/core/feedback/Spinner";
import type { SectionConfigOption } from "./types";

interface CopyToSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  copying: boolean;
  sourceSection: SectionConfigOption;
  otherSections: SectionConfigOption[];
  copyTargets: Set<string>;
  setCopyTargets: React.Dispatch<React.SetStateAction<Set<string>>>;
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
}: CopyToSectionsModalProps) {
  if (otherSections.length === 0) {
    return (
      <Dialog open={isOpen} onClose={onClose} title="Copy Schedule To Other Sections" size="sm" padding="none">
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 text-center py-4">No other sections available to copy to.</p>
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

  const allSelected = otherSections.every(s => copyTargets.has(`${s.school}|${s.classSection}`));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <div>
          <span>Copy Schedule To Other Sections</span>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Copy the schedule from <span className="font-medium">{sourceSection.school} - {sourceSection.classSection}</span> to the selected sections below.
          </p>
        </div>
      }
      size="sm"
      padding="none"
    >
      <div className="px-6 py-4 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {/* Select All */}
          <label className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setCopyTargets(new Set(otherSections.map(s => `${s.school}|${s.classSection}`)));
                } else {
                  setCopyTargets(new Set());
                }
              }}
              disabled={copying}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium text-gray-700">Select All</span>
          </label>

          {otherSections.map((section) => {
            const key = `${section.school}|${section.classSection}`;
            const isChecked = copyTargets.has(key);

            return (
              <label
                key={key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
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
                  <div className="font-medium text-gray-900">
                    {section.school} - {section.classSection}
                  </div>
                  {section.teacher && (
                    <div className="text-sm text-gray-500">{section.teacher}</div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {copyTargets.size} section{copyTargets.size !== 1 ? 's' : ''} selected
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
            onClick={onCopy}
            disabled={copying || copyTargets.size === 0}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {copying ? (
              <>
                <Spinner size="xs" variant="default" className="border-white border-t-blue-200" />
                Copying...
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4" />
                Copy to {copyTargets.size} Section{copyTargets.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
