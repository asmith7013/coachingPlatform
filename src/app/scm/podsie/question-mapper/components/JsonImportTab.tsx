"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  saveQuestionMap,
  getQuestionMap,
} from "@/app/actions/scm/podsie/podsie-question-map";
import { QuestionMapResults } from "./QuestionMapResults";
import { transformCurriculumToQuestionMap } from "./utils";
import type { CurriculumData, PodsieQuestionMap, ExistingMapping } from "./types";

interface ShowToastParams {
  title: string;
  description: string;
  variant: "success" | "error" | "warning";
  icon: React.ComponentType<{ className?: string }>;
}

interface JsonImportTabProps {
  showToast: (params: ShowToastParams) => void;
}

export function JsonImportTab({ showToast }: JsonImportTabProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonAssignmentId, setJsonAssignmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignmentName, setAssignmentName] = useState("");
  const [questionMap, setQuestionMap] = useState<PodsieQuestionMap[]>([]);
  const [existingMapping, setExistingMapping] =
    useState<ExistingMapping | null>(null);

  // Handle JSON import
  const handleJsonImport = async () => {
    if (!jsonInput.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please paste JSON data",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    if (!jsonAssignmentId.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter an assignment ID",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    setLoading(true);
    setQuestionMap([]);
    setAssignmentName("");
    setExistingMapping(null);

    try {
      // Parse JSON
      const curriculumData: CurriculumData = JSON.parse(jsonInput);

      // Validate structure
      if (
        !curriculumData.assignment ||
        !curriculumData.questions ||
        !curriculumData.summary
      ) {
        throw new Error(
          "Invalid JSON structure. Expected assignment, questions, and summary fields."
        );
      }

      // Check for existing mapping
      const existingResult = await getQuestionMap(jsonAssignmentId.trim());

      if (existingResult.success && existingResult.data) {
        setExistingMapping({
          assignmentId: existingResult.data.assignmentId,
          assignmentName: existingResult.data.assignmentName,
        });
        showToast({
          title: "Existing Mapping Found",
          description: `Found existing mapping for: ${existingResult.data.assignmentName}`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      }

      // Transform curriculum data to question map
      const transformedQuestionMap =
        transformCurriculumToQuestionMap(curriculumData);

      setAssignmentName(curriculumData.assignment.title);
      setQuestionMap(transformedQuestionMap);

      showToast({
        title: "JSON Imported",
        description: `Loaded ${curriculumData.summary.totalRootQuestions} root questions with ${curriculumData.summary.totalVariations} variations`,
        variant: "success",
        icon: CheckCircleIcon,
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      showToast({
        title: "Import Failed",
        description:
          error instanceof Error ? error.message : "Invalid JSON format",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      !jsonAssignmentId.trim() ||
      !assignmentName ||
      questionMap.length === 0
    ) {
      showToast({
        title: "Validation Error",
        description: "Please generate a question map first",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    // Confirm if overwriting existing
    if (existingMapping) {
      const confirmed = window.confirm(
        `This will overwrite the existing mapping for "${existingMapping.assignmentName}". Continue?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = await saveQuestionMap({
        assignmentId: jsonAssignmentId.trim(),
        assignmentName,
        questionMap,
        totalQuestions: questionMap.length,
        createdBy: "json-import",
      });

      if (result.success) {
        showToast({
          title: existingMapping ? "Mapping Updated" : "Mapping Saved",
          description: `Successfully ${existingMapping ? "updated" : "saved"} question map for ${assignmentName}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
        setExistingMapping({
          assignmentId: jsonAssignmentId.trim(),
          assignmentName,
        });
      } else {
        showToast({
          title: "Save Failed",
          description: result.error || "Failed to save question map",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error saving question map:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Podsie Assignment ID
            </label>
            <input
              type="text"
              value={jsonAssignmentId}
              onChange={(e) => setJsonAssignmentId(e.target.value)}
              placeholder="e.g., 19404"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the Podsie assignment ID for this mapping
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum JSON Data
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Paste JSON from podsie-curriculum here...\n\n{\n  "assignment": {\n    "external_id": "...",\n    "title": "...",\n    ...\n  },\n  "questions": [...],\n  "summary": {...}\n}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              rows={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the JSON export from podsie-curriculum containing assignment
              info, questions, and variations
            </p>
          </div>

          <button
            onClick={handleJsonImport}
            disabled={loading || !jsonInput.trim() || !jsonAssignmentId.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className="w-5 h-5" />
                <span>Import JSON</span>
              </>
            )}
          </button>

          {existingMapping && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Existing mapping found for &quot;
                {existingMapping.assignmentName}&quot;. Saving will overwrite
                it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex justify-center items-center">
            <Spinner size="lg" variant="primary" />
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && questionMap.length > 0 && (
        <QuestionMapResults
          assignmentId={jsonAssignmentId}
          assignmentName={assignmentName}
          questionMap={questionMap}
          saving={saving}
          onSave={handleSave}
        />
      )}

      {/* Empty State */}
      {!loading && questionMap.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">
            Enter an assignment ID and paste curriculum JSON data to import
          </p>
        </div>
      )}
    </>
  );
}
