"use client";

import { useState, useEffect, useCallback } from "react";
import { getSectionOptions, getAssignmentContent } from "@actions/313/section-config";
import { updateQuestionMapping } from "./actions";
import type { AssignmentContent, PodsieQuestionMap } from "@zod-schema/313/section-config";

interface SectionOption {
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
}

interface QuestionRow {
  assignmentIndex: number;
  activityIndex: number;
  scopeAndSequenceId: string;
  podsieAssignmentId: string;
  unitLessonId: string;
  lessonName: string;
  activityType: 'sidekick' | 'mastery-check';
  questionMapIndex: number;
  questionData: PodsieQuestionMap;
}

export default function ManageConfigsPage() {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignmentContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    try {
      const result = await getSectionOptions();
      if (result.success && result.data) {
        setSections(result.data);
      }
    } catch (err) {
      console.error("Error loading sections:", err);
      setError("Failed to load sections");
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAssignmentContent(selectedSchool, selectedSection);
      if (result.success && result.data) {
        setAssignments(result.data);
      } else {
        setError(result.error || "Failed to load assignments");
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedSection]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (selectedSchool && selectedSection) {
      loadAssignments();
    }
  }, [selectedSchool, selectedSection, loadAssignments]);

  const handleToggleRoot = async (row: QuestionRow) => {
    const newIsRoot = !row.questionData.isRoot;

    try {
      const result = await updateQuestionMapping(
        selectedSchool,
        selectedSection,
        row.scopeAndSequenceId,
        row.podsieAssignmentId,
        row.questionMapIndex,
        {
          ...row.questionData,
          isRoot: newIsRoot,
          // If changing to root, clear variant fields
          rootQuestionId: newIsRoot ? undefined : row.questionData.rootQuestionId,
          variantNumber: newIsRoot ? undefined : row.questionData.variantNumber,
        }
      );

      if (result.success) {
        setSuccess(`Updated question ${row.questionData.questionId} to ${newIsRoot ? 'root' : 'variant'}`);
        await loadAssignments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to update");
      }
    } catch (err) {
      console.error("Error updating:", err);
      setError("Failed to update");
    }
  };

  const handleUpdateRootQuestion = async (row: QuestionRow, newRootQuestionId: string) => {
    try {
      const result = await updateQuestionMapping(
        selectedSchool,
        selectedSection,
        row.scopeAndSequenceId,
        row.podsieAssignmentId,
        row.questionMapIndex,
        {
          ...row.questionData,
          rootQuestionId: newRootQuestionId,
        }
      );

      if (result.success) {
        setSuccess(`Updated variant to link to root question ${newRootQuestionId}`);
        await loadAssignments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to update");
      }
    } catch (err) {
      console.error("Error updating:", err);
      setError("Failed to update");
    }
  };

  const filteredSections = selectedSchool
    ? sections.filter(s => s.school === selectedSchool)
    : sections;

  // Build question rows from assignments
  const questionRows: QuestionRow[] = [];
  assignments.forEach((assignment, assignmentIndex) => {
    assignment.podsieActivities.forEach((activity, activityIndex) => {
      if (activity.podsieQuestionMap && activity.podsieQuestionMap.length > 0) {
        activity.podsieQuestionMap.forEach((questionData, questionMapIndex) => {
          questionRows.push({
            assignmentIndex,
            activityIndex,
            scopeAndSequenceId: assignment.scopeAndSequenceId,
            podsieAssignmentId: activity.podsieAssignmentId,
            unitLessonId: assignment.unitLessonId,
            lessonName: assignment.lessonName,
            activityType: activity.activityType,
            questionMapIndex,
            questionData,
          });
        });
      }
    });
  });

  // Filter by unit if selected
  const filteredRows = selectedUnit
    ? questionRows.filter(row => {
        // Extract unit from unitLessonId (e.g., "3.15" -> "3", "4.RU1" -> "4")
        const unitMatch = row.unitLessonId.match(/^(\d+)\./);
        return unitMatch && unitMatch[1] === selectedUnit;
      })
    : questionRows;

  // Get unique units for filter
  const units = Array.from(new Set(
    questionRows.map(row => {
      const unitMatch = row.unitLessonId.match(/^(\d+)\./);
      return unitMatch ? unitMatch[1] : null;
    }).filter((unit): unit is string => unit !== null)
  )).sort((a, b) => parseInt(a) - parseInt(b));

  // Get all root questions for dropdown options
  const rootQuestions = questionRows.filter(row => row.questionData.isRoot);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1800px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Manage Question Mappings</h1>
          <p className="text-gray-600">
            Configure individual question mappings with explicit root/variant relationships
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* School Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedSection("");
                  setSelectedUnit("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a school...</option>
                <option value="IS313">IS313</option>
                <option value="PS19">PS19</option>
                <option value="X644">X644</option>
              </select>
            </div>

            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedUnit("");
                }}
                disabled={!selectedSchool}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a section...</option>
                {filteredSections.map((section) => (
                  <option key={`${section.school}-${section.classSection}`} value={section.classSection}>
                    {section.classSection} {section.teacher ? `(${section.teacher})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit (optional)
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={!selectedSchool || !selectedSection}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Units</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    Unit {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Questions Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : selectedSchool && selectedSection && filteredRows.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit/Lesson
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lesson Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Is Root
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Root Question ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant #
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRows.map((row, index) => {
                    // Get available root questions for this assignment
                    const availableRootQuestions = rootQuestions.filter(
                      r => r.podsieAssignmentId === row.podsieAssignmentId
                    );

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.unitLessonId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {row.lessonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.activityType === 'mastery-check'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.activityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.questionData.questionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {row.questionData.questionId}
                        </td>

                        {/* Is Root Toggle */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => handleToggleRoot(row)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              row.questionData.isRoot ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={row.questionData.isRoot}
                            title={row.questionData.isRoot ? 'Root question (click to make variant)' : 'Variant (click to make root)'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                row.questionData.isRoot ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Root Question ID - only show for variants */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!row.questionData.isRoot ? (
                            <select
                              value={row.questionData.rootQuestionId || ''}
                              onChange={(e) => handleUpdateRootQuestion(row, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                            >
                              <option value="">Select root...</option>
                              {availableRootQuestions.map((rootRow) => (
                                <option
                                  key={rootRow.questionData.questionId}
                                  value={rootRow.questionData.questionId}
                                >
                                  Q{rootRow.questionData.questionNumber}: {rootRow.questionData.questionId}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>

                        {/* Variant Number */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                          {row.questionData.variantNumber || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedSchool && selectedSection && !loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No question mappings found for this section</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">Select a school and section to view question mappings</p>
          </div>
        )}
      </div>
    </div>
  );
}
