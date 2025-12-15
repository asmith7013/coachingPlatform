import React, { useState } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { DailyVelocityStats, StudentDailyData } from "@/app/actions/scm/podsie/velocity/velocity";
import {
  generateClassVelocityCsv,
  generateStudentVelocityCsv,
  downloadCsv,
  generateVelocityCsvFilename,
} from "../utils/exportCsv";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionOption[];
  selectedSections: string[];
  velocityData: Map<string, DailyVelocityStats[]>;
  detailData: Map<string, StudentDailyData[]>;
  startDate: string;
  endDate: string;
}

export function ExportCsvModal({
  isOpen,
  onClose,
  sections,
  selectedSections,
  velocityData,
  detailData,
  startDate: initialStartDate,
  endDate: initialEndDate,
}: ExportCsvModalProps) {
  const [exportSections, setExportSections] = useState<Set<string>>(
    () => new Set(selectedSections)
  );
  const [exportingClass, setExportingClass] = useState(false);
  const [exportingStudent, setExportingStudent] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(initialStartDate);
  const [exportEndDate, setExportEndDate] = useState(initialEndDate);

  // Reset modal state when opened
  React.useEffect(() => {
    if (isOpen) {
      setExportSections(new Set(selectedSections));
      setExportStartDate(initialStartDate);
      setExportEndDate(initialEndDate);
    }
  }, [isOpen, selectedSections, initialStartDate, initialEndDate]);

  if (!isOpen) return null;

  // Group sections by school
  const sectionsBySchool = sections.reduce((acc, section) => {
    if (!acc[section.school]) {
      acc[section.school] = [];
    }
    acc[section.school].push(section);
    return acc;
  }, {} as Record<string, SectionOption[]>);

  const toggleSection = (sectionId: string) => {
    setExportSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleSchool = (schoolSections: SectionOption[]) => {
    const schoolSectionIds = schoolSections.map((s) => s.id);
    const allSelected = schoolSectionIds.every((id) => exportSections.has(id));

    setExportSections((prev) => {
      const next = new Set(prev);
      schoolSectionIds.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  const selectAll = () => {
    setExportSections(new Set(sections.map((s) => s.id)));
  };

  const deselectAll = () => {
    setExportSections(new Set());
  };

  const handleExportClass = () => {
    if (exportSections.size === 0) return;

    setExportingClass(true);

    try {
      const sectionsToExport = sections.filter((s) => exportSections.has(s.id));
      const classCsv = generateClassVelocityCsv(
        sectionsToExport,
        velocityData,
        exportStartDate,
        exportEndDate
      );
      const classFilename = generateVelocityCsvFilename(
        'class',
        sectionsToExport.length,
        exportStartDate,
        exportEndDate
      );
      downloadCsv(classCsv, classFilename);
    } catch (error) {
      console.error('Error exporting class CSV:', error);
    } finally {
      setExportingClass(false);
    }
  };

  const handleExportStudent = () => {
    if (exportSections.size === 0) return;

    setExportingStudent(true);

    try {
      const sectionsToExport = sections.filter((s) => exportSections.has(s.id));
      const studentCsv = generateStudentVelocityCsv(
        sectionsToExport,
        detailData,
        exportStartDate,
        exportEndDate
      );
      const studentFilename = generateVelocityCsvFilename(
        'student',
        sectionsToExport.length,
        exportStartDate,
        exportEndDate
      );
      downloadCsv(studentCsv, studentFilename);
    } catch (error) {
      console.error('Error exporting student CSV:', error);
    } finally {
      setExportingStudent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Export Velocity Data</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Section Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sections to Include
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(sectionsBySchool).map(([school, schoolSections]) => {
                  const allSchoolSelected = schoolSections.every((s) =>
                    exportSections.has(s.id)
                  );
                  const someSchoolSelected =
                    schoolSections.some((s) => exportSections.has(s.id)) &&
                    !allSchoolSelected;

                  return (
                    <div
                      key={school}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      {/* School header with select all */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-900">
                          {school}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allSchoolSelected}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = someSchoolSelected;
                              }
                            }}
                            onChange={() => toggleSchool(schoolSections)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-xs text-gray-600">All</span>
                        </label>
                      </div>

                      {/* Section checkboxes */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {schoolSections.map((section) => (
                          <label
                            key={section.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={exportSections.has(section.id)}
                              onChange={() => toggleSection(section.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 truncate">
                              {section.classSection}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Start:</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">End:</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Initialized from the velocity graph date range
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExportClass}
              disabled={exportingClass || exportSections.size === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                exportingClass || exportSections.size === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {exportingClass ? 'Exporting...' : 'Class Data'}
            </button>
            <button
              type="button"
              onClick={handleExportStudent}
              disabled={exportingStudent || exportSections.size === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                exportingStudent || exportSections.size === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {exportingStudent ? 'Exporting...' : 'Student Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
