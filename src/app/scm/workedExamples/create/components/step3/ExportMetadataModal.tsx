"use client";

import { useState, useEffect } from "react";

type GradeLevel = "6" | "7" | "8" | "Algebra 1";

export interface ExportMetadata {
  title: string;
  gradeLevel: GradeLevel | null;
  unitNumber: number | null;
  lessonNumber: number | null;
  mathStandard: string;
  isPublic: boolean;
}

interface ExportMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metadata: ExportMetadata) => void;
  initialValues: ExportMetadata;
}

export function ExportMetadataModal({
  isOpen,
  onClose,
  onConfirm,
  initialValues,
}: ExportMetadataModalProps) {
  const [formData, setFormData] = useState<ExportMetadata>(initialValues);

  // Reset form when modal opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const isValid = formData.title.trim() && formData.gradeLevel;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Export to Slides
            </h3>
            <p className="text-sm text-gray-500">
              Review deck metadata before exporting
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Deck title"
            />
          </div>

          {/* Grade Level */}
          <div>
            <label
              htmlFor="gradeLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Grade Level <span className="text-red-500">*</span>
            </label>
            <select
              id="gradeLevel"
              value={formData.gradeLevel || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gradeLevel: (e.target.value as GradeLevel) || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select grade...</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="Algebra 1">Algebra 1</option>
            </select>
          </div>

          {/* Unit and Lesson in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="unitNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit Number
              </label>
              <input
                id="unitNumber"
                type="number"
                value={formData.unitNumber ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitNumber: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 4"
                min="1"
              />
            </div>
            <div>
              <label
                htmlFor="lessonNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lesson Number
              </label>
              <input
                id="lessonNumber"
                type="number"
                value={formData.lessonNumber ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lessonNumber: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
            </div>
          </div>

          {/* Math Standard */}
          <div>
            <label
              htmlFor="mathStandard"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Math Standard
            </label>
            <input
              id="mathStandard"
              type="text"
              value={formData.mathStandard}
              onChange={(e) =>
                setFormData({ ...formData, mathStandard: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 8.EE.8"
            />
          </div>

          {/* Public Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make this deck publicly visible
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
              </svg>
              Export to Slides
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
